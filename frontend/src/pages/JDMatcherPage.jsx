// src/pages/JDMatcherPage.jsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { callAI } from '../api/ai'
import api from '../api/client'

export default function JDMatcherPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [jd, setJd] = useState('')
  const [resume, setResume] = useState('')
  const [jdFileName, setJdFileName] = useState('')
  const [resumeFileName, setResumeFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [extractingJd, setExtractingJd] = useState(false)
  const [extractingResume, setExtractingResume] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('match')
  const [error, setError] = useState('')
  const jdFileRef = useRef()
  const resumeFileRef = useRef()

  const extractPDF = async (file, type) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]
          const { data } = await api.post('/ai/extract-pdf', {
            base64,
            filename: file.name,
          })
          resolve(data.text)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleJdFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setJdFileName(file.name)
    setExtractingJd(true)
    try {
      if (file.type === 'application/pdf') {
        const text = await extractPDF(file, 'jd')
        setJd(text)
      } else {
        // Plain text file
        const text = await file.text()
        setJd(text)
      }
    } catch {
      setError('Failed to extract text from JD PDF. Try pasting the text manually.')
    } finally {
      setExtractingJd(false)
    }
  }

  const handleResumeFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setResumeFileName(file.name)
    setExtractingResume(true)
    try {
      if (file.type === 'application/pdf') {
        const text = await extractPDF(file, 'resume')
        setResume(text)
      } else {
        const text = await file.text()
        setResume(text)
      }
    } catch {
      setError('Failed to extract text from Resume PDF. Try pasting the text manually.')
    } finally {
      setExtractingResume(false)
    }
  }

  const analyze = async () => {
    if (!jd.trim() || !resume.trim()) {
      setError('Please provide both the job description and your resume.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const system = `You are an expert ATS and recruitment analyst. Analyze the job description and resume and return ONLY a valid JSON object with no extra text, markdown, or explanation:
{
  "matchScore": <number 0-100>,
  "matchedSkills": [<skills found in both>],
  "missingSkills": [<skills in JD missing from resume>],
  "experienceFit": "<Excellent|Good|Fair|Poor>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": [<3-4 strength points>],
  "improvements": [<3-4 specific improvement suggestions>],
  "atsKeywords": [<10-15 important ATS keywords from JD>],
  "missingKeywords": [<keywords missing from resume>],
  "rewrittenBullets": [<5-6 improved resume bullets tailored to this JD>],
  "likelyQuestions": [<8 likely interview questions based on JD>]
}`
      const text = await callAI({
        system,
        messages: [{ role: 'user', content: `JOB DESCRIPTION:\n${jd}\n\nRESUME:\n${resume}` }],
        max_tokens: 1500,
      })
      const clean = text.replace(/```json|```/g, '').trim()
      setResult(JSON.parse(clean))
      setTab('match')
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const scoreColor = result
    ? result.matchScore >= 75 ? 'var(--green)' : result.matchScore >= 50 ? 'var(--amber)' : 'var(--red)'
    : 'var(--text2)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo" onClick={() => navigate('/problems')}>⚡ CodeEval</span>
        <div className="nav-divider" />
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>JD ↔ Resume Matcher</span>
        <div style={{ flex: 1 }} />
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/mock-interview')}>🎤 Mock Interview</button>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => navigate('/problems')}>← Problems</button>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.name}</span>
        <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={logout}>Sign out</button>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: inputs */}
        <div style={{ width: '44%', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'auto', padding: 24, gap: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>📄 JD ↔ Resume Matcher</h2>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Upload PDFs or paste text to get an AI-powered match analysis.</p>
          </div>

          {/* JD Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <label style={lStyle}>Job Description</label>
              <div style={{ flex: 1 }} />
              <button onClick={() => jdFileRef.current.click()}
                style={{ fontSize: 11, padding: '3px 10px', background: 'var(--accent-bg)', color: 'var(--accent-h)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                📎 Upload PDF
              </button>
              <input ref={jdFileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleJdFile} />
            </div>

            {/* JD Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
              onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              onDrop={async e => {
                e.preventDefault()
                e.currentTarget.style.borderColor = 'var(--border)'
                const file = e.dataTransfer.files[0]
                if (file) { const ev = { target: { files: [file] } }; await handleJdFile(ev) }
              }}
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 8, fontSize: 12, color: 'var(--text3)', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onClick={() => jdFileRef.current.click()}>
              {extractingJd ? '⏳ Extracting text from PDF…' : jdFileName ? `✅ ${jdFileName}` : '🖱️ Drag & drop PDF here or click to upload'}
            </div>

            <textarea value={jd} onChange={e => setJd(e.target.value)} rows={8}
              placeholder="Or paste job description text here..."
              style={{ resize: 'vertical', fontSize: 13, lineHeight: 1.6 }} />
          </div>

          {/* Resume Input */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
              <label style={lStyle}>Your Resume</label>
              <div style={{ flex: 1 }} />
              <button onClick={() => resumeFileRef.current.click()}
                style={{ fontSize: 11, padding: '3px 10px', background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                📎 Upload PDF
              </button>
              <input ref={resumeFileRef} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={handleResumeFile} />
            </div>

            <div
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--green)' }}
              onDragLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              onDrop={async e => {
                e.preventDefault()
                e.currentTarget.style.borderColor = 'var(--border)'
                const file = e.dataTransfer.files[0]
                if (file) { const ev = { target: { files: [file] } }; await handleResumeFile(ev) }
              }}
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 10, marginBottom: 8, fontSize: 12, color: 'var(--text3)', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.15s' }}
              onClick={() => resumeFileRef.current.click()}>
              {extractingResume ? '⏳ Extracting text from PDF…' : resumeFileName ? `✅ ${resumeFileName}` : '🖱️ Drag & drop Resume PDF here or click to upload'}
            </div>

            <textarea value={resume} onChange={e => setResume(e.target.value)} rows={8}
              placeholder="Or paste your resume text here..."
              style={{ resize: 'vertical', fontSize: 13, lineHeight: 1.6 }} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button className="btn-primary" onClick={analyze} disabled={loading || extractingJd || extractingResume}
            style={{ padding: '12px', fontSize: 14, fontWeight: 600 }}>
            {loading ? '🔍 Analyzing with AI…' : extractingJd || extractingResume ? '⏳ Extracting PDF…' : '🔍 Analyze Match'}
          </button>
        </div>

        {/* Right: results */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!result ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 12, color: 'var(--text2)' }}>
              <div style={{ fontSize: 56 }}>📊</div>
              <p style={{ fontSize: 16, fontWeight: 500 }}>Analysis results will appear here</p>
              <p style={{ fontSize: 13, color: 'var(--text3)' }}>Upload PDFs or paste text on the left, then click Analyze</p>
              <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 13 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📎</div>
                  <div style={{ color: 'var(--text2)' }}>Upload PDF</div>
                </div>
                <div style={{ textAlign: 'center', color: 'var(--text3)' }}>or</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📝</div>
                  <div style={{ color: 'var(--text2)' }}>Paste Text</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="tab-bar" style={{ padding: '0 24px' }}>
                {[['match', '📊 Match Analysis'], ['rewrite', '✏️ Resume Rewrite'], ['questions', '❓ Interview Questions']].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} className={`tab-btn ${tab === id ? 'active' : ''}`}>{label}</button>
                ))}
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                {tab === 'match' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="fade-in">
                    {/* Score card */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 64, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>{result.matchScore}%</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Match Score</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: 10 }}>
                          <div className="progress">
                            <div className="progress-fill" style={{ width: `${result.matchScore}%`, background: scoreColor }} />
                          </div>
                        </div>
                        <span className={`tag ${result.experienceFit === 'Excellent' ? 'tag-green' : result.experienceFit === 'Good' ? 'tag-blue' : result.experienceFit === 'Fair' ? 'tag-amber' : 'tag-red'}`}>
                          Experience Fit: {result.experienceFit}
                        </span>
                        <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginTop: 10 }}>{result.summary}</p>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                      <div style={{ background: 'var(--surface)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                        <h3 style={{ fontSize: 12, color: 'var(--green)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ Matched Skills ({result.matchedSkills?.length})</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {result.matchedSkills?.map((s, i) => <span key={i} className="tag tag-green">{s}</span>)}
                        </div>
                      </div>
                      <div style={{ background: 'var(--surface)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                        <h3 style={{ fontSize: 12, color: 'var(--red)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>❌ Missing Skills ({result.missingSkills?.length})</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {result.missingSkills?.map((s, i) => <span key={i} className="tag tag-red">{s}</span>)}
                        </div>
                      </div>
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                        <h3 style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>💪 Strengths</h3>
                        {result.strengths?.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</p>)}
                      </div>
                      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                        <h3 style={{ fontSize: 12, color: 'var(--purple)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🎯 Improvements</h3>
                        {result.improvements?.map((s, i) => <p key={i} style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, lineHeight: 1.5 }}>• {s}</p>)}
                      </div>
                    </div>

                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 16 }}>
                      <h3 style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔑 Missing ATS Keywords</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {result.missingKeywords?.map((k, i) => <span key={i} className="tag tag-purple">{k}</span>)}
                      </div>
                    </div>
                  </div>
                )}

                {tab === 'rewrite' && (
                  <div className="fade-in">
                    <div className="alert alert-info" style={{ marginBottom: 16 }}>
                      💡 These bullets are rewritten to match the JD keywords and ATS filters. Copy and replace your existing resume bullets.
                    </div>
                    {result.rewrittenBullets?.map((b, i) => (
                      <div key={i} style={{ padding: 14, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: 10, fontSize: 13, lineHeight: 1.7, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }}>•</span>
                        <span style={{ flex: 1 }}>{b}</span>
                        <button onClick={() => { navigator.clipboard.writeText(b) }}
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '3px 10px', fontSize: 11, color: 'var(--text2)', cursor: 'pointer', flexShrink: 0 }}>
                          Copy
                        </button>
                      </div>
                    ))}
                    <button onClick={() => navigator.clipboard.writeText(result.rewrittenBullets?.join('\n'))}
                      className="btn-secondary" style={{ width: '100%', marginTop: 8 }}>
                      📋 Copy All Bullets
                    </button>
                  </div>
                )}

                {tab === 'questions' && (
                  <div className="fade-in">
                    <div className="alert alert-success" style={{ marginBottom: 16 }}>
                      🎯 These are the most likely questions based on this specific JD. Practice each one before your interview.
                    </div>
                    {result.likelyQuestions?.map((q, i) => (
                      <div key={i} style={{ padding: 16, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)', flexShrink: 0, minWidth: 28 }}>{i + 1}.</span>
                          <p style={{ fontSize: 14, lineHeight: 1.6, flex: 1 }}>{q}</p>
                        </div>
                        <button onClick={() => navigate(`/mock-interview?question=${encodeURIComponent(q)}`)}
                          style={{ marginTop: 10, background: 'var(--accent-bg)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', fontSize: 12, color: 'var(--accent-h)', cursor: 'pointer' }}>
                          🎤 Practice this question
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const lStyle = { fontSize: 12, color: 'var(--text2)', fontWeight: 600 }
