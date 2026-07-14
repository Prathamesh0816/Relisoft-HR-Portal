import { useEffect, useState } from 'react'
import useStore from '../store'
import { getVisitors, createVisitor, updateVisitor, checkInVisitor, checkOutVisitor, getTodayVisitors } from '../api'
import { Users, Plus, LogIn, LogOut, Search, Filter, Calendar, Building, Phone, Mail } from 'lucide-react'

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'checked-in') return 'bg-emerald-50 text-emerald-700'
  if (s === 'checked-out') return 'bg-gray-50 text-gray-600'
  if (s === 'cancelled') return 'bg-red-50 text-red-600'
  return 'bg-amber-50 text-amber-700'
}

export default function VisitorManagement() {
  const { visitors, setVisitors, setMessage, currentUser } = useStore()
  const [tab, setTab] = useState('today')
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', hostEmployeeId: '', purpose: '', expectedDate: new Date().toISOString().slice(0, 10), expectedTime: '10:00' })
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const { data } = useStore()

  useEffect(() => {
    Promise.all([getTodayVisitors(), getVisitors()]).then(([t, all]) =>
      setVisitors({ todayVisitors: t.visitors || [], list: all.visitors || [], loading: false })
    )
  }, [])

  const refreshAll = async () => {
    const [t, all] = await Promise.all([getTodayVisitors(), getVisitors(statusFilter || undefined)])
    setVisitors({ todayVisitors: t.visitors || [], list: all.visitors || [] })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await createVisitor({ ...form, expectedDate: form.expectedDate, expectedTime: form.expectedTime })
      setMessage({ type: 'success', text: res.message || 'Visitor registered.' })
      setForm({ name: '', email: '', phone: '', company: '', hostEmployeeId: '', purpose: '', expectedDate: new Date().toISOString().slice(0, 10), expectedTime: '10:00' })
      await refreshAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    } finally { setSubmitting(false) }
  }

  const handleCheckIn = async (id) => {
    try { await checkInVisitor(id); setMessage({ type: 'success', text: 'Visitor checked in.' }); await refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleCheckOut = async (id) => {
    try { await checkOutVisitor(id); setMessage({ type: 'success', text: 'Visitor checked out.' }); await refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('today')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'today' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Today's Visitors</button>
            <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'all' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>All Visitors</button>
            <button onClick={() => setTab('register')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'register' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Register</button>
          </div>
        </div>
      </div>

      {tab === 'today' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Today's Visitors</h2>
          <p className="text-muted text-sm mb-4">Manage visitor check-ins and check-outs.</p>
          {visitors.todayVisitors.length === 0 ? (
            <p className="text-muted text-sm">No visitors today.</p>
          ) : (
            <div className="space-y-3">
              {visitors.todayVisitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{v.name}</div>
                    <div className="text-xs text-muted mt-1">{v.company} · {v.purpose} · Host: {v.hostName}</div>
                    {v.expectedTime && <div className="text-xs text-muted">Expected: {v.expectedTime?.slice(0, 5)}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span>
                    {v.status === 'Pending' && (
                      <button onClick={() => handleCheckIn(v.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><LogIn size={14} className="inline mr-1" />Check In</button>
                    )}
                    {v.status === 'Checked-In' && (
                      <button onClick={() => handleCheckOut(v.id)} className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 font-bold text-xs hover:bg-gray-100"><LogOut size={14} className="inline mr-1" />Check Out</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white">All Visitors</h2>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); getVisitors(e.target.value || undefined).then((r) => setVisitors({ list: r.visitors || [] })) }} className="input w-40 text-xs">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Checked-In">Checked In</option>
              <option value="Checked-Out">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          {visitors.list.length === 0 ? (
            <p className="text-muted text-sm">No visitors found.</p>
          ) : (
            <div className="space-y-3">
              {visitors.list.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{v.name}</div>
                    <div className="text-xs text-muted mt-1">{v.email} · {v.phone}</div>
                    <div className="text-xs text-muted">{v.company} · {v.purpose} · Host: {v.hostName}</div>
                    <div className="text-xs text-muted">{new Date(v.expectedDate).toLocaleDateString()} {v.expectedTime?.slice(0, 5)}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(v.status)}`}>{v.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'register' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Register Visitor</h2>
          <p className="text-muted text-sm mb-4">Pre-register a visitor for scheduled visits.</p>
          <form onSubmit={handleRegister} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Company</label>
                <input value={form.company} onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Host</label>
                <select value={form.hostEmployeeId} onChange={(e) => setForm((s) => ({ ...s, hostEmployeeId: e.target.value }))} required className="input w-full">
                  <option value="">Select host...</option>
                  {data.employees.filter((e) => e.status === 'Active').map((e) => (
                    <option key={e.id} value={e.id}>{e.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Purpose</label>
                <input value={form.purpose} onChange={(e) => setForm((s) => ({ ...s, purpose: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Expected Date</label>
                <input type="date" value={form.expectedDate} onChange={(e) => setForm((s) => ({ ...s, expectedDate: e.target.value }))} required className="input w-full" />
              </div>
              <div>
                <label className="label">Expected Time</label>
                <input type="time" value={form.expectedTime} onChange={(e) => setForm((s) => ({ ...s, expectedTime: e.target.value }))} required className="input w-full" />
              </div>
            </div>
            {submitting && <div className="text-xs text-muted">Registering...</div>}
            <button type="submit" disabled={submitting} className="btn-primary"><Users size={16} /> {submitting ? 'Registering...' : 'Register Visitor'}</button>
          </form>
        </div>
      )}
    </div>
  )
}
