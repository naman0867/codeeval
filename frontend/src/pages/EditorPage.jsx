// src/pages/EditorPage.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import api from '../api/client'
import AIReviewer from '../components/AIReviewer'

const LANGUAGES = [
  { id: 'PYTHON',     label: 'Python 3',   monaco: 'python' },
  { id: 'JAVASCRIPT', label: 'JavaScript', monaco: 'javascript' },
  { id: 'JAVA',       label: 'Java',       monaco: 'java' },
  { id: 'CPP',        label: 'C++',        monaco: 'cpp' },
]

const POLL_INTERVAL = 1500
const MAX_POLLS = 40

export default function EditorPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [problem, setProblem] = useState(null)
  const [lang, setLang] = useState('PYTHON')
  const [code, setCode] = useState('')
  const [submission, setSubmission] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [tab, setTab] = useState('description')
  const pollRef = useRef(null)

  useEffect(() => {
    api.get(`/problems/${slug}`).then(r => {
      setProblem(r.data)
      const starter = r.data.starterCode?.find(s => s.language === lang)
      if (starter) setCode(starter.code)
    }).catch(() => navigate('/problems'))
  }, [slug])

  useEffect(() => {
    if (!problem) return
    const starter = problem.starterCode?.find(s => s.language === lang)
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

  useEffect(() => () => clearInterval(pollRef.current), [])

  const handleSubmit = async () => {
    if (submitting || !code.trim()) return
    setSubmitting(true)
    setSubmission(null)
    try {
      const { data } = await api.post('/submissions', { problemId: problem.id, language: lang, code })
      setSubmission({ id: data.id, status: 'PENDING' })
      pollResult(data.id)
    } catch (err) {
      setSubmitting(false)
      alert(err.response?.data?.error || 'Submission failed')
    }
  }

  if (!problem) return <div style={{ padding: 40, color: 'var(--text2)' }}>Loading…</div>

  const monacoLang = LANGUAGES.find(l => l.id === lang)?.monaco || 'python'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => navigate('/problems')}>← Problems</button>
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{problem.title}</span>
        <span className={`diff-${problem.difficulty}`} style={{ fontSize: 12 }}>{problem.difficulty}</span>
        <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: 'auto', padding: '4px 8px', fontSize: 13 }}>
          {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '6px 18px', minWidth: 90 }}>
          {submitting ? 'Running…' : 'Submit'}
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: problem + results */}
        <div style={{ width: '38%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            {[['description', 'Description'], ['results', 'Results'], ['ai', '🤖 AI Review']].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{
                background: 'transparent', borderRadius: 0, padding: '10px 14px', fontSize: 12,
                color: tab === id ? 'var(--text)' : 'var(--text2)',
                borderBottom: tab === id ? '2px solid var(--blue-h)' : '2px solid transparent',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: tab === 'ai' ? 'hidden' : 'auto', padding: tab === 'ai' ? 0 : 20, display: 'flex', flexDirection: 'column' }}>
            {tab === 'description' && <ProblemDescription problem={problem} />}
            {tab === 'results' && <ResultsPanel submission={submission} />}
            {tab === 'ai' && (
              <AIReviewer
                code={code}
                language={lang}
                problem={problem}
                verdict={submission?.verdict}
              />
            )}
          </div>
        </div>

        {/* Editor */}
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
            }}
          />
        </div>
      </div>
    </div>
  )
}

function renderMarkdown(text) {
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

function ProblemDescription({ problem }) {
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
