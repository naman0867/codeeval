// src/pages/InterviewPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import api from '../api/client'

const LANGUAGES = [
  { id: 'PYTHON',     label: 'Python 3',   monaco: 'python' },
  { id: 'JAVASCRIPT', label: 'JavaScript', monaco: 'javascript' },
  { id: 'JAVA',       label: 'Java',       monaco: 'java' },
  { id: 'CPP',        label: 'C++',        monaco: 'cpp' },
]

const POLL_INTERVAL = 1500
const MAX_POLLS = 40

export default function InterviewPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const [lang, setLang] = useState('PYTHON')
  const [code, setCode] = useState('')
  const [submission, setSubmission] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('description')
  const [timeLeft, setTimeLeft] = useState(null)
  const [ended, setEnded] = useState(false)
  const pollRef = useRef(null)
  const timerRef = useRef(null)

  // Load session
  useEffect(() => {
    api.get(`/sessions/join/${token}`)
      .then(({ data }) => {
        setSession(data)
        // Set timer
        if (data.startedAt && data.duration) {
          const startedAt = new Date(data.startedAt).getTime()
          const durationMs = data.duration * 60 * 1000
          const remaining = Math.max(0, startedAt + durationMs - Date.now())
          setTimeLeft(Math.floor(remaining / 1000))
        }
        // Set starter code
        const starter = data.problem.starterCode?.find(s => s.language === lang)
        if (starter) setCode(starter.code)
      })
      .catch(err => setError(err.response?.data?.error || 'Session not found'))
  }, [token])

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { setEnded(true); return }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timerRef.current)
  }, [timeLeft])

  // Update code when language changes
  useEffect(() => {
    if (!session) return
    const starter = session.problem.starterCode?.find(s => s.language === lang)
    if (starter) setCode(starter.code)
  }, [lang])

  const pollResult = useCallback((id) => {
    let polls = 0
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/submissions/${id}`)
        setSubmission(data)
        if (data.status !== 'PENDING' && data.status !== 'RUNNING') {
          clearInterval(pollRef.current)
          setSubmitting(false)
          setTab('results')
        }
        if (++polls >= MAX_POLLS) { clearInterval(pollRef.current); setSubmitting(false) }
      } catch { clearInterval(pollRef.current); setSubmitting(false) }
    }, POLL_INTERVAL)
  }, [])

  useEffect(() => () => { clearInterval(pollRef.current); clearTimeout(timerRef.current) }, [])

  const handleSubmit = async () => {
    if (submitting || !code.trim() || ended) return
    setSubmitting(true)
    setSubmission(null)
    try {
      const { data } = await api.post('/submissions', {
        problemId: session.problem.id,
        language: lang,
        code,
        sessionId: session.id,
      })
      setSubmission({ id: data.id, status: 'PENDING' })
      pollResult(data.id)
    } catch (err) {
      setSubmitting(false)
      alert(err.response?.data?.error || 'Submission failed')
    }
  }

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>❌</div>
      <p style={{ fontSize: 18, fontWeight: 600 }}>{error}</p>
      <button className="btn-secondary" onClick={() => navigate('/login')}>Go to Login</button>
    </div>
  )

  if (!session) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: 'var(--text2)' }}>Loading session…</p>
    </div>
  )

  const monacoLang = LANGUAGES.find(l => l.id === lang)?.monaco || 'python'
  const problem = session.problem

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const timerColor = timeLeft !== null
    ? timeLeft < 300 ? '#f85149' : timeLeft < 600 ? '#e3b341' : '#56d364'
    : 'var(--text2)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Ended overlay */}
      {ended && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 48 }}>⏰</div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Time's Up!</h2>
          <p style={{ color: 'var(--text2)' }}>Your interview session has ended.</p>
          {submission?.verdict && (
            <span className={`verdict verdict-${submission.verdict}`} style={{ fontSize: 16, padding: '6px 16px' }}>{submission.verdict}</span>
          )}
        </div>
      )}

      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>CodeEval Interview</span>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>•</span>
        <span style={{ fontSize: 13 }}>{problem.title}</span>
        <span className={`diff-${problem.difficulty}`} style={{ fontSize: 12 }}>{problem.difficulty}</span>
        <div style={{ flex: 1 }} />

        {/* Timer */}
        {timeLeft !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: timerColor }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        )}

        <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}>
          {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>

        <button className="btn-primary" onClick={handleSubmit} disabled={submitting || ended} style={{ padding: '6px 18px', minWidth: 90 }}>
          {submitting ? 'Running…' : 'Submit'}
        </button>
      </header>

      {/* Split layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: problem + results */}
        <div style={{ width: '42%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[['description', 'Problem'], ['results', 'Results']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: 'transparent', borderRadius: 0, padding: '10px 18px', fontSize: 13,
                color: tab === id ? 'var(--text)' : 'var(--text2)',
                borderBottom: tab === id ? '2px solid var(--blue-h)' : '2px solid transparent',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
            {tab === 'description' ? <ProblemDescription problem={problem} /> : <ResultsPanel submission={submission} />}
          </div>
        </div>

        {/* Right: editor */}
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            language={monacoLang}
            value={code}
            onChange={v => setCode(v || '')}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Fira Code, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: 'on',
              tabSize: 4,
              automaticLayout: true,
              padding: { top: 12 },
              readOnly: ended,
            }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── Problem Description with Markdown ───────────────────────────────────────
function ProblemDescription({ problem }) {
  const renderMarkdown = (text) => {
    if (!text) return ''
    return text
      .replace(/^### (.+)$/gm, '<h3 style="font-size:13px;color:var(--text2);text-transform:uppercase;letter-spacing:1px;margin:16px 0 8px">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:600;margin:12px 0 8px">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 style="font-size:20px;font-weight:700;margin:12px 0 8px">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:var(--surface2);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:12px">$1</code>')
      .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:12px;font-family:var(--font-mono);font-size:12px;overflow-x:auto;margin:8px 0">$1</pre>')
      .replace(/^- (.+)$/gm, '<li style="margin:4px 0 4px 16px">$1</li>')
      .replace(/\n\n/g, '<br/><br/>')
  }

  return (
    <div style={{ fontSize: 14, lineHeight: 1.8 }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, color: 'var(--text2)', fontSize: 12 }}>
        <span>⏱ {problem.timeLimit}ms</span>
        <span>💾 {problem.memoryLimit}MB</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(problem.description) }} />
      {problem.testCases?.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Sample test cases</h3>
          {problem.testCases.map((tc, i) => (
            <div key={tc.id} style={{ marginBottom: 10, background: 'var(--surface2)', borderRadius: 6, padding: 12, fontSize: 13 }}>
              <div style={{ color: 'var(--text2)', marginBottom: 4, fontSize: 12 }}>Case {i + 1}</div>
              <div><span style={{ color: 'var(--text2)' }}>Input: </span><code style={{ fontFamily: 'var(--font-mono)' }}>{tc.input}</code></div>
              <div><span style={{ color: 'var(--text2)' }}>Expected: </span><code style={{ fontFamily: 'var(--font-mono)' }}>{tc.expected}</code></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Results Panel ────────────────────────────────────────────────────────────
function ResultsPanel({ submission }) {
  if (!submission) return <p style={{ color: 'var(--text2)', fontSize: 14 }}>Submit your solution to see results.</p>
  if (submission.status === 'PENDING' || submission.status === 'RUNNING') {
    return (
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 28, marginBottom: 12 }}>⚙️</div>
        <p style={{ color: 'var(--text2)' }}>Running your code…</p>
      </div>
    )
  }
  const pct = submission.score != null ? Math.round(submission.score * 100) : null
  return (
    <div style={{ fontSize: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 16, background: 'var(--surface2)', borderRadius: 6 }}>
        {submission.verdict && <span className={`verdict verdict-${submission.verdict}`}>{submission.verdict}</span>}
        {pct != null && <span style={{ fontWeight: 600 }}>{pct}% tests passed</span>}
        {submission.runtime && <span style={{ color: 'var(--text2)' }}>Runtime: {submission.runtime}ms</span>}
      </div>
      {submission.error && (
        <div style={{ background: '#2a1a1a', border: '1px solid var(--red)', borderRadius: 6, padding: 12, marginBottom: 16 }}>
          <pre style={{ fontSize: 12, color: '#ffa198', whiteSpace: 'pre-wrap', fontFamily: 'var(--font-mono)' }}>{submission.error}</pre>
        </div>
      )}
      {submission.results?.map((r, i) => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 16 }}>{r.passed ? '✅' : '❌'}</span>
          <span>Case {i + 1}</span>
          {r.runtime && <span style={{ color: 'var(--text2)', fontSize: 12 }}>{r.runtime}ms</span>}
          {!r.passed && r.actualOutput && (
            <span style={{ color: 'var(--text2)', fontSize: 12 }}>Got: <code style={{ fontFamily: 'var(--font-mono)' }}>{r.actualOutput}</code></span>
          )}
        </div>
      ))}
    </div>
  )
}
