// src/pages/AdminPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import api from '../api/client'

const LANGUAGES = ['PYTHON', 'JAVASCRIPT', 'JAVA', 'CPP']
const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

const STARTER_DEFAULTS = {
  PYTHON: `def solution():\n    # Your solution here\n    pass\n\nimport sys\ndata = sys.stdin.read().strip().split('\\n')\n`,
  JAVASCRIPT: `function solution() {\n  // Your solution here\n}\n\nconst lines = require('fs').readFileSync('/dev/stdin','utf8').trim().split('\\n');\n`,
  JAVA: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your solution here\n    }\n}`,
  CPP: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Your solution here\n    return 0;\n}`,
}

export default function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [problems, setProblems] = useState([])
  const [view, setView] = useState('list') // list | create | edit
  const [editingProblem, setEditingProblem] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!['ADMIN', 'INTERVIEWER'].includes(user?.role)) {
      navigate('/problems')
    }
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    setLoading(true)
    const { data } = await api.get('/problems')
    setProblems(data)
    setLoading(false)
  }

  const handleEdit = async (problem) => {
    const { data } = await api.get(`/problems/${problem.slug}`)
    setEditingProblem(data)
    setView('edit')
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this problem?')) return
    await api.delete(`/problems/${id}`)
    fetchProblems()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Nav */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>CodeEval</span>
        <span style={{ color: 'var(--text2)', fontSize: 13 }}>Admin</span>
        <div style={{ flex: 1 }} />
        <button className="btn-secondary" style={{ padding: '4px 12px', fontSize: 12 }} onClick={() => navigate('/problems')}>← Problems</button>
        <span style={{ fontSize: 13, color: 'var(--text2)' }}>{user?.name}</span>
        <button className="btn-secondary" style={{ padding: '4px 12px' }} onClick={logout}>Sign out</button>
      </header>

      <main style={{ flex: 1, overflow: 'auto', padding: 32 }}>
        {view === 'list' && (
          <ProblemList
            problems={problems}
            loading={loading}
            onNew={() => { setEditingProblem(null); setView('create') }}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
        {(view === 'create' || view === 'edit') && (
          <ProblemForm
            problem={editingProblem}
            onSave={() => { fetchProblems(); setView('list') }}
            onCancel={() => setView('list')}
          />
        )}
      </main>
    </div>
  )
}

// ─── Problem List ─────────────────────────────────────────────────────────────
function ProblemList({ problems, loading, onNew, onEdit, onDelete }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>Problems</h2>
        <button className="btn-primary" onClick={onNew}>+ New Problem</button>
      </div>

      {loading ? <p style={{ color: 'var(--text2)' }}>Loading…</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Title', 'Difficulty', 'Test Cases', 'Public', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 12px', color: 'var(--text2)', fontWeight: 500, textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {problems.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '12px' }}>{p.title}</td>
                <td style={{ padding: '12px' }}>
                  <span className={`diff-${p.difficulty}`}>{p.difficulty}</span>
                </td>
                <td style={{ padding: '12px', color: 'var(--text2)' }}>{p._count?.submissions ?? 0} submissions</td>
                <td style={{ padding: '12px' }}>{p.isPublic ? '✅' : '🔒'}</td>
                <td style={{ padding: '12px', display: 'flex', gap: 8 }}>
                  <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onEdit(p)}>Edit</button>
                  <button className="btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => onDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

// ─── Problem Form ─────────────────────────────────────────────────────────────
function ProblemForm({ problem, onSave, onCancel }) {
  const isEdit = !!problem
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('details') // details | testcases | starter
  const [activeLang, setActiveLang] = useState('PYTHON')

  const [form, setForm] = useState({
    title: problem?.title || '',
    slug: problem?.slug || '',
    description: problem?.description || '',
    difficulty: problem?.difficulty || 'MEDIUM',
    timeLimit: problem?.timeLimit || 2000,
    memoryLimit: problem?.memoryLimit || 256,
    isPublic: problem?.isPublic ?? false,
  })

  const [testCases, setTestCases] = useState(
    problem?.testCases?.length > 0
      ? problem.testCases
      : [{ input: '', expected: '', isHidden: false }]
  )

  const [starterCode, setStarterCode] = useState(() => {
    const sc = {}
    LANGUAGES.forEach(l => {
      const found = problem?.starterCode?.find(s => s.language === l)
      sc[l] = found?.code || STARTER_DEFAULTS[l]
    })
    return sc
  })

  const [error, setError] = useState('')

  const handleTitleChange = (title) => {
    setForm(f => ({
      ...f,
      title,
      slug: f.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }))
  }

  const addTestCase = () => setTestCases(t => [...t, { input: '', expected: '', isHidden: false }])
  const removeTestCase = (i) => setTestCases(t => t.filter((_, idx) => idx !== i))
  const updateTestCase = (i, field, value) => setTestCases(t => t.map((tc, idx) => idx === i ? { ...tc, [field]: value } : tc))

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.description) {
      setError('Title, slug, and description are required.')
      return
    }
    if (testCases.some(tc => !tc.input || !tc.expected)) {
      setError('All test cases must have input and expected output.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        timeLimit: parseInt(form.timeLimit),
        memoryLimit: parseInt(form.memoryLimit),
        testCases: testCases.map((tc, i) => ({ ...tc, order: i })),
        starterCode: LANGUAGES.map(l => ({ language: l, code: starterCode[l] })),
      }
      if (isEdit) {
        await api.put(`/problems/${problem.id}`, payload)
      } else {
        await api.post('/problems', payload)
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'testcases', label: `Test Cases (${testCases.length})` },
    { id: 'starter', label: 'Starter Code' },
    { id: 'preview', label: 'Preview' },
  ]

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, flex: 1 }}>{isEdit ? `Edit: ${problem.title}` : 'New Problem'}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Problem' : 'Create Problem'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#2a1a1a', border: '1px solid var(--red)', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#ffa198' }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              background: 'transparent', borderRadius: 0, padding: '10px 18px',
              fontSize: 13, color: activeTab === t.id ? 'var(--text)' : 'var(--text2)',
              borderBottom: activeTab === t.id ? '2px solid var(--blue-h)' : '2px solid transparent',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Title</label>
              <input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Two Sum" />
            </div>
            <div>
              <label style={labelStyle}>Slug (URL)</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="two-sum" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Time Limit (ms)</label>
              <input type="number" value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: e.target.value }))} />
            </div>
            <div>
              <label style={labelStyle}>Memory Limit (MB)</label>
              <input type="number" value={form.memoryLimit} onChange={e => setForm(f => ({ ...f, memoryLimit: e.target.value }))} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description (Markdown)</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={12}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'vertical' }}
              placeholder="## Problem Title&#10;&#10;Problem description here...&#10;&#10;### Example 1&#10;```&#10;Input: ...&#10;Output: ...&#10;```"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="checkbox" id="isPublic" checked={form.isPublic}
              onChange={e => setForm(f => ({ ...f, isPublic: e.target.checked }))}
              style={{ width: 'auto' }} />
            <label htmlFor="isPublic" style={{ fontSize: 13, cursor: 'pointer' }}>
              Make public (visible to all candidates)
            </label>
          </div>
        </div>
      )}

      {/* Test Cases Tab */}
      {activeTab === 'testcases' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>Visible test cases are shown to candidates. Hidden ones only run on final submit.</p>
            <button className="btn-primary" onClick={addTestCase} style={{ padding: '6px 14px' }}>+ Add Test Case</button>
          </div>

          {testCases.map((tc, i) => (
            <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>Case {i + 1}</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', marginRight: 12 }}>
                  <input type="checkbox" checked={tc.isHidden} onChange={e => updateTestCase(i, 'isHidden', e.target.checked)} style={{ width: 'auto' }} />
                  Hidden
                </label>
                {testCases.length > 1 && (
                  <button className="btn-danger" style={{ padding: '3px 8px', fontSize: 12 }} onClick={() => removeTestCase(i)}>Remove</button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Input</label>
                  <textarea value={tc.input} onChange={e => updateTestCase(i, 'input', e.target.value)}
                    rows={4} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
                    placeholder="[2,7,11,15]&#10;9" />
                </div>
                <div>
                  <label style={labelStyle}>Expected Output</label>
                  <textarea value={tc.expected} onChange={e => updateTestCase(i, 'expected', e.target.value)}
                    rows={4} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }}
                    placeholder="[0,1]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Starter Code Tab */}
      {activeTab === 'starter' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setActiveLang(l)}
                className={activeLang === l ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '5px 14px', fontSize: 12 }}>
                {l}
              </button>
            ))}
          </div>
          <label style={labelStyle}>Starter code for {activeLang}</label>
          <textarea
            value={starterCode[activeLang]}
            onChange={e => setStarterCode(s => ({ ...s, [activeLang]: e.target.value }))}
            rows={20}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'vertical' }}
          />
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Problem view</h3>
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 16, fontSize: 14 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{form.title || 'Untitled'}</span>
                <span className={`diff-${form.difficulty}`} style={{ fontSize: 12 }}>{form.difficulty}</span>
              </div>
              <div style={{ color: 'var(--text2)', fontSize: 12, marginBottom: 12 }}>
                ⏱ {form.timeLimit}ms &nbsp;💾 {form.memoryLimit}MB
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7 }}>
                {form.description || 'No description yet.'}
              </pre>
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Test cases ({testCases.filter(t => !t.isHidden).length} visible, {testCases.filter(t => t.isHidden).length} hidden)</h3>
            {testCases.filter(t => !t.isHidden).map((tc, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 8, fontSize: 13 }}>
                <div style={{ color: 'var(--text2)', marginBottom: 4 }}>Case {i + 1}</div>
                <div><span style={{ color: 'var(--text2)' }}>Input: </span><code style={{ fontFamily: 'var(--font-mono)' }}>{tc.input}</code></div>
                <div><span style={{ color: 'var(--text2)' }}>Expected: </span><code style={{ fontFamily: 'var(--font-mono)' }}>{tc.expected}</code></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = { fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 6 }
