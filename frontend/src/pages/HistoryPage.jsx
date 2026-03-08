import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Calendar, ChevronRight, BarChart3 } from 'lucide-react'
import { getUserRooms } from '../utils/api'
import { getUser } from '../utils/auth'

export default function HistoryPage({ darkMode }) {
  const navigate = useNavigate()
  const user = getUser()
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getUserRooms(user.id)
        setRooms(res.data)
      } catch {}
      setLoading(false)
    }
    fetch()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">Room History</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="font-display font-bold text-slate-800 dark:text-slate-200 text-xl mb-2">No rooms yet</h3>
            <p className="text-slate-500 dark:text-slate-400 font-body text-sm mb-5">Create your first voting room to get started</p>
            <button onClick={() => navigate('/create-room')} className="btn-primary">Create a Room</button>
          </div>
        ) : (
          <div className="space-y-3 animate-slide-up">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => navigate(`/host/${room.code}`)}
                className="card w-full text-left flex items-center justify-between hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-lg hover:shadow-brand-500/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 size={20} className="text-brand-500" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-slate-900 dark:text-white text-base">{room.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={room.status === 'active' ? 'badge-active' : 'badge bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: '600' }}>
                        {room.status === 'active' ? '● Active' : '◼ Closed'}
                      </span>
                      <span className="text-xs text-slate-400 font-body font-mono">{room.code}</span>
                      <span className="text-xs text-slate-400 font-body">{room.questions?.length || 0} Q</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar size={11} className="text-slate-400" />
                      <span className="text-xs text-slate-400 font-body">
                        {new Date(room.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
