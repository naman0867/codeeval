// src/pages/SessionsPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

const STATUS_COLORS = {
  SCHEDULED: { bg: '#1a2a3a', color: '#79c0ff' },
  ACTIVE:    { bg: '#1a3a1a', color: '#56d364' },
  COMPLETED: { bg: '#1a1a2a', color: '#d2a8ff' },
  CANCELLED: { bg: '#2a1a1a', color: '#f85149' },
}

export default function SessionsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)

  useEffect(() => {
    fetchSessions()
    api.get('/problems').then(r => setProblems(r.data))
  }, [])

  const fetchSessions = async () => {
    setLoading(true)
    const { data } = await api.get('/sessions')
    setSessions(data)
    setLoading(false)
  }

  const handleEnd = async (id) => {
    const notes = prompt('Add feedback notes (optional):') ?? ''
    await api.patch(`/sessions/${id}/end`, { notes })
    fetchSessions()
  }

  const handleCancel = async (id) => {
    if (!confirm('Cancel this session?')) return
    await api.patch(`/sessions/${id}/cancel`)
    fetchSessions()
  }

  const copyLink = (token) => {
    const url = `${window.location.origin}/interview/${token}`
    navigator.clipboard.writeText(url)
    alert('Link copied to clipboard!\n\n' + url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 16, cursor: 'pointer' }} onClick={() => navigate('/problems')}>CodeEval</span>
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>Sessions</span>
        <div style={{ flex: 1 }} />
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/admin')}>⚙️ Admin</button>
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/problems')}>Problems</button>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.name}</span>
        <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={logout}>Sign out</button>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>Interview Sessions</h2>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New Session</button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total', value: sessions.length, color: 'var(--text)' },
            { label: 'Active', value: sessions.filter(s => s.status === 'ACTIVE').length, color: '#56d364' },
            { label: 'Scheduled', value: sessions.filter(s => s.status === 'SCHEDULED').length, color: '#79c0ff' },
            { label: 'Completed', value: sessions.filter(s => s.status === 'COMPLETED').length, color: '#d2a8ff' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Sessions Table */}
        {loading ? <p style={{ color: 'var(--text2)' }}>Loading…</p> : sessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p>No sessions yet. Create one to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.map(s => (
              <div key={s.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  {/* Status */}
                  <span style={{ ...STATUS_COLORS[s.status], fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600, flexShrink: 0 }}>
                    {s.status}
                  </span>

                  {/* Candidate */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{s.candidate.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>{s.candidate.email}</div>
                  </div>

                  {/* Problem */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13 }}>{s.problem.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }} className={`diff-${s.problem.difficulty}`}>{s.problem.difficulty}</div>
                  </div>

                  {/* Latest verdict */}
                  <div style={{ width: 80, textAlign: 'center' }}>
                    {s.submissions[0] ? (
                      <>
                        <span className={`verdict verdict-${s.submissions[0].verdict}`}>{s.submissions[0].verdict}</span>
                        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{Math.round((s.submissions[0].score || 0) * 100)}%</div>
                      </>
                    ) : <span style={{ fontSize: 12, color: 'var(--text2)' }}>No submissions</span>}
                  </div>

                  {/* Duration */}
                  <div style={{ fontSize: 12, color: 'var(--text2)', width: 60, textAlign: 'center' }}>
                    {s.duration}min
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {s.status !== 'CANCELLED' && s.status !== 'COMPLETED' && (
                      <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => copyLink(s.token)}>
                        📋 Copy Link
                      </button>
                    )}
                    {s.status === 'ACTIVE' && (
                      <button className="btn-primary" style={{ padding: '4px 10px', fontSize: 11, background: '#d29922' }}
                        onClick={() => handleEnd(s.id)}>
                        End
                      </button>
                    )}
                    {s.status === 'SCHEDULED' && (
                      <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => handleCancel(s.id)}>
                        Cancel
                      </button>
                    )}
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 11 }}
                      onClick={() => setSelectedSession(s)}>
                      View
                    </button>
                  </div>
                </div>

                {/* Notes */}
                {s.notes && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--surface2)', borderRadius: 4, fontSize: 12, color: 'var(--text2)' }}>
                    📝 {s.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Session Modal */}
      {showCreate && (
        <CreateSessionModal
          problems={problems}
          onClose={() => setShowCreate(false)}
          onCreated={() => { fetchSessions(); setShowCreate(false) }}
        />
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

// ─── Create Session Modal ─────────────────────────────────────────────────────
function CreateSessionModal({ problems, onClose, onCreated }) {
  const [form, setForm] = useState({
    candidateEmail: '',
    candidateName: '',
    problemId: problems[0]?.id || '',
    duration: 60,
    scheduledAt: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)

  const handleCreate = async () => {
    if (!form.candidateEmail || !form.problemId) {
      setError('Email and problem are required')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.post('/sessions', form)
      setCreated(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create session')
    } finally {
      setSaving(false)
    }
  }

  const inviteLink = created ? `${window.location.origin}/interview/${created.token}` : ''

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>New Interview Session</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 18, padding: '0 4px' }}>✕</button>
        </div>

        {!created ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Candidate Email</label>
                <input type="email" value={form.candidateEmail} placeholder="candidate@college.edu"
                  onChange={e => setForm(f => ({ ...f, candidateEmail: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Candidate Name (optional)</label>
                <input value={form.candidateName} placeholder="John Doe"
                  onChange={e => setForm(f => ({ ...f, candidateName: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Problem</label>
                <select value={form.problemId} onChange={e => setForm(f => ({ ...f, problemId: e.target.value }))}>
                  {problems.map(p => <option key={p.id} value={p.id}>{p.title} ({p.difficulty})</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Duration (minutes)</label>
                  <select value={form.duration} onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) }))}>
                    {[30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Scheduled At (optional)</label>
                  <input type="datetime-local" value={form.scheduledAt}
                    onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} />
                </div>
              </div>
            </div>

            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginTop: 12 }}>{error}</p>}

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving} style={{ flex: 1 }}>
                {saving ? 'Creating…' : 'Create Session'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Session created!</p>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>Share this link with the candidate:</p>
            <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 14px', fontSize: 12, fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginBottom: 16 }}>
              {inviteLink}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(inviteLink); alert('Copied!') }}>
                📋 Copy Link
              </button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={onCreated}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Session Detail Modal ─────────────────────────────────────────────────────
function SessionDetailModal({ session, onClose }) {
  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, flex: 1 }}>Session Details</h3>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text2)', fontSize: 18, padding: '0 4px' }}>✕</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <div><p style={labelStyle}>Candidate</p><p style={{ fontSize: 14 }}>{session.candidate.name}</p><p style={{ fontSize: 12, color: 'var(--text2)' }}>{session.candidate.email}</p></div>
          <div><p style={labelStyle}>Problem</p><p style={{ fontSize: 14 }}>{session.problem.title}</p></div>
          <div><p style={labelStyle}>Status</p><span style={{ ...STATUS_COLORS[session.status], fontSize: 11, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>{session.status}</span></div>
          <div><p style={labelStyle}>Duration</p><p style={{ fontSize: 14 }}>{session.duration} minutes</p></div>
          {session.startedAt && <div><p style={labelStyle}>Started</p><p style={{ fontSize: 13 }}>{new Date(session.startedAt).toLocaleString()}</p></div>}
          {session.endedAt && <div><p style={labelStyle}>Ended</p><p style={{ fontSize: 13 }}>{new Date(session.endedAt).toLocaleString()}</p></div>}
        </div>

        {session.submissions?.length > 0 && (
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Submissions ({session.submissions.length})</p>
            {session.submissions.map((sub, i) => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text2)' }}>#{i + 1}</span>
                <span className={`verdict verdict-${sub.verdict}`}>{sub.verdict}</span>
                <span>{sub.language}</span>
                <span style={{ color: 'var(--text2)' }}>{Math.round((sub.score || 0) * 100)}% passed</span>
                <span style={{ color: 'var(--text2)', marginLeft: 'auto', fontSize: 12 }}>{new Date(sub.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        )}

        {session.notes && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--surface2)', borderRadius: 6 }}>
            <p style={labelStyle}>Feedback Notes</p>
            <p style={{ fontSize: 13 }}>{session.notes}</p>
          </div>
        )}

        <button className="btn-secondary" onClick={onClose} style={{ width: '100%', marginTop: 20 }}>Close</button>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
}
const modalStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
  padding: 28, width: '90%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
}
const labelStyle = { fontSize: 12, color: 'var(--text2)', marginBottom: 4, display: 'block' }
