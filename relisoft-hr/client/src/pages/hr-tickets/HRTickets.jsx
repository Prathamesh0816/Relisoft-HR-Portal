import { useState, useEffect } from 'react'
import { Ticket, Plus, X, Loader2, MessageCircle, Clock, CheckCircle, AlertCircle, ChevronDown, Send, RefreshCw, Building } from 'lucide-react'
import toast from 'react-hot-toast'
import { ticketAPI } from '../../services/api'
import { hrTicketCategories } from '../../data/hrPolicyData'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-500',
  'on-hold': 'bg-purple-100 text-purple-800',
}

const statusIcons = {
  open: AlertCircle,
  'in-progress': Loader2,
  resolved: CheckCircle,
  closed: X,
  'on-hold': Clock,
}

const priorities = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
]

export default function HRTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [form, setForm] = useState({ category: hrTicketCategories[0].id, subject: '', priority: 'medium', description: '' })
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [commentText, setCommentText] = useState({})

  useEffect(() => { loadTickets() }, [])

  const loadTickets = async () => {
    setLoading(true)
    try {
      const { data } = await ticketAPI.getMyTickets()
      setTickets(data?.data || data?.tickets || [])
    } catch (err) {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await ticketAPI.create({
        category: 'hr',
        subject: form.subject,
        priority: form.priority,
        description: `[${hrTicketCategories.find((c) => c.id === form.category)?.label}] ${form.description}`,
      })
      toast.success('HR ticket created successfully!')
      setShowModal(false)
      setForm({ category: hrTicketCategories[0].id, subject: '', priority: 'medium', description: '' })
      loadTickets()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async (ticketId) => {
    const text = commentText[ticketId]
    if (!text?.trim()) return
    try {
      await ticketAPI.addComment(ticketId, { message: text })
      toast.success('Comment added')
      setCommentText((p) => ({ ...p, [ticketId]: '' }))
      loadTickets()
    } catch {
      toast.error('Failed to add comment')
    }
  }

  const handleStatusChange = async (ticketId, status) => {
    try {
      await ticketAPI.updateStatus(ticketId, { status })
      toast.success(`Ticket ${status}`)
      loadTickets()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filteredTickets = filterStatus === 'all' ? tickets : tickets.filter((t) => t.status === filterStatus)

  const categoryMeta = (catId) => hrTicketCategories.find((c) => c.id === catId)

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Ticket className="h-8 w-8" style={{ color: 'var(--moss)' }} />
              <h1 className="text-3xl font-bold text-gray-900">HR Support Tickets</h1>
            </div>
            <p className="text-gray-500 mt-1">Raise and track HR-related requests — laptop, appraisal, offboarding & more</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center px-4 py-2.5 bg-relisoft-600 text-white rounded-xl hover:bg-relisoft-700 transition-colors shadow-sm text-sm font-medium">
            <Plus className="h-4 w-4 mr-1.5" /> Create Ticket
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 mr-1">Filter:</span>
            {['all', 'open', 'in-progress', 'resolved', 'closed'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'text-white' : 'text-gray-600 bg-gray-50 hover:bg-gray-100'}`}
                style={filterStatus === s ? { background: 'var(--moss)' } : {}}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && <span className="ml-1 opacity-80">({tickets.filter((t) => t.status === s).length})</span>}
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-auto">{filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-100">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} />
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
            <Ticket className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No HR tickets found</p>
            <p className="text-gray-400 text-sm">Create a ticket to get HR assistance</p>
            <button onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 text-sm font-medium text-white rounded-lg" style={{ background: 'var(--moss)' }}>
              <Plus className="h-4 w-4 inline mr-1" /> Create First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => {
              const StatusIcon = statusIcons[ticket.status] || AlertCircle
              const catMeta = categoryMeta(
                (ticket.description || '').match(/\[(.*?)\]/)?.[1]
                  ? hrTicketCategories.find((c) => c.label === (ticket.description || '').match(/\[(.*?)\]/)[1])?.id
                  : ''
              )
              return (
                <div key={ticket._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <div className="p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === ticket._id ? null : ticket._id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0 mt-0.5">{catMeta?.icon || '🎫'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-sm">{ticket.subject}</h3>
                            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{ticket.ticketId}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                            {ticket.description?.replace(/\[.*?\]\s*/, '')}
                          </p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[ticket.status] || 'bg-gray-100'}`}>
                              <StatusIcon className="h-2.5 w-2.5" /> {ticket.status}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${priorities.find((p) => p.value === ticket.priority)?.color || ''}`}>
                              {ticket.priority}
                            </span>
                            {ticket.comments?.length > 0 && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                                <MessageCircle className="h-3 w-3" /> {ticket.comments.length}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400">
                              <Clock className="h-3 w-3 inline mr-0.5" />
                              {new Date(ticket.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronDown className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${expandedId === ticket._id ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {expandedId === ticket._id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                      <div className="flex gap-2 mb-4">
                        {['open', 'in-progress', 'resolved', 'closed'].filter((s) => s !== ticket.status).map((s) => (
                          <button key={s} onClick={() => handleStatusChange(ticket._id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${statusColors[s] || 'bg-gray-100'} hover:opacity-80`}>
                            Set {s}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                        {(ticket.comments || []).map((c, i) => (
                          <div key={i} className="text-sm p-2 bg-white rounded-lg border border-gray-100">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-0.5">
                              <span className="font-medium text-gray-600">{c.user?.name || 'Employee'}</span>
                              <span>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-gray-700">{c.message}</p>
                          </div>
                        ))}
                        {(!ticket.comments || ticket.comments.length === 0) && (
                          <p className="text-xs text-gray-400 text-center py-2">No comments yet</p>
                        )}
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); handleAddComment(ticket._id) }} className="flex gap-2">
                        <input type="text" value={commentText[ticket._id] || ''}
                          onChange={(e) => setCommentText((p) => ({ ...p, [ticket._id]: e.target.value }))}
                          placeholder="Add a comment..." autoFocus
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-relisoft-600"
                        />
                        <button type="submit" disabled={!commentText[ticket._id]?.trim()}
                          className="p-2 rounded-lg text-white disabled:opacity-50" style={{ background: 'var(--moss)' }}>
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Ticket className="h-5 w-5" style={{ color: 'var(--moss)' }} />
                Create HR Ticket
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                  {hrTicketCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Brief title for your request"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                  {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4} placeholder="Describe your request in detail..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none resize-none" required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg text-sm hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
