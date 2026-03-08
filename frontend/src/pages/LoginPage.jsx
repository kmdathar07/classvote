import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Moon, Sun, Zap, Users, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { loginUser } from '../utils/api'
import { saveUser } from '../utils/auth'

export default function LoginPage({ darkMode, setDarkMode }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const res = await loginUser(form)
      saveUser(res.data)
      toast.success(`Welcome, ${res.data.name}! 🎉`)
      navigate('/dashboard')
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-brand-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900 dark:text-white">ClassVote</span>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-colors shadow-sm"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Hero */}
          <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 px-4 py-1.5 rounded-full text-sm font-semibold font-display mb-5 border border-brand-100 dark:border-brand-800">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              Live Voting Platform
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">
              Engage your<br />
              <span className="text-brand-500">classroom</span> live
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-body text-base leading-relaxed">
              Instant polls, real-time results, zero setup.<br />Students join by scanning a QR code.
            </p>
          </div>

          {/* Features row */}
          <div className="grid grid-cols-3 gap-3 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {[
              { icon: Zap, label: 'Instant Polls' },
              { icon: Users, label: 'Live Participants' },
              { icon: BarChart3, label: 'Real-time Charts' }
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="card py-4 text-center">
                <Icon size={20} className="text-brand-500 mx-auto mb-1.5" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-display">{label}</span>
              </div>
            ))}
          </div>

          {/* Login form */}
          <div className="card animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-1">Get started</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 font-body">No password required. Just your name and email.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Your Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Priya Sharma"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. priya@college.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 text-base mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Continue <span>→</span></>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-5 font-body">
            By continuing you agree to our terms of service
          </p>
        </div>
      </main>
    </div>
  )
}
