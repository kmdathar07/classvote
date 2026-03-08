import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoom } from '../utils/api'
import { getUser } from '../utils/auth'

export default function JoinPage({ darkMode }) {
  const navigate = useNavigate()
  const user = getUser()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const handleJoin = async () => {
    const roomCode = code.trim().toUpperCase()
    if (!roomCode || roomCode.length !== 6) return toast.error('Enter a valid 6-character room code')
    setLoading(true)
    try {
      await getRoom(roomCode)
      if (!user) {
        // Store temp credentials for guest join
        if (!name || !email) {
          toast.error('Please enter your name and email')
          setLoading(false)
          return
        }
        const { loginUser } = await import('../utils/api')
        const { saveUser } = await import('../utils/auth')
        const res = await loginUser({ name, email })
        saveUser(res.data)
      }
      navigate(`/room/${roomCode}`)
    } catch (err) {
      if (err.response?.status === 404) toast.error('Room not found. Check the code.')
      else toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate(user ? '/dashboard' : '/')} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">Join Room</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg mx-auto px-5 pt-12 w-full">
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/30 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-float">
            <QrCode size={36} className="text-brand-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-2">Enter Room Code</h1>
          <p className="text-slate-500 dark:text-slate-400 font-body text-sm">Ask your teacher for the 6-character room code</p>
        </div>

        <div className="card space-y-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
          {!user && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Your Name</label>
                <input className="input-field" placeholder="e.g. Arjun Mehta" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Email</label>
                <input className="input-field" type="email" placeholder="e.g. arjun@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <hr className="border-slate-100 dark:border-slate-700" />
            </>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Room Code</label>
            <input
              className="input-field text-center text-2xl font-mono font-bold tracking-[0.25em] uppercase"
              placeholder="A7KD92"
              value={code}
              maxLength={6}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '🚀 Join Room'}
          </button>
        </div>

        <div className="mt-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-slate-400 dark:text-slate-500 text-sm font-body mb-2">Or scan the QR code from your teacher's screen</p>
          <div className="inline-flex items-center gap-2 text-brand-500 dark:text-brand-400 text-sm font-semibold font-display">
            <QrCode size={14} /> Point your camera at the QR code
          </div>
        </div>
      </main>
    </div>
  )
}
