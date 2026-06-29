// src/workers/executionWorker.js
const { execFile } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const os = require('os')
const { submissionQueue } = require('../services/queue')
const { prisma } = require('../services/db')
const { logger } = require('../services/logger')

const execFileAsync = promisify(execFile)

const IMAGES = {
  PYTHON:     'python:3.12-alpine',
  JAVASCRIPT: 'node:20-alpine',
  JAVA:       'eclipse-temurin:21-alpine',
  CPP:        'alpine:3.19',
}

const FILE_NAMES = {
  PYTHON:     'solution.py',
  JAVASCRIPT: 'solution.js',
  JAVA:       'Solution.java',
  CPP:        'solution.cpp',
}

const RUN_COMMANDS = {
  PYTHON:     (file) => `python3 /code/${file} < /code/input.txt`,
  JAVASCRIPT: (file) => `node /code/${file} < /code/input.txt`,
  JAVA:       (file) => `cd /code && javac ${file} && java Solution < /code/input.txt`,
  CPP:        (file) => `apk add --no-cache gcc g++ musl-dev 2>/dev/null && cd /code && g++ -O2 -o solution ${file} && ./solution < /code/input.txt`,
}

// ─── Main worker ─────────────────────────────────────────────────────────────
function startWorker() {
  submissionQueue.process('execute', 2, async (job) => {
    const { submissionId, problemId, language, code, timeLimit, memoryLimit } = job.data
    logger.info(`[Worker] Processing submission ${submissionId} (${language})`)

    await prisma.submission.update({
      where: { id: submissionId },
      data: { status: 'RUNNING' },
    })

    const testCases = await prisma.testCase.findMany({
      where: { problemId },
      orderBy: { order: 'asc' },
    })

    const results = []
    let verdict = 'AC'
    let totalRuntime = 0
    let compileError = null

    for (const tc of testCases) {
      const result = await runInDocker({ code, language, stdin: tc.input, timeLimit, memoryLimit })

      if (result.compileError) {
        compileError = result.stderr
        verdict = 'CE'
        break
      }

      const passed = normalise(result.stdout) === normalise(tc.expected)
      results.push({
        testCaseId: tc.id,
        passed,
        actualOutput: result.stdout?.slice(0, 2000),
        runtime: result.runtime,
        memory: null,
      })

      totalRuntime = Math.max(totalRuntime, result.runtime || 0)

      if (result.tle)             { verdict = 'TLE'; break }
      if (result.exitCode !== 0)  { verdict = 'RE';  break }
      if (!passed && verdict === 'AC') verdict = 'WA'
    }

    const passedCount = results.filter(r => r.passed).length
    const score = testCases.length ? passedCount / testCases.length : 0

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: 'COMPLETED',
        verdict: compileError ? 'CE' : verdict,
        score,
        runtime: totalRuntime || null,
        memory: null,
        error: compileError || null,
      },
    })

    if (results.length) {
      await prisma.testResult.createMany({
        data: results.map(r => ({ submissionId, ...r })),
        skipDuplicates: true,
      })
    }

    logger.info(`[Worker] Done ${submissionId} → ${verdict} (${(score * 100).toFixed(0)}%)`)
    return { verdict, score }
  })

  logger.info('[Worker] Execution worker started (concurrency: 2)')
}

// ─── Docker runner ───────────────────────────────────────────────────────────
async function runInDocker({ code, language, stdin, timeLimit, memoryLimit }) {
  const image = IMAGES[language]
  const fileName = FILE_NAMES[language]
  const runCmd = RUN_COMMANDS[language](fileName)

  // Write code and input to a temp directory, mount it into container
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'codeeval-'))
  try {
    fs.writeFileSync(path.join(tmpDir, fileName), code)
    fs.writeFileSync(path.join(tmpDir, 'input.txt'), stdin)

    // Convert Windows path to Docker-compatible path
    const mountPath = tmpDir.replace(/\\/g, '/').replace(/^([A-Z]):/, (_, d) => `//${d.toLowerCase()}`)

    const dockerArgs = [
      'run', '--rm',
      '--network', 'none',
      '--memory', `${memoryLimit || 256}m`,
      '--memory-swap', `${memoryLimit || 256}m`,
      '--pids-limit', '64',
      '-v', `${mountPath}:/code`,
      image,
      'sh', '-c', runCmd,
    ]

    const startTime = Date.now()
    const { stdout, stderr } = await execFileAsync('docker', dockerArgs, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    })

    const runtime = Date.now() - startTime
    const compileError = (language === 'JAVA' || language === 'CPP') && stderr?.includes('error')

    return { stdout: stdout.trim(), stderr: stderr.trim(), runtime, exitCode: 0, compileError }
  } catch (err) {
    const runtime = Date.now() - (err.startTime || Date.now())
    const tle = err.killed
    const ce = (language === 'JAVA' || language === 'CPP') && err.stderr?.includes('error')
    return { stdout: '', stderr: err.stderr?.trim() || err.message, runtime, exitCode: err.code ?? 1, tle, compileError: ce }
  } finally {
    // Cleanup temp dir
    try { fs.rmSync(tmpDir, { recursive: true }) } catch {}
  }
}

function normalise(str = '') {
  return str.trim().replace(/\r\n/g, '\n').replace(/\s+$/gm, '')
}

module.exports = { startWorker }
