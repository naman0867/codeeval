// src/pages/LoginPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'register') {
        await api.post('/auth/register', { email: form.email, password: form.password, name: form.name })
      }
      await login(form.email, form.password)
      navigate('/problems')
    } catch (err) {
      setError(err.response?.data?.error || (tab === 'login' ? 'Invalid credentials' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', overflow: 'auto', padding: 20 }}>
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>⚡</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CodeEval</h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 6 }}>Placement Preparation Platform</p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {[['login', 'Sign In'], ['register', 'Sign Up']].map(([id, label]) => (
              <button key={id} onClick={() => { setTab(id); setError('') }}
                style={{ flex: 1, padding: '14px', background: 'transparent', borderRadius: 0, fontSize: 14, fontWeight: 500,
                  color: tab === id ? 'var(--text)' : 'var(--text2)',
                  borderBottom: tab === id ? '2px solid var(--accent-h)' : '2px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tab === 'register' && (
              <div>
                <label style={lStyle}>Full Name</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
              </div>
            )}
            <div>
              <label style={lStyle}>Email</label>
              <input type="email" required autoFocus value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@college.edu" />
            </div>
            <div>
              <label style={lStyle}>Password</label>
              <input type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" minLength={8} />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px', fontSize: 14, fontWeight: 600, marginTop: 4 }}>
              {loading ? '…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            {tab === 'login' && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)' }}>Demo: admin@codeeval.dev / admin123</p>}
          </form>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 20 }}>AI-powered • Built for college placements 🎓</p>
      </div>
    </div>
  )
}
const lStyle = { fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6, fontWeight: 500 }
