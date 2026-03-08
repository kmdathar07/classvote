import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, ArrowLeft, Zap, Wifi, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoom, submitVote, joinRoom } from '../utils/api'
import { getUser } from '../utils/auth'
import { useWebSocket } from '../hooks/useWebSocket'

const REACTIONS = ['👍', '👎', '🤔']
const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AttendeeRoomPage({ darkMode }) {
  const { code } = useParams()
  const navigate = useNavigate()
  const user = getUser()

  const [room, setRoom] = useState(null)
  const [questions, setQuestions] = useState([])
  const [votes, setVotes] = useState({}) // questionId -> optionId
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(null)
  const [activeQ, setActiveQ] = useState(0)
  const [participantCount, setParticipantCount] = useState(0)
  const [roomClosed, setRoomClosed] = useState(false)

  const { isConnected, lastMessage, sendMessage } = useWebSocket(code, user?.id || 'guest')

  useEffect(() => {
    if (!user) { navigate(`/join?code=${code}`); return }
    const init = async () => {
      try {
        const res = await getRoom(code)
        setRoom(res.data)
        setQuestions(res.data.questions || [])
        if (res.data.status !== 'active') setRoomClosed(true)
        await joinRoom({ user_id: user.id, room_code: code })
      } catch (err) {
        toast.error('Room not found')
        navigate('/join')
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [code, user])

  useEffect(() => {
    if (!lastMessage) return
    const { type, payload } = lastMessage
    if (type === 'participant_update') setParticipantCount(payload?.count || 0)
    if (type === 'room_closed') { setRoomClosed(true); toast('Room has been closed by the host', { icon: '🔒' }) }
  }, [lastMessage])

  const handleVote = async (questionId, optionId) => {
    if (!user) return toast.error('Please log in to vote')
    if (roomClosed) return toast.error('Room is closed')
    setSubmitting(questionId)
    try {
      await submitVote({ user_id: user.id, room_code: code, question_id: questionId, option_id: optionId })
      setVotes(prev => ({ ...prev, [questionId]: optionId }))
      sendMessage({ type: 'vote', payload: { question_id: questionId, option_id: optionId } })
      toast.success('Vote submitted! ✅')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit vote')
    } finally {
      setSubmitting(null)
    }
  }

  const handleReaction = (emoji) => {
    sendMessage({ type: 'reaction', payload: { reaction: emoji } })
    toast(emoji, { duration: 1000, style: { fontSize: '28px', padding: '8px 16px', background: 'transparent', boxShadow: 'none', border: 'none' } })
  }

  const allVoted = questions.every(q => votes[q.id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-body">Joining room...</p>
      </div>
    </div>
  )

  const currentQ = questions[activeQ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-display font-bold text-slate-900 dark:text-white text-base leading-none">{room?.title}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isConnected ? <Wifi size={11} className="text-brand-400" /> : <WifiOff size={11} className="text-red-400" />}
                <span className="text-xs text-slate-500 dark:text-slate-400 font-body">
                  {isConnected ? `${participantCount} live` : 'Reconnecting...'}
                </span>
              </div>
            </div>
          </div>
          <div className="font-mono text-sm font-bold text-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 rounded-lg">{code}</div>
        </div>
      </header>

      {roomClosed && (
        <div className="max-w-lg mx-auto px-5 pt-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex items-center gap-3">
            <span className="text-xl">🔒</span>
            <p className="text-amber-800 dark:text-amber-300 font-semibold font-display text-sm">This room has been closed by the host.</p>
          </div>
        </div>
      )}

      <main className="max-w-lg mx-auto px-5 pt-5 space-y-4">
        {/* Progress */}
        {questions.length > 1 && (
          <div className="card py-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display">Progress</span>
              <span className="text-xs font-semibold text-brand-500 font-mono">{Object.keys(votes).length}/{questions.length} voted</span>
            </div>
            <div className="flex gap-1.5">
              {questions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQ(i)}
                  className={`flex-1 h-2 rounded-full transition-all ${votes[q.id] ? 'bg-brand-400' : activeQ === i ? 'bg-brand-200 dark:bg-brand-800' : 'bg-slate-100 dark:bg-slate-700'}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Current question */}
        {currentQ && (
          <div className="card space-y-4 animate-bounce-in">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-7 h-7 bg-brand-100 dark:bg-brand-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 font-mono">Q{activeQ + 1}</span>
                {questions.length > 1 && <span className="text-xs text-slate-400 font-body">of {questions.length}</span>}
                {votes[currentQ.id] && <span className="badge badge-active ml-auto"><CheckCircle2 size={11} /> Voted</span>}
              </div>
              <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white leading-snug">{currentQ.text}</h2>
            </div>

            <div className="space-y-2.5">
              {currentQ.options?.map((opt, i) => {
                const isSelected = votes[currentQ.id] === opt.id
                const isSubmitting = submitting === currentQ.id
                return (
                  <button
                    key={opt.id}
                    onClick={() => !roomClosed && handleVote(currentQ.id, opt.id)}
                    disabled={isSubmitting || roomClosed}
                    className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl border-2 font-semibold font-display text-left transition-all duration-200 active:scale-[0.98] ${
                      isSelected
                        ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
                    } ${roomClosed ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${isSelected ? 'bg-brand-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}
                    >
                      {isSelected ? <CheckCircle2 size={16} /> : String.fromCharCode(65 + i)}
                    </span>
                    {opt.text}
                    {isSubmitting && votes[currentQ.id] !== opt.id && null}
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            {questions.length > 1 && (
              <div className="flex gap-2 pt-1">
                {activeQ > 0 && (
                  <button onClick={() => setActiveQ(activeQ - 1)} className="btn-secondary flex-1 text-sm py-2.5">← Prev</button>
                )}
                {activeQ < questions.length - 1 && (
                  <button onClick={() => setActiveQ(activeQ + 1)} className="btn-primary flex-1 text-sm py-2.5">Next →</button>
                )}
              </div>
            )}
          </div>
        )}

        {/* All voted celebration */}
        {allVoted && (
          <div className="card bg-gradient-to-br from-brand-50 to-green-50 dark:from-brand-900/30 dark:to-green-900/20 border-brand-200 dark:border-brand-800/50 text-center py-8 animate-bounce-in">
            <div className="text-5xl mb-3">🎉</div>
            <h3 className="font-display font-bold text-brand-800 dark:text-brand-300 text-xl mb-1">All votes submitted!</h3>
            <p className="text-brand-600 dark:text-brand-400 text-sm font-body">Wait for your teacher to share the results</p>
          </div>
        )}

        {/* Reactions */}
        <div className="card">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display uppercase tracking-wide mb-3">React to the session</p>
          <div className="flex gap-3 justify-center">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-90 flex-1"
              >
                <span className="text-3xl">{emoji}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-600 font-body pb-2">
          Voting as <span className="font-semibold">{user?.name}</span>
        </p>
      </main>
    </div>
  )
}
