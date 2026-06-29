// src/pages/MockInterviewPage.jsx
import { useState, useRef, useEffect } from 'react'
import { callAI } from '../api/ai'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLES = ['Software Engineer', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Engineer', 'Data Engineer', 'ML Engineer']
const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Swiggy', 'Zomato', 'Razorpay', 'FAANG', 'Startup', 'Any']
const LEVELS = ['Intern', 'Entry Level (0-1 yr)', 'Junior (1-3 yr)', 'Mid Level (3-5 yr)']
const TYPES = ['DSA & Problem Solving', 'System Design', 'Behavioral & HR', 'Full Interview (Mixed)']

export default function MockInterviewPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [phase, setPhase] = useState('setup') // setup | interview | report
  const [config, setConfig] = useState({
    role: 'Software Engineer',
    company: 'Any',
    level: 'Entry Level (0-1 yr)',
    type: 'Full Interview (Mixed)',
    numQuestions: 5,
  })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [questionNum, setQuestionNum] = useState(0)
  const [scores, setScores] = useState([])
  const [report, setReport] = useState(null)
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const q = searchParams.get('question')
    if (q) {
      setConfig(c => ({ ...c, type: 'Behavioral & HR' }))
    }
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const startInterview = async () => {
    setPhase('interview')
    setLoading(true)
    const systemPrompt = buildSystemPrompt(config)
    const firstMsg = await callClaude(systemPrompt, [], `Start the interview. Greet the candidate warmly, introduce yourself as an interviewer at ${config.company === 'Any' ? 'a top tech company' : config.company}, briefly explain the format, then ask the first question.`)
    setMessages([{ role: 'assistant', content: firstMsg }])
    setQuestionNum(1)
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const sendAnswer = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    const isLast = questionNum >= config.numQuestions
    const systemPrompt = buildSystemPrompt(config)

    let prompt
    if (isLast) {
      prompt = `The candidate just answered the last question (question ${questionNum} of ${config.numQuestions}). 
      Score this answer out of 10 for: technical accuracy, communication clarity, and depth.
      Give brief feedback on this specific answer, then say the interview is complete and you'll now compile the full report.
      End with: "INTERVIEW_COMPLETE"`
    } else {
      prompt = `The candidate answered question ${questionNum}. 
      Briefly acknowledge their answer (1-2 sentences of specific feedback), 
      give a quick score like "Score: X/10" for this answer, 
      then smoothly transition to question ${questionNum + 1} of ${config.numQuestions}.`
    }

    const reply = await callClaude(systemPrompt, newMessages, prompt)
    const updatedMessages = [...newMessages, { role: 'assistant', content: reply }]
    setMessages(updatedMessages)

    // Extract score from reply
    const scoreMatch = reply.match(/Score:\s*(\d+)\/10/i)
    if (scoreMatch) setScores(s => [...s, parseInt(scoreMatch[1])])

    if (reply.includes('INTERVIEW_COMPLETE')) {
      setLoading(true)
      await generateReport(updatedMessages, systemPrompt)
    } else {
      setQuestionNum(n => n + 1)
    }
    setLoading(false)
  }

  const generateReport = async (msgs, systemPrompt) => {
    const reportPrompt = `Based on the entire interview conversation, generate a comprehensive performance report as JSON only (no markdown, no extra text):
{
  "overallScore": <number 0-100>,
  "grade": "<A+|A|B+|B|C+|C|D>",
  "technicalScore": <0-10>,
  "communicationScore": <0-10>,
  "depthScore": <0-10>,
  "summary": "<3-4 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "topicsFeedback": [{"topic": "<topic>", "performance": "<good|average|poor>", "feedback": "<specific feedback>"}],
  "recommendations": ["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"],
  "studyPlan": ["<resource/topic to study 1>", "<resource/topic to study 2>", "<resource/topic to study 3>"],
  "hireable": <true|false>,
  "hireableReason": "<one sentence on hiring decision>"
}`

    const reportJson = await callClaude(systemPrompt, msgs, reportPrompt)
    try {
      const clean = reportJson.replace(/```json|```/g, '').trim()
      setReport(JSON.parse(clean))
      setPhase('report')
    } catch {
      setPhase('report')
      setReport({ overallScore: 70, grade: 'B', summary: 'Interview completed. Report generation had an issue.', strengths: [], weaknesses: [], recommendations: [], studyPlan: [] })
    }
    setLoading(false)
  }

  const callClaude = async (system, history, userMessage) => {
    try {
      return await callAI({ system, messages: [...history, { role: 'user', content: userMessage }], max_tokens: 1024 })
    } catch {
      return 'Connection error. Please check your internet and try again.'
    }
  }

  const gradeColor = {
    'A+': '#56d364', 'A': '#56d364', 'B+': '#79c0ff', 'B': '#79c0ff',
    'C+': '#e3b341', 'C': '#e3b341', 'D': '#f85149'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/problems')}>CodeEval</span>
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>/ AI Mock Interview</span>
        <div style={{ flex: 1 }} />
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/jd-matcher')}>📄 JD Matcher</button>
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/problems')}>← Problems</button>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.name}</span>
        <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={logout}>Sign out</button>
      </header>

      {/* Setup Phase */}
      {phase === 'setup' && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 32 }}>
          <div style={{ width: '100%', maxWidth: 560 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎤</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>AI Mock Interview</h2>
              <p style={{ color: 'var(--text2)', fontSize: 14 }}>Practice with an AI interviewer that adapts to your responses and gives real feedback</p>
            </div>

            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Target Role</label>
                  <select value={config.role} onChange={e => setConfig(c => ({ ...c, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Target Company</label>
                  <select value={config.company} onChange={e => setConfig(c => ({ ...c, company: e.target.value }))}>
                    {COMPANIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Experience Level</label>
                  <select value={config.level} onChange={e => setConfig(c => ({ ...c, level: e.target.value }))}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Interview Type</label>
                  <select value={config.type} onChange={e => setConfig(c => ({ ...c, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Number of Questions: {config.numQuestions}</label>
                <input type="range" min={3} max={10} value={config.numQuestions}
                  onChange={e => setConfig(c => ({ ...c, numQuestions: parseInt(e.target.value) }))}
                  style={{ width: '100%', accentColor: 'var(--blue-h)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text2)' }}>
                  <span>3 (Quick)</span><span>10 (Full)</span>
                </div>
              </div>

              <div style={{ padding: 14, background: 'var(--surface2)', borderRadius: 8, fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>
                🎯 <strong style={{ color: 'var(--text)' }}>Session:</strong> {config.numQuestions} {config.type} questions for a {config.level} {config.role} role
                {config.company !== 'Any' ? ` at ${config.company}` : ''}. Est. time: {config.numQuestions * 3}-{config.numQuestions * 5} minutes.
              </div>

              <button className="btn-primary" onClick={startInterview}
                style={{ padding: '14px', fontSize: 15, fontWeight: 600 }}>
                🎤 Start Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Phase */}
      {phase === 'interview' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Progress bar */}
          <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>Question {Math.min(questionNum, config.numQuestions)} of {config.numQuestions}</span>
            <div style={{ flex: 1, height: 4, background: 'var(--surface2)', borderRadius: 2 }}>
              <div style={{ height: '100%', width: `${(Math.min(questionNum, config.numQuestions) / config.numQuestions) * 100}%`, background: 'var(--fill-accent)', borderRadius: 2, transition: 'width .5s' }} />
            </div>
            <span style={{ fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{config.role} • {config.company}</span>
          </div>

          {/* Chat */}
          <div ref={chatRef} style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: msg.role === 'assistant' ? '#1a2a3a' : '#1a3a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                }}>
                  {msg.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div style={{
                  maxWidth: '75%', padding: '12px 16px', borderRadius: 12, fontSize: 14, lineHeight: 1.7,
                  background: msg.role === 'assistant' ? 'var(--surface)' : '#1a3a1a',
                  border: '1px solid var(--border)',
                  borderTopLeftRadius: msg.role === 'assistant' ? 2 : 12,
                  borderTopRightRadius: msg.role === 'user' ? 2 : 12,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content.replace('INTERVIEW_COMPLETE', '')}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, borderTopLeftRadius: 2 }}>
                  <span style={{ color: 'var(--text2)', fontSize: 20 }}>●●●</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAnswer() } }}
              placeholder="Type your answer… (Enter to send, Shift+Enter for new line)"
              rows={3}
              disabled={loading}
              style={{ flex: 1, resize: 'none', fontSize: 14, lineHeight: 1.6 }}
            />
            <button className="btn-primary" onClick={sendAnswer} disabled={loading || !input.trim()}
              style={{ padding: '0 20px', alignSelf: 'stretch', minWidth: 80 }}>
              Send
            </button>
          </div>
        </div>
      )}

      {/* Report Phase */}
      {phase === 'report' && report && (
        <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>📊</div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Interview Report</h2>
              <p style={{ color: 'var(--text2)' }}>{config.role} • {config.company} • {config.type}</p>
            </div>

            {/* Overall Score */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
              {[
                { label: 'Overall', value: `${report.overallScore}%`, color: gradeColor[report.grade] || '#e3b341' },
                { label: 'Technical', value: `${report.technicalScore}/10`, color: '#79c0ff' },
                { label: 'Communication', value: `${report.communicationScore}/10`, color: '#d2a8ff' },
                { label: 'Depth', value: `${report.depthScore}/10`, color: '#56d364' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Grade + Hireable */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 32, fontWeight: 800, color: gradeColor[report.grade] || '#e3b341' }}>{report.grade}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>Overall Grade</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{report.hireable ? '✅ Hirable' : '❌ Needs improvement'}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{report.hireableReason}</p>
              </div>
              <div style={{ flex: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Summary</h3>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{report.summary}</p>
              </div>
            </div>

            {/* Strengths + Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ fontSize: 13, color: '#56d364', marginBottom: 12 }}>💪 Strengths</h3>
                {report.strengths?.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ color: '#56d364', flexShrink: 0 }}>✓</span><span>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20 }}>
                <h3 style={{ fontSize: 13, color: '#f85149', marginBottom: 12 }}>🎯 Areas to Improve</h3>
                {report.weaknesses?.map((w, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                    <span style={{ color: '#f85149', flexShrink: 0 }}>✗</span><span>{w}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Feedback */}
            {report.topicsFeedback?.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>📚 Topic-wise Performance</h3>
                {report.topicsFeedback.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600, flexShrink: 0,
                      background: t.performance === 'good' ? '#1a3a1a' : t.performance === 'average' ? '#2a1a0a' : '#2a1a1a',
                      color: t.performance === 'good' ? '#56d364' : t.performance === 'average' ? '#e3b341' : '#f85149'
                    }}>{t.performance}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{t.topic}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.feedback}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Study Plan */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>📖 Recommended Study Plan</h3>
              {report.studyPlan?.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, fontSize: 13, lineHeight: 1.5 }}>
                  <span style={{ color: 'var(--blue-h)', flexShrink: 0 }}>{i + 1}.</span><span>{s}</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={() => { setPhase('setup'); setMessages([]); setScores([]); setReport(null); setQuestionNum(0) }}
                style={{ flex: 1, padding: '12px' }}>
                🔄 Try Again
              </button>
              <button className="btn-secondary" onClick={() => navigate('/jd-matcher')} style={{ flex: 1, padding: '12px' }}>
                📄 Match with JD
              </button>
              <button className="btn-secondary" onClick={() => navigate('/problems')} style={{ flex: 1, padding: '12px' }}>
                💻 Practice Coding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function buildSystemPrompt(config) {
  return `You are an experienced technical interviewer at ${config.company === 'Any' ? 'a top tech company' : config.company}. 
You are interviewing a candidate for a ${config.level} ${config.role} position.
Interview type: ${config.type}.

Guidelines:
- Ask ONE question at a time
- After each answer, give brief specific feedback and a score (format: "Score: X/10")
- For DSA questions, ask the candidate to explain their approach, not write code
- For behavioral questions, use STAR method evaluation
- Be professional but encouraging
- Adapt follow-up questions based on the candidate's answers
- If the candidate gives a poor answer, give a hint rather than moving on immediately
- Keep your responses concise and focused

Total questions to ask: ${config.numQuestions}`
}

const labelStyle = { fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }
