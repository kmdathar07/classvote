import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Zap, Moon, Sun, PlusCircle, QrCode, History, LogOut, ChevronRight } from 'lucide-react'
import { getUser, clearUser } from '../utils/auth'
import toast from 'react-hot-toast'

export default function DashboardPage({ darkMode, setDarkMode }) {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    clearUser()
    toast.success('Logged out!')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">ClassVote</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button
              onClick={handleLogout}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-8">
        {/* Greeting */}
        <div className="mb-8 animate-slide-up">
          <p className="text-sm text-slate-500 dark:text-slate-400 font-body mb-1">Welcome back,</p>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">{user?.name} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-body mt-1">{user?.email}</p>
        </div>

        {/* Role cards */}
        <div className="mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          <h2 className="font-display font-semibold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide mb-3">What would you like to do?</h2>

          <div className="grid gap-3">
            {/* Host card */}
            <button
              onClick={() => navigate('/create-room')}
              className="card flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/40 rounded-2xl flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60 transition-colors">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">Host a Poll</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-body">Create a room and share with students</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>

            {/* Attendee card */}
            <button
              onClick={() => navigate('/join')}
              className="card flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                  <span className="text-2xl">📲</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">Join a Room</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-body">Enter room code or scan QR code</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>

            {/* History card */}
            <button
              onClick={() => navigate('/history')}
              className="card flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 group text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700/50 rounded-2xl flex items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-slate-700 transition-colors">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">Room History</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-body">View past rooms and results</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 transition-colors flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Quick tip */}
        <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/50 rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="font-display font-semibold text-brand-800 dark:text-brand-300 text-sm mb-0.5">Quick Tip</p>
              <p className="text-brand-700 dark:text-brand-400 text-sm font-body">Share the QR code on your classroom screen. Students can join instantly by scanning with their phone camera.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
