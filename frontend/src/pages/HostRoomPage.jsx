import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, Copy, Download, X, RefreshCw, Share2, UserX, ChevronDown, ChevronUp, ArrowLeft, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { getRoom, getRoomResults, closeRoom, kickUser, getParticipants, exportResults } from '../utils/api'
import { getUser } from '../utils/auth'
import { useWebSocket } from '../hooks/useWebSocket'

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const REACTIONS_MAP = { '👍': 0, '👎': 0, '🤔': 0 }

export default function HostRoomPage({ darkMode }) {
  const { code } = useParams()
  const navigate = useNavigate()
  const user = getUser()

  const [room, setRoom] = useState(null)
  const [results, setResults] = useState([])
  const [participants, setParticipants] = useState([])
  const [participantCount, setParticipantCount] = useState(0)
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [reactions, setReactions] = useState({ ...REACTIONS_MAP })
  const [flyReactions, setFlyReactions] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(0)
  const joinUrl = `${window.location.origin}/room/${code}`

  const { isConnected, lastMessage } = useWebSocket(code, `host_${user?.id}`)

  const fetchResults = useCallback(async () => {
    try {
      const res = await getRoomResults(code)
      setRoom(res.data.room)
      setResults(res.data.questions)
      setParticipantCount(res.data.participant_count)
      const total = res.data.questions.reduce((sum, q) => sum + (q.total_votes || 0), 0)
      setTotalVotes(total)
    } catch {}
  }, [code])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchResults()
      setLoading(false)
    }
    init()
  }, [fetchResults])

  // Handle WS messages
  useEffect(() => {
    if (!lastMessage) return
    const { type, payload } = lastMessage
    if (type === 'vote_update' || type === 'participant_update') {
      fetchResults()
    }
    if (type === 'reaction') {
      const r = payload?.reaction
      if (r && r in reactions) {
        setReactions(prev => ({ ...prev, [r]: (prev[r] || 0) + 1 }))
        const id = Date.now()
        setFlyReactions(prev => [...prev, { id, emoji: r }])
        setTimeout(() => setFlyReactions(prev => prev.filter(x => x.id !== id)), 2000)
      }
    }
  }, [lastMessage])

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Room code copied!')
  }

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl)
    toast.success('Join link copied!')
  }

  const handleCloseRoom = async () => {
    if (!confirm('Close this room? Students will no longer be able to vote.')) return
    try {
      await closeRoom(code)
      toast.success('Room closed')
      fetchResults()
    } catch { toast.error('Failed to close room') }
  }

  const handleKick = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from the room?`)) return
    try {
      await kickUser(code, userId)
      toast.success(`${userName} removed`)
      const res = await getParticipants(code)
      setParticipants(res.data)
    } catch { toast.error('Failed to kick user') }
  }

  const loadParticipants = async () => {
    try {
      const res = await getParticipants(code)
      setParticipants(res.data)
    } catch {}
    setShowParticipants(!showParticipants)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 dark:text-slate-400 font-body">Loading room...</p>
      </div>
    </div>
  )

  const currentQ = results[activeQuestion]

  const chartData = currentQ?.options?.map(opt => ({
    name: opt.text.length > 12 ? opt.text.slice(0, 12) + '…' : opt.text,
    votes: opt.votes,
    percentage: opt.percentage
  })) || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-10">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="font-display font-bold text-slate-900 dark:text-white text-base leading-none">{room?.title}</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-brand-400' : 'bg-red-400'}`} />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-body">{isConnected ? 'Live' : 'Reconnecting...'}</span>
                <span className={`ml-1 text-xs font-semibold font-display ${room?.status === 'active' ? 'text-brand-500' : 'text-red-400'}`}>
                  {room?.status === 'active' ? '● Active' : '◼ Closed'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchResults} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500">
              <RefreshCw size={14} />
            </button>
            {room?.status === 'active' && (
              <button onClick={handleCloseRoom} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold font-display rounded-xl border border-red-100 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                <X size={13} /> Close
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 pt-5 space-y-4">
        {/* Room code + QR */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display uppercase tracking-wide mb-1">Room Code</p>
              <div className="room-code">{code}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={copyCode} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold font-display rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors border border-slate-200 dark:border-slate-600">
                <Copy size={12} /> Copy Code
              </button>
              <button onClick={copyLink} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold font-display rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 transition-colors border border-slate-200 dark:border-slate-600">
                <Share2 size={12} /> Copy Link
              </button>
            </div>
          </div>
          <button onClick={() => setShowQR(!showQR)} className="text-sm text-brand-500 dark:text-brand-400 font-semibold font-display flex items-center gap-1">
            {showQR ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showQR ? 'Hide' : 'Show'} QR Code
          </button>
          {showQR && (
            <div className="mt-4 flex justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
              <QRCodeSVG value={joinUrl} size={200} level="H" includeMargin />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <div className="text-3xl font-bold font-display text-brand-500 mb-0.5">{participantCount}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-body flex items-center justify-center gap-1"><Users size={13} /> Participants</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold font-display text-blue-500 mb-0.5">{totalVotes}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-body">Total Votes</div>
          </div>
        </div>

        {/* Reactions */}
        <div className="card relative overflow-hidden">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display uppercase tracking-wide mb-3">Live Reactions</p>
          <div className="flex gap-4">
            {Object.entries(reactions).map(([emoji, count]) => (
              <div key={emoji} className="flex items-center gap-2">
                <span className="text-2xl">{emoji}</span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200 text-lg">{count}</span>
              </div>
            ))}
          </div>
          {/* Flying reactions */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            {flyReactions.map(({ id, emoji }) => (
              <span key={id} className="absolute reaction-fly text-2xl" style={{ right: Math.random() * 40 + 'px' }}>{emoji}</span>
            ))}
          </div>
        </div>

        {/* Question tabs */}
        {results.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {results.map((q, i) => (
              <button
                key={i}
                onClick={() => setActiveQuestion(i)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold font-display transition-all ${activeQuestion === i ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'}`}
              >
                Q{i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Live results */}
        {currentQ && (
          <div className="card space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display uppercase tracking-wide mb-1">Question {activeQuestion + 1}</p>
              <h3 className="font-display font-bold text-slate-900 dark:text-white text-lg">{currentQ.text}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-body">{currentQ.total_votes} votes</p>
            </div>

            {/* Bar chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: darkMode ? '#94a3b8' : '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fontFamily: 'DM Sans', fill: darkMode ? '#94a3b8' : '#64748b' }} />
                  <Tooltip
                    formatter={(val, name, props) => [`${val} votes (${props?.payload?.percentage || 0}%)`, 'Votes']}
                    contentStyle={{ borderRadius: '12px', border: 'none', background: darkMode ? '#1e293b' : '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Option bars */}
            <div className="space-y-2">
              {currentQ.options?.map((opt, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-body text-slate-700 dark:text-slate-300">{opt.text}</span>
                    <span className="font-semibold font-mono text-slate-600 dark:text-slate-400">{opt.votes} ({opt.percentage}%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full vote-bar transition-all duration-700"
                      style={{ width: `${opt.percentage}%`, background: COLORS[i % COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Participants panel */}
        <div className="card">
          <button onClick={loadParticipants} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2 font-display font-bold text-slate-900 dark:text-white">
              <Users size={16} className="text-brand-500" /> Participants ({participantCount})
            </div>
            {showParticipants ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </button>
          {showParticipants && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {participants.length === 0 ? (
                <p className="text-slate-400 dark:text-slate-500 text-sm font-body text-center py-3">No participants yet</p>
              ) : participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div>
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 font-display">{p.users?.name}</p>
                    <p className="text-xs text-slate-400 font-body">{p.users?.email}</p>
                  </div>
                  {room?.status === 'active' && (
                    <button onClick={() => handleKick(p.user_id, p.users?.name)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <UserX size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export */}
        <a
          href={exportResults(code)}
          download
          className="w-full btn-secondary flex items-center justify-center gap-2 text-sm"
        >
          <Download size={16} /> Export Results (CSV)
        </a>
      </div>
    </div>
  )
}
