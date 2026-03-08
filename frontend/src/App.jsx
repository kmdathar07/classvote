import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CreateRoomPage from './pages/CreateRoomPage'
import HostRoomPage from './pages/HostRoomPage'
import JoinPage from './pages/JoinPage'
import AttendeeRoomPage from './pages/AttendeeRoomPage'
import HistoryPage from './pages/HistoryPage'
import { getUser } from './utils/auth'

function ProtectedRoute({ children }) {
  const user = getUser()
  if (!user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('classvote_dark') === 'true'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('classvote_dark', darkMode)
  }, [darkMode])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <Toaster
        position="top-center"
        toastOptions={{
          className: 'font-body text-sm',
          style: {
            borderRadius: '12px',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#f1f5f9' : '#0f172a',
            border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LoginPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>
        } />
        <Route path="/create-room" element={
          <ProtectedRoute><CreateRoomPage darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>
        } />
        <Route path="/host/:code" element={
          <ProtectedRoute><HostRoomPage darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute><HistoryPage darkMode={darkMode} setDarkMode={setDarkMode} /></ProtectedRoute>
        } />
        <Route path="/join" element={<JoinPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/room/:code" element={<AttendeeRoomPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
      </Routes>
    </div>
  )
}
