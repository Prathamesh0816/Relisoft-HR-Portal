import { useEffect, useState } from 'react'
import useStore from '../store'
import { getSurveys, createSurvey, getSurvey, respondToSurvey, getMySurveys } from '../api'
import { BarChart3, Plus, CheckCircle, Eye, Edit3, X, ListChecks, Star, MessageSquare } from 'lucide-react'

function AddQuestion({ onAdd }) {
  const [type, setType] = useState('text')
  const [text, setText] = useState('')
  const [options, setOptions] = useState('')

  const handleAdd = () => {
    if (!text.trim()) return
    const q = { questionText: text, type }
    if (type === 'choice' || type === 'multiple') {
      q.options = options.split(',').map((o) => o.trim()).filter(Boolean)
    }
    onAdd(q)
    setText('')
    setOptions('')
  }

  return (
    <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <select value={type} onChange={(e) => setType(e.target.value)} className="input">
          <option value="text">Text</option>
          <option value="rating">Rating (1-5)</option>
          <option value="choice">Single Choice</option>
          <option value="multiple">Multiple Choice</option>
        </select>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Question text" className="input" />
      </div>
      {(type === 'choice' || type === 'multiple') && (
        <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Options (comma-separated)" className="input w-full" />
      )}
      <button onClick={handleAdd} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />Add Question</button>
    </div>
  )
}

export default function SurveyBuilder() {
  const { surveys, setSurveys, setMessage, currentUser } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('active')
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', isAnonymous: false, questions: [] })
  const [showCreate, setShowCreate] = useState(false)
  const [respondingTo, setRespondingTo] = useState(null)
  const [responses, setResponses] = useState({})

  useEffect(() => {
    Promise.all([getSurveys(), getMySurveys()]).then(([a, m]) =>
      setSurveys({ list: a.surveys || [], mySurveys: m.surveys || [], loading: false })
    )
  }, [])

  const refreshAll = async () => {
    const [a, m] = await Promise.all([getSurveys(), getMySurveys()])
    setSurveys({ list: a.surveys || [], mySurveys: m.surveys || [] })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createSurvey(form)
      setMessage({ type: 'success', text: 'Survey created.' })
      setForm({ title: '', description: '', startDate: '', endDate: '', isAnonymous: false, questions: [] })
      setShowCreate(false)
      refreshAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleRespond = async (surveyId) => {
    try {
      await respondToSurvey(surveyId, Object.entries(responses).map(([qId, val]) => ({ questionId: Number(qId), value: val })))
      setMessage({ type: 'success', text: 'Responses submitted.' })
      setRespondingTo(null)
      setResponses({})
      refreshAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const openRespond = async (survey) => {
    const full = await getSurvey(survey.id)
    setRespondingTo(full)
    setResponses({})
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('active')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'active' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Active Surveys</button>
            <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'my' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Responses</button>
            {isHr && <button onClick={() => setTab('create')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'create' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Create Survey</button>}
          </div>
        </div>
      </div>

      {tab === 'active' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Active Surveys</h2>
          <p className="text-muted text-sm mb-4">Complete open surveys and share your feedback.</p>
          {surveys.list.length === 0 ? (
            <p className="text-muted text-sm">No active surveys.</p>
          ) : (
            <div className="space-y-3">
              {surveys.list.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{s.title}</div>
                    <div className="text-xs text-muted mt-1">{s.description?.slice(0, 120)}</div>
                    <div className="text-xs text-muted mt-1">{s.isAnonymous ? 'Anonymous' : 'Named'} · {s.questions?.length || 0} questions</div>
                  </div>
                  <button onClick={() => openRespond(s)} className="btn-primary text-xs"><CheckCircle size={14} className="inline mr-1" />Respond</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {respondingTo && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">{respondingTo.title}</h2>
              <p className="text-muted text-sm mt-1">{respondingTo.description}</p>
            </div>
            <button onClick={() => { setRespondingTo(null); setResponses({}) }} className="px-3 py-1.5 rounded-xl border border-navy/10 text-muted font-bold text-xs"><X size={14} className="inline mr-1" />Close</button>
          </div>
          <div className="space-y-4">
            {(respondingTo.questions || []).map((q, i) => (
              <div key={q.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="font-bold text-navy dark:text-white text-sm mb-2">{i + 1}. {q.questionText}</div>
                {q.type === 'text' && (
                  <textarea value={responses[q.id] || ''} onChange={(e) => setResponses((s) => ({ ...s, [q.id]: e.target.value }))} rows={3} className="input w-full" placeholder="Your answer..." />
                )}
                {q.type === 'rating' && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button key={r} onClick={() => setResponses((s) => ({ ...s, [q.id]: String(r) }))} className={`w-10 h-10 rounded-xl font-bold text-sm ${responses[q.id] === String(r) ? 'bg-gold-1 text-navy-dark' : 'bg-gray-100 dark:bg-navy-dark/60 text-muted hover:bg-gray-200'}`}>{r}</button>
                    ))}
                  </div>
                )}
                {q.type === 'choice' && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oi) => (
                      <label key={oi} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name={`q_${q.id}`} value={opt} checked={responses[q.id] === opt} onChange={(e) => setResponses((s) => ({ ...s, [q.id]: e.target.value }))} className="accent-gold-1" />
                        <span className="text-sm text-navy dark:text-white">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'multiple' && (
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oi) => {
                      const selected = (responses[q.id] || '').split(',').filter(Boolean)
                      const isSelected = selected.includes(opt)
                      return (
                        <label key={oi} className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={isSelected} onChange={() => {
                            const next = isSelected ? selected.filter((x) => x !== opt) : [...selected, opt]
                            setResponses((s) => ({ ...s, [q.id]: next.join(',') }))
                          }} className="accent-gold-1 rounded" />
                          <span className="text-sm text-navy dark:text-white">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button onClick={() => handleRespond(respondingTo.id)} className="btn-primary mt-4"><CheckCircle size={16} /> Submit Responses</button>
        </div>
      )}

      {tab === 'my' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Responses</h2>
          <p className="text-muted text-sm mb-4">Surveys you have participated in.</p>
          {surveys.mySurveys.length === 0 ? (
            <p className="text-muted text-sm">No responses yet.</p>
          ) : (
            <div className="space-y-3">
              {surveys.mySurveys.map((s) => (
                <div key={s.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{s.title}</div>
                    <div className="text-xs text-muted mt-1">Responded on {new Date(s.respondedOn).toLocaleDateString()}</div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'create' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Create Survey</h2>
          <p className="text-muted text-sm mb-4">Design and publish a new survey.</p>
          <form onSubmit={handleCreate} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Title</label>
                <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required className="input w-full" />
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))} rows={3} className="input w-full" />
              </div>
              <div>
                <label className="label">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm((s) => ({ ...s, startDate: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm((s) => ({ ...s, endDate: e.target.value }))} required className="input w-full" />
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isAnonymous} onChange={(e) => setForm((s) => ({ ...s, isAnonymous: e.target.checked }))} className="rounded" />
                  <span className="text-sm font-bold text-navy dark:text-white">Anonymous responses</span>
                </label>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Questions ({form.questions.length})</label>
              </div>
              {form.questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] mb-2">
                  <div className="flex-1">
                    <div className="text-sm font-bold text-navy dark:text-white">{q.questionText}</div>
                    <div className="text-xs text-muted">{q.type}{q.options ? ` · ${q.options.join(', ')}` : ''}</div>
                  </div>
                  <button onClick={() => setForm((s) => ({ ...s, questions: s.questions.filter((_, j) => j !== i) }))} className="p-1.5 rounded-lg bg-red-50 text-red-600"><X size={14} /></button>
                </div>
              ))}
              <AddQuestion onAdd={(q) => setForm((s) => ({ ...s, questions: [...s.questions, q] }))} />
            </div>
            <button type="submit" className="btn-primary"><BarChart3 size={16} /> Create Survey</button>
          </form>
        </div>
      )}
    </div>
  )
}
