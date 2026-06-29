// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import ProblemListPage from './pages/ProblemListPage'
import EditorPage from './pages/EditorPage'
import AdminPage from './pages/AdminPage'
import SessionsPage from './pages/SessionsPage'
import InterviewPage from './pages/InterviewPage'
import MockInterviewPage from './pages/MockInterviewPage'
import JDMatcherPage from './pages/JDMatcherPage'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/problems" element={<PrivateRoute><ProblemListPage /></PrivateRoute>} />
        <Route path="/problems/:slug" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/sessions" element={<PrivateRoute><SessionsPage /></PrivateRoute>} />
        <Route path="/interview/:token" element={<PrivateRoute><InterviewPage /></PrivateRoute>} />
        <Route path="/mock-interview" element={<PrivateRoute><MockInterviewPage /></PrivateRoute>} />
        <Route path="/jd-matcher" element={<PrivateRoute><JDMatcherPage /></PrivateRoute>} />
        <Route path="/" element={<Navigate to="/problems" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
