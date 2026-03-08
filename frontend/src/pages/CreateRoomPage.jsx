import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Clock, Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { createRoom } from '../utils/api'
import { getUser } from '../utils/auth'

const emptyQuestion = () => ({ text: '', options: [{ text: '' }, { text: '' }] })

export default function CreateRoomPage({ darkMode }) {
  const navigate = useNavigate()
  const user = getUser()

  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [timerMinutes, setTimerMinutes] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [loading, setLoading] = useState(false)

  const addQuestion = () => setQuestions([...questions, emptyQuestion()])

  const removeQuestion = (qi) => {
    if (questions.length === 1) return toast.error('At least one question required')
    setQuestions(questions.filter((_, i) => i !== qi))
  }

  const updateQuestion = (qi, text) => {
    const q = [...questions]
    q[qi].text = text
    setQuestions(q)
  }

  const addOption = (qi) => {
    if (questions[qi].options.length >= 6) return toast.error('Max 6 options')
    const q = [...questions]
    q[qi].options.push({ text: '' })
    setQuestions(q)
  }

  const removeOption = (qi, oi) => {
    if (questions[qi].options.length <= 2) return toast.error('Min 2 options')
    const q = [...questions]
    q[qi].options.splice(oi, 1)
    setQuestions(q)
  }

  const updateOption = (qi, oi, text) => {
    const q = [...questions]
    q[qi].options[oi].text = text
    setQuestions(q)
  }

  const handleCreate = async () => {
    if (!title.trim()) return toast.error('Room title is required')
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) return toast.error(`Question ${i + 1} text is required`)
      for (let j = 0; j < questions[i].options.length; j++) {
        if (!questions[i].options[j].text.trim()) return toast.error(`Option ${j + 1} in Question ${i + 1} is required`)
      }
    }
    setLoading(true)
    try {
      const payload = {
        title: title.trim(),
        host_id: user.id,
        questions,
        timer_minutes: timerMinutes ? parseInt(timerMinutes) : null,
        anonymous
      }
      const res = await createRoom(payload)
      toast.success('Room created! 🎉')
      navigate(`/host/${res.data.code}`)
    } catch (err) {
      toast.error('Failed to create room. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-brand-500" />
            <span className="font-display font-bold text-lg text-slate-900 dark:text-white">Create Room</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 pt-6 space-y-5">
        {/* Room settings */}
        <div className="card space-y-4">
          <h2 className="font-display font-bold text-slate-900 dark:text-white">Room Settings</h2>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Room Title</label>
            <input className="input-field" placeholder="e.g. DBMS Lecture, Mid-Semester Feedback" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">
                <Clock size={13} className="inline mr-1" />Timer (minutes)
              </label>
              <input className="input-field" type="number" placeholder="30" min="1" max="120" value={timerMinutes} onChange={(e) => setTimerMinutes(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Leave blank = no expiry</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-display">Voting Mode</label>
              <button
                onClick={() => setAnonymous(!anonymous)}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold font-display transition-all ${anonymous ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
              >
                {anonymous ? <EyeOff size={14} /> : <Eye size={14} />}
                {anonymous ? 'Anonymous' : 'Named'}
              </button>
            </div>
          </div>
        </div>

        {/* Questions */}
        {questions.map((q, qi) => (
          <div key={qi} className="card space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 bg-brand-100 dark:bg-brand-900/40 rounded-lg flex items-center justify-center text-xs font-bold text-brand-600 dark:text-brand-400 font-mono">Q{qi + 1}</span>
                <span className="font-display font-bold text-slate-900 dark:text-white">Question {qi + 1}</span>
              </div>
              <button onClick={() => removeQuestion(qi)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="e.g. Conduct test today?"
              value={q.text}
              onChange={(e) => updateQuestion(qi, e.target.value)}
            />

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 font-display uppercase tracking-wide">Answer Options</label>
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex gap-2 items-center">
                  <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs text-slate-400 font-mono">{String.fromCharCode(65 + oi)}</span>
                  <input
                    className="input-field py-2"
                    placeholder={`Option ${oi + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />
                  <button onClick={() => removeOption(qi, oi)} className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addOption(qi)}
                className="flex items-center gap-1.5 text-brand-500 dark:text-brand-400 text-sm font-semibold font-display hover:text-brand-600 transition-colors mt-1"
              >
                <Plus size={14} /> Add Option
              </button>
            </div>
          </div>
        ))}

        {/* Add question */}
        <button
          onClick={addQuestion}
          className="w-full card border-dashed border-2 border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-700 text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 transition-all flex items-center justify-center gap-2 py-4 font-semibold font-display"
        >
          <Plus size={16} /> Add Another Question
        </button>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 text-base py-4"
        >
          {loading ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : '🚀 Create Room & Get Code'}
        </button>
      </main>
    </div>
  )
}
