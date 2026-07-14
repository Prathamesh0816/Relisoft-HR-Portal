import { useState, useEffect, useMemo } from 'react'
import useStore from '../store'
import { createTicket, getEmployeeTickets, getHrTickets, addTimeline, cancelTicket } from '../api'

const CATEGORIES = {
  'HR Related': ['Document Request', 'Policy Query', 'Payroll Issue', 'Onboarding Help'],
  'Assets Related': ['Device Issue', 'Device Replacement', 'Accessory Request', 'Software Access'],
  General: ['Other Inquiry', 'Feedback', 'Facility Issue', 'Travel Request']
}

function statusClass(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'resolved' || s === 'closed' || s === 'approved') return 'bg-emerald-50 text-emerald-700'
  if (s === 'cancelled') return 'bg-red-50 text-red-700'
  return 'bg-amber-50 text-amber-700'
}

function TicketTimeline({ ticket }) {
  const events = ticket.timeline || []
  return (
    <ol className="space-y-3 mt-3">
      {events.map((ev) => (
        <li key={ev.id} className="flex gap-3">
          <div className="w-2.5 h-2.5 mt-1.5 rounded-full bg-gold-1 shrink-0 ring-4 ring-amber-100" />
          <div>
            <strong className="text-sm text-navy dark:text-white">{ev.status}</strong>
            {ev.notes && <p className="text-sm text-navy/70 dark:text-white/70 mt-0.5">{ev.notes}</p>}
            <span className="text-xs text-navy/50 dark:text-white/50 font-bold">{new Date(ev.createdOn).toLocaleString()}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}

export default function TicketManagement() {
  const { currentUser, data, ticketForm, employeeTickets, hrTickets, updateForm, setSubmitting, resetForm, setEmployeeTickets, setHrTickets, setMessage } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [activeTab, setActiveTab] = useState(isHr ? 'queue' : 'my')
  const [hrUpdates, setHrUpdates] = useState({})
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    if (currentUser?.employeeId) {
      getEmployeeTickets(currentUser.employeeId).then((r) => setEmployeeTickets({ tickets: r.tickets || [], loading: false }))
    }
  }, [currentUser?.employeeId])

  const selectedCategory = ticketForm.category || 'General'

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    if (ticketForm.submitting) return
    setSubmitting('ticketForm', true)
    try {
      await createTicket({
        employeeId: Number(currentUser?.employeeId),
        category: ticketForm.category,
        requestType: ticketForm.requestType,
        itemDetail: ticketForm.itemDetail || undefined,
        subject: ticketForm.subject,
        description: ticketForm.description
      })
      setMessage({ type: 'success', text: 'Ticket generated.' })
      resetForm('ticketForm', { employeeId: String(currentUser?.employeeId || ''), category: 'General', requestType: 'Other Inquiry', itemDetail: '', subject: '', description: '', submitting: false })
      const res = await getEmployeeTickets(currentUser?.employeeId)
      setEmployeeTickets({ tickets: res.tickets || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create ticket.' })
    } finally {
      setSubmitting('ticketForm', false)
    }
  }

  const handleAddTimeline = async (ticketId) => {
    const draft = hrUpdates[ticketId] || {}
    try {
      await addTimeline(ticketId, {
        status: draft.status || 'Coordination',
        notes: draft.notes || '',
        assignedHrId: draft.assignedHrId ? Number(draft.assignedHrId) : null
      })
      setMessage({ type: 'success', text: 'Ticket updated.' })
      const next = { ...hrUpdates }
      delete next[ticketId]
      setHrUpdates(next)
      const res = await getHrTickets()
      setHrTickets({ tickets: res.tickets || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update.' })
    }
  }

  const handleCancelTicket = async (ticket) => {
    const reason = window.prompt('Why are you cancelling this request?', 'No longer needed.')
    if (reason === null) return
    try {
      await cancelTicket(ticket.id, { employeeId: ticket.employeeId, reason })
      setMessage({ type: 'success', text: 'Ticket cancelled.' })
      const res = await getEmployeeTickets(currentUser?.employeeId)
      setEmployeeTickets({ tickets: res.tickets || [] })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to cancel.' })
    }
  }

  const employee = data.employees.find((e) => String(e.id) === String(currentUser?.employeeId))
  const hrEmployees = data.employees.filter((e) => e.role === 'HR' || e.role === 'HRL2')

  const filteredHrTickets = useMemo(() => {
    if (!filterCategory) return hrTickets.tickets
    return hrTickets.tickets.filter((t) => t.category === filterCategory)
  }, [hrTickets.tickets, filterCategory])

  const filteredEmployeeTickets = useMemo(() => {
    if (!filterCategory) return employeeTickets.tickets
    return employeeTickets.tickets.filter((t) => t.category === filterCategory)
  }, [employeeTickets.tickets, filterCategory])

  if (!isHr) {
    return (
      <EmployeeTicketView
        employee={employee}
        tickets={filteredEmployeeTickets}
        loading={employeeTickets.loading}
        onCancel={handleCancelTicket}
        showForm
        currentUser={currentUser}
        ticketForm={ticketForm}
        updateForm={updateForm}
        handleSubmitTicket={handleSubmitTicket}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => { setActiveTab('queue'); getHrTickets().then((r) => setHrTickets({ tickets: r.tickets || [] })) }} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'queue' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>HR queue</button>
            <button onClick={() => setActiveTab('my')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'my' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My tickets</button>
          </div>
        </div>
      </div>
      {activeTab === 'queue' ? (
        <div className="card-surface">
          <div className="p-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">HR ticket queue</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">Tickets are unassigned when generated, so any active HR member can pick up and update the timeline.</p>
            </div>
            <div className="flex gap-2 items-center">
              <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white text-xs font-bold">
                <option value="">All categories</option>
                {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => getHrTickets().then((r) => setHrTickets({ tickets: r.tickets || [] }))} className="px-4 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Refresh</button>
            </div>
          </div>
          <div className="px-5 pb-5 space-y-4">
            {hrTickets.loading ? (
              <div className="text-sm text-navy/50 dark:text-white/50">Loading tickets...</div>
            ) : filteredHrTickets.length === 0 ? (
              <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">No tickets yet.</div>
            ) : filteredHrTickets.map((ticket) => {
              const draft = hrUpdates[ticket.id] || {}
              return (
                <div key={ticket.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-xs font-bold text-navy/50 dark:text-white/50">Ticket #{ticket.id} - {ticket.employeeName} ({ticket.employeeCode})</div>
                      <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{ticket.subject}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{ticket.category}</span>
                        <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">{ticket.requestType}</span>
                        {ticket.itemDetail && <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">{ticket.itemDetail}</span>}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(ticket.status)}`}>{ticket.status}</span>
                      </div>
                    </div>
                    <div className="text-xs text-navy/50 dark:text-white/50 font-bold">{new Date(ticket.createdOn).toLocaleString()}</div>
                  </div>
                  <p className="text-sm text-navy/70 dark:text-white/70">{ticket.description}</p>
                  <TicketTimeline ticket={ticket} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Owner</label>
                      <select value={draft.assignedHrId || ticket.assignedHrId || String(currentUser?.employeeId || '')} onChange={(e) => setHrUpdates((u) => ({ ...u, [ticket.id]: { status: 'Coordination', notes: '', assignedHrId: String(currentUser?.employeeId || ''), ...(u[ticket.id] || {}), assignedHrId: e.target.value } }))} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                        {hrEmployees.map((e) => <option key={e.id} value={e.id}>{e.fullName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Status</label>
                      <select value={draft.status || ticket.status || 'Coordination'} onChange={(e) => setHrUpdates((u) => ({ ...u, [ticket.id]: { ...(u[ticket.id] || {}), status: e.target.value } }))} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                        {['HR Review', 'Coordination', 'Waiting on Employee', 'Resolved', 'Closed'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Timeline note</label>
                      <textarea value={draft.notes || ''} onChange={(e) => setHrUpdates((u) => ({ ...u, [ticket.id]: { ...(u[ticket.id] || {}), notes: e.target.value } }))} placeholder="Share what happens next." className="mt-1.5 w-full h-24 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white resize-vertical" />
                    </div>
                  </div>
                  <button onClick={() => handleAddTimeline(ticket.id)} className="gold-button px-5 py-2.5 rounded-xl font-bold text-xs">Share update</button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <EmployeeTicketView
          employee={employee}
          tickets={filteredEmployeeTickets}
          loading={employeeTickets.loading}
          onCancel={handleCancelTicket}
          showForm
          currentUser={currentUser}
          ticketForm={ticketForm}
          updateForm={updateForm}
          handleSubmitTicket={handleSubmitTicket}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
        />
      )}
    </div>
  )
}

function EmployeeTicketView({ employee, tickets, loading, onCancel, showForm, currentUser, ticketForm, updateForm, handleSubmitTicket, filterCategory, setFilterCategory }) {
  const { setMessage } = useStore()

  return (
    <div className="space-y-4">
      {showForm && (
        <div className="card-surface">
          <div className="p-5">
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Raise a ticket</h2>
            <p className="text-muted dark:text-white/60 text-sm mt-1">Submit HR, asset, or general requests and track them through resolution.</p>
          </div>
          <form onSubmit={handleSubmitTicket} className="px-5 pb-5 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Request owner</div>
                <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{employee?.fullName || 'Signed-in employee'}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['employeeCode', 'email', 'department'].filter((f) => employee?.[f]).map((f) => (
                    <span key={f} className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{employee[f]}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Category</label>
                <select value={ticketForm?.category} disabled={ticketForm?.submitting} onChange={(e) => {
                  const cat = e.target.value
                  const types = CATEGORIES[cat] || ['Other Inquiry']
                  updateForm('ticketForm', 'category', cat)
                  updateForm('ticketForm', 'requestType', types[0])
                }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                  {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Request type</label>
                <select value={ticketForm?.requestType} disabled={ticketForm?.submitting} onChange={(e) => updateForm('ticketForm', 'requestType', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                  {(CATEGORIES[ticketForm?.category] || CATEGORIES['General']).map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Subject</label>
                <input value={ticketForm?.subject} disabled={ticketForm?.submitting} onChange={(e) => updateForm('ticketForm', 'subject', e.target.value)} placeholder="Brief summary of your request" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Item detail (optional)</label>
                <input value={ticketForm?.itemDetail} disabled={ticketForm?.submitting} onChange={(e) => updateForm('ticketForm', 'itemDetail', e.target.value)} placeholder="e.g. Laptop model, document name" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Description</label>
                <textarea value={ticketForm?.description} disabled={ticketForm?.submitting} onChange={(e) => updateForm('ticketForm', 'description', e.target.value)} placeholder="Describe your request in detail." required className="mt-1.5 w-full h-24 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white resize-vertical" />
              </div>
            </div>
            {ticketForm?.submitting && (
              <div className="space-y-2">
                <div className="h-2 rounded-full bg-navy/5 overflow-hidden relative">
                  <div className="absolute inset-0 w-2/4 rounded-full bg-gradient-to-r from-gold-1 to-teal-400 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-navy/50 dark:text-white/50">Submitting ticket...</span>
              </div>
            )}
            <button type="submit" disabled={ticketForm?.submitting} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">
              {ticketForm?.submitting ? 'Submitting...' : 'Raise ticket'}
            </button>
          </form>
        </div>
      )}
      <div className="card-surface">
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white">{showForm ? 'My tickets' : 'Support tickets'}</h2>
            <p className="text-muted dark:text-white/60 text-sm mt-1">Track your requests across categories and review timeline updates from HR.</p>
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white text-xs font-bold">
            <option value="">All categories</option>
            {Object.keys(CATEGORIES).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="px-5 pb-5 space-y-4">
          {loading ? (
            <div className="text-sm text-navy/50 dark:text-white/50">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">No tickets yet.</div>
          ) : tickets.map((ticket) => (
            <div key={ticket.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs font-bold text-navy/50 dark:text-white/50">Ticket #{ticket.id} - {new Date(ticket.createdOn).toLocaleString()}</div>
                  <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{ticket.subject}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{ticket.category}</span>
                    <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">{ticket.requestType}</span>
                    {ticket.itemDetail && <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">{ticket.itemDetail}</span>}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(ticket.status)}`}>{ticket.status}</span>
                  </div>
                </div>
                <div className="text-xs text-navy/50 dark:text-white/50 font-bold">{ticket.assignedHrName ? `HR: ${ticket.assignedHrName}` : 'HR owner pending'}</div>
              </div>
              <p className="text-sm text-navy/70 dark:text-white/70">{ticket.description}</p>
              <TicketTimeline ticket={ticket} />
              {ticket.status !== 'Cancelled' && ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                <button onClick={() => onCancel(ticket)} className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100">Cancel request</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
