// src/components/AIReviewer.jsx
import { useState } from 'react'
import { callAI } from '../api/ai'

export default function AIReviewer({ code, language, problem, verdict }) {
  const [review, setReview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chat, setChat] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [tab, setTab] = useState('review')

  const getReview = async () => {
    if (!code?.trim()) return
    setLoading(true)
    setReview(null)

    try {
      const system = `You are a senior software engineer doing a code review. Analyze the submitted code and return ONLY valid JSON with no extra text:
{
  "timeComplexity": "<e.g. O(n)>",
  "spaceComplexity": "<e.g. O(1)>",
  "complexityExplanation": "<why this complexity>",
  "codeQuality": "<Excellent|Good|Average|Poor>",
  "bugs": ["<bug or edge case missed 1>", "<bug 2>"],
  "positives": ["<what was done well 1>", "<positive 2>"],
  "improvements": ["<specific improvement 1>", "<improvement 2>"],
  "optimalApproach": "<describe a better approach if one exists, or say this is optimal>",
  "optimalComplexity": "<time complexity of optimal approach>",
  "interviewTips": ["<tip relevant for interviews 1>", "<tip 2>"]
}`
      const text = await callAI({ system, messages: [{ role: 'user', content: `Problem: ${problem?.title || 'Unknown'}\nLanguage: ${language}\nVerdict: ${verdict || 'Unknown'}\n\nCode:\n${code}` }], max_tokens: 1024 })
      const clean = text.replace(/```json|```/g, '').trim()
      setReview(JSON.parse(clean))
      setTab('review')
    } catch {
      setReview({ error: 'Review failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const askAI = async () => {
    if (!chatInput.trim() || chatLoading) return
    const question = chatInput.trim()
    setChatInput('')
    const newChat = [...chat, { role: 'user', content: question }]
    setChat(newChat)
    setChatLoading(true)

    try {
      const system = `You are a helpful coding mentor. The student submitted this ${language} code for the problem "${problem?.title}". Answer their questions about this specific code clearly and concisely.`
      const reply = await callAI({ system, messages: newChat, max_tokens: 1024 })
      setChat(c => [...c, { role: 'assistant', content: reply }])
    } catch {
      setChat(c => [...c, { role: 'assistant', content: 'Connection error. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  const qualityColor = {
    'Excellent': '#56d364', 'Good': '#79c0ff', 'Average': '#e3b341', 'Poor': '#f85149'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {[['review', '🔍 AI Review'], ['chat', '💬 Ask AI']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: 'transparent', borderRadius: 0, padding: '8px 14px', fontSize: 12,
            color: tab === id ? 'var(--text)' : 'var(--text2)',
            borderBottom: tab === id ? '2px solid var(--blue-h)' : '2px solid transparent',
          }}>{label}</button>
        ))}
      </div>

      {/* Review Tab */}
      {tab === 'review' && (
        <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
          {!review && !loading && (
            <div style={{ textAlign: 'center', paddingTop: 30 }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
                Get an AI code review with complexity analysis, bug detection, and improvement tips.
              </p>
              <button className="btn-primary" onClick={getReview} style={{ padding: '8px 20px' }}>
                Review My Code
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', paddingTop: 30 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>⚙️</div>
              <p style={{ fontSize: 12, color: 'var(--text2)' }}>Analyzing your code…</p>
            </div>
          )}

          {review && !review.error && (
            <div style={{ fontSize: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Complexity */}
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <span style={{ padding: '2px 8px', borderRadius: 12, background: '#1a2a3a', color: '#79c0ff', fontWeight: 600 }}>⏱ {review.timeComplexity}</span>
                  <span style={{ padding: '2px 8px', borderRadius: 12, background: '#1a3a1a', color: '#56d364', fontWeight: 600 }}>💾 {review.spaceComplexity}</span>
                  {review.codeQuality && (
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontWeight: 600, background: '#1a1a1a', color: qualityColor[review.codeQuality] || '#e3b341' }}>
                      {review.codeQuality}
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text2)', lineHeight: 1.5 }}>{review.complexityExplanation}</p>
              </div>

              {/* Positives */}
              {review.positives?.length > 0 && (
                <div>
                  <p style={{ color: '#56d364', fontWeight: 600, marginBottom: 6 }}>✅ What you did well</p>
                  {review.positives.map((p, i) => <p key={i} style={{ color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>• {p}</p>)}
                </div>
              )}

              {/* Bugs */}
              {review.bugs?.length > 0 && (
                <div>
                  <p style={{ color: '#f85149', fontWeight: 600, marginBottom: 6 }}>⚠️ Edge cases / bugs</p>
                  {review.bugs.map((b, i) => <p key={i} style={{ color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>• {b}</p>)}
                </div>
              )}

              {/* Improvements */}
              {review.improvements?.length > 0 && (
                <div>
                  <p style={{ color: '#e3b341', fontWeight: 600, marginBottom: 6 }}>🎯 Improvements</p>
                  {review.improvements.map((imp, i) => <p key={i} style={{ color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>• {imp}</p>)}
                </div>
              )}

              {/* Optimal approach */}
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12 }}>
                <p style={{ color: '#d2a8ff', fontWeight: 600, marginBottom: 6 }}>🚀 Optimal approach {review.optimalComplexity && `(${review.optimalComplexity})`}</p>
                <p style={{ color: 'var(--text2)', lineHeight: 1.5 }}>{review.optimalApproach}</p>
              </div>

              {/* Interview tips */}
              {review.interviewTips?.length > 0 && (
                <div>
                  <p style={{ color: '#ffa657', fontWeight: 600, marginBottom: 6 }}>💡 Interview tips</p>
                  {review.interviewTips.map((t, i) => <p key={i} style={{ color: 'var(--text2)', marginBottom: 4, lineHeight: 1.5 }}>• {t}</p>)}
                </div>
              )}

              <button className="btn-secondary" onClick={getReview} style={{ padding: '6px', fontSize: 12 }}>
                🔄 Re-analyze
              </button>
            </div>
          )}

          {review?.error && (
            <p style={{ color: 'var(--red)', fontSize: 13 }}>{review.error}</p>
          )}
        </div>
      )}

      {/* Chat Tab */}
      {tab === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.length === 0 && (
              <div style={{ textAlign: 'center', paddingTop: 20, color: 'var(--text2)' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                <p style={{ fontSize: 12, lineHeight: 1.6 }}>Ask anything about your code.<br />
                  "Why is this O(n²)?" "How can I optimize this?" "What's the edge case?"</p>
              </div>
            )}
            {chat.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ fontSize: 16 }}>{m.role === 'user' ? '👤' : '🤖'}</div>
                <div style={{
                  maxWidth: '85%', padding: '8px 12px', borderRadius: 10, fontSize: 12, lineHeight: 1.6,
                  background: m.role === 'user' ? '#1a3a1a' : 'var(--surface2)',
                  border: '1px solid var(--border)', whiteSpace: 'pre-wrap',
                }}>{m.content}</div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ fontSize: 16 }}>🤖</div>
                <div style={{ padding: '8px 12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 18, color: 'var(--text2)' }}>●●●</div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 10, borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              placeholder="Ask about your code…"
              style={{ flex: 1, fontSize: 12, padding: '6px 10px' }} />
            <button className="btn-primary" onClick={askAI} disabled={chatLoading || !chatInput.trim()}
              style={{ padding: '6px 12px', fontSize: 12 }}>Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
