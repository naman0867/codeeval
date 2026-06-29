// src/pages/ProblemListPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

export default function ProblemListPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const isAdmin = ['ADMIN', 'INTERVIEWER'].includes(user?.role)

  useEffect(() => {
    api.get('/problems').then(r => { setProblems(r.data); setLoading(false) })
  }, [])

  const filtered = filter === 'ALL' ? problems : problems.filter(p => p.difficulty === filter)
  const counts = { EASY: problems.filter(p=>p.difficulty==='EASY').length, MEDIUM: problems.filter(p=>p.difficulty==='MEDIUM').length, HARD: problems.filter(p=>p.difficulty==='HARD').length }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo">⚡ CodeEval</span>
        <div className="nav-divider" />
        <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/mock-interview')}>🎤 Mock Interview</button>
        <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/jd-matcher')}>📄 JD Matcher</button>
        {isAdmin && <>
          <div className="nav-divider" />
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/sessions')}>📋 Sessions</button>
          <button className="btn-ghost" style={{ fontSize: 13 }} onClick={() => navigate('/admin')}>⚙️ Admin</button>
        </>}
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--surface2)', borderRadius: 20, border: '1px solid var(--border)' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.name}</span>
        </div>
        <button className="btn-secondary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={logout}>Sign out</button>
      </nav>

      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {/* AI Feature Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div onClick={() => navigate('/mock-interview')} style={{ background: 'linear-gradient(135deg, #1e1f4a 0%, #1a2236 100%)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--radius-xl)', padding: 24, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>🎤</div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎤</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--accent-h)' }}>AI Mock Interview</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>Practice with an AI interviewer for DSA, system design & behavioral. Get scored and a full report.</div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
              <span className="tag tag-accent">DSA</span>
              <span className="tag tag-accent">System Design</span>
              <span className="tag tag-accent">Behavioral</span>
            </div>
          </div>

          <div onClick={() => navigate('/jd-matcher')} style={{ background: 'linear-gradient(135deg, #0a2a1f 0%, #1a2236 100%)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 'var(--radius-xl)', padding: 24, cursor: 'pointer', transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--green)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 80, opacity: 0.06 }}>📄</div>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📄</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--green)' }}>JD ↔ Resume Matcher</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>Match your resume against any JD. Get match score, ATS keywords, resume rewrite & likely questions.</div>
            <div style={{ marginTop: 14, display: 'flex', gap: 6 }}>
              <span className="tag tag-green">Match Score</span>
              <span className="tag tag-green">ATS Keywords</span>
              <span className="tag tag-green">Resume Tips</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Problems', value: problems.length, color: 'var(--text)' },
            { label: 'Easy', value: counts.EASY, color: 'var(--green)' },
            { label: 'Medium', value: counts.MEDIUM, color: 'var(--amber)' },
            { label: 'Hard', value: counts.HARD, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Problem list */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>Problems</h2>
            {['ALL', 'EASY', 'MEDIUM', 'HARD'].map(d => (
              <button key={d} onClick={() => setFilter(d)}
                style={{ padding: '4px 12px', fontSize: 12, background: filter === d ? 'var(--accent)' : 'var(--surface2)', color: filter === d ? '#fff' : 'var(--text2)', border: '1px solid', borderColor: filter === d ? 'var(--accent)' : 'var(--border)', borderRadius: 20 }}>
                {d}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>Loading problems…</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>#</th>
                  <th>Title</th>
                  <th>Difficulty</th>
                  <th>Submissions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} onClick={() => navigate(`/problems/${p.slug}`)}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{p.title}</td>
                    <td><span className={`diff-${p.difficulty}`} style={{ fontWeight: 600, fontSize: 12 }}>{p.difficulty}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{p._count?.submissions ?? 0}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} style={{ padding: 40, textAlign: 'center', color: 'var(--text2)' }}>
                    {isAdmin ? 'No problems yet. Go to Admin Panel to add some!' : 'No problems available yet.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
