// src/routes/submissions.js
const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const { prisma } = require('../services/db')
const { authenticate } = require('../middleware/auth')
const { submissionQueue } = require('../services/queue')

const VALID_LANGS = ['PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP']

// POST /api/submissions  — create and enqueue
router.post('/', authenticate, [
  body('problemId').isUUID(),
  body('language').isIn(VALID_LANGS),
  body('code').isString().isLength({ min: 1, max: 50000 }),
  body('sessionId').optional().isUUID(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { problemId, language, code, sessionId } = req.body

    // Verify problem exists
    const problem = await prisma.problem.findUnique({ where: { id: problemId } })
    if (!problem) return res.status(404).json({ error: 'Problem not found' })

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        userId: req.user.id,
        problemId,
        language,
        code,
        sessionId: sessionId || null,
        status: 'PENDING',
      },
    })

    // Enqueue for execution
    await submissionQueue.add('execute', {
      submissionId: submission.id,
      problemId,
      language,
      code,
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    }, {
      attempts: 2,
      backoff: { type: 'fixed', delay: 1000 },
      removeOnComplete: 100,
      removeOnFail: 50,
    })

    res.status(202).json({
      id: submission.id,
      status: submission.status,
      message: 'Submission queued for execution',
    })
  } catch (err) { next(err) }
})

// GET /api/submissions/:id  — poll status
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        results: {
          include: { },
          orderBy: { testCaseId: 'asc' },
        },
      },
    })

    if (!submission) return res.status(404).json({ error: 'Not found' })
    if (submission.userId !== req.user.id && req.user.role === 'CANDIDATE') {
      return res.status(403).json({ error: 'Forbidden' })
    }

    res.json(submission)
  } catch (err) { next(err) }
})

// GET /api/submissions?problemId=...  — history
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { problemId, sessionId, limit = 20 } = req.query
    const where = { userId: req.user.id }
    if (problemId) where.problemId = problemId
    if (sessionId) where.sessionId = sessionId

    const submissions = await prisma.submission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit), 50),
      select: {
        id: true, language: true, status: true,
        verdict: true, score: true, runtime: true,
        memory: true, createdAt: true,
      },
    })
    res.json(submissions)
  } catch (err) { next(err) }
})

module.exports = router
