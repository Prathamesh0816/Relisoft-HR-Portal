import { useState, useEffect } from 'react'
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../api'
import useStore from '../store'
import { Megaphone, Plus, X, MessageCircle, AlertCircle, Info } from 'lucide-react'

export default function Announcements() {
  const { currentUser, announcements, setAnnouncements } = useStore()
  const [list, setList] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'General', priority: 'Normal' })
  const [submitting, setSubmitting] = useState(false)

  const isHR = ['HRL2', 'HR', 'Admin', 'SuperAdmin'].includes(currentUser?.role)

  useEffect(() => {
    getAnnouncements().then(setList).catch(() => {})
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return
    setSubmitting(true)
    try {
      await createAnnouncement(form)
      setForm({ title: '', content: '', category: 'General', priority: 'Normal' })
      setShowForm(false)
      const updated = await getAnnouncements()
      setList(updated)
    } catch {}
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteAnnouncement(id)
      setList(prev => prev.filter(a => a.id !== id))
    } catch {}
  }

  const priorityColors = {
    High: 'text-danger bg-red-50 dark:bg-red-900/20',
    Urgent: 'text-warning bg-orange-50 dark:bg-orange-900/20',
    Normal: 'text-teal bg-teal-50 dark:bg-teal-900/20'
  }
  const categoryIcons = {
    General: Info,
    'HR Policy': MessageCircle,
    Event: Megaphone,
    Alert: AlertCircle,
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-kicker">Communication</span>
          <h2 className="section-title text-2xl mt-1">Announcements</h2>
        </div>
        {isHR && (
          <button onClick={() => setShowForm(!showForm)} className="gold-button px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-surface p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40"
                placeholder="Announcement title" required />
            </div>
            <div>
              <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40">
                <option>General</option>
                <option>HR Policy</option>
                <option>Event</option>
                <option>Alert</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40">
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Content</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={4}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40"
              placeholder="Announcement content" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="gold-button px-5 py-2 rounded-xl text-sm font-bold">
              {submitting ? 'Posting...' : 'Post Announcement'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5 dark:hover:bg-white/5">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <Megaphone size={40} className="mx-auto mb-3 text-gold-1/50" />
            <p className="text-muted dark:text-white/60 text-sm">No announcements yet</p>
          </div>
        ) : list.map((a) => {
          const CatIcon = categoryIcons[a.category] || Info
          return (
            <div key={a.id} className="card-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    a.priority === 'Urgent' ? 'bg-orange-100 dark:bg-orange-900/30 text-warning' :
                    a.priority === 'High' ? 'bg-red-100 dark:bg-red-900/30 text-danger' :
                    'bg-gold-1/10 text-gold-1'
                  }`}>
                    <CatIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-navy dark:text-white">{a.title}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColors[a.priority] || priorityColors.Normal}`}>
                        {a.priority}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy/5 dark:bg-white/10 text-navy/60 dark:text-white/60">
                        {a.category}
                      </span>
                    </div>
                    <p className="text-sm text-muted dark:text-white/70 mt-2 whitespace-pre-wrap">{a.content}</p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-muted dark:text-white/40">
                      <span>{a.createdByName}</span>
                      <span>{new Date(a.createdOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
                {isHR && (
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted hover:text-danger transition-all shrink-0">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
