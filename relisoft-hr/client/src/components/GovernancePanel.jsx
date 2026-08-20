import { useEffect, useState } from 'react'
import useStore from '../store'
import { getResilienceFeedback, createResilienceFeedback, getAuditLog, getEncashments, approveEncashment, rejectEncashment, markEncashmentPaid, getAttendanceRegularizations, reviewRegularization, getExpiringDocuments, verifyDocument, getVirtualIdCard, getGatePass, getVisitors } from '../api'
import { Shield, CheckCircle, XCircle, Edit3, ThumbsUp, MessageSquare, History, Wallet, CalendarCheck, FileWarning, BadgeCheck, DoorOpen, X } from 'lucide-react'

const fmt = (n) => '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })

export default function GovernancePanel() {
  const { resilience, setResilience, setMessage, currentUser, data, visitors, setVisitors } = useStore()
  const [tab, setTab] = useState('phase2')
  const [form, setForm] = useState({ employeeName: '', action: '', decision: 'accept', reason: '' })
  const feedbacks = resilience.feedbacks || []
  const [loading, setLoading] = useState(false)
  const [p2Tab, setP2Tab] = useState('audit')
  const [audit, setAudit] = useState([])
  const [encashments, setEncashments] = useState([])
  const [regularizations, setRegularizations] = useState([])
  const [expiring, setExpiring] = useState([])
  const [preview, setPreview] = useState(null)
  const [filter, setFilter] = useState('')

  const isAdmin = ['HRL2', 'HR', 'Admin', 'SuperAdmin', 'OrganizationHead', 'Manager', 'ManagerL2'].includes(currentUser?.role)

  useEffect(() => {
    getResilienceFeedback().then((d) => setResilience({ feedbacks: Array.isArray(d) ? d : (d.feedbacks || []) })).catch(() => {})
  }, [])

  const loadPhase2 = async () => {
    setLoading(true)
    try {
      const [a, e, r, ex] = await Promise.all([
        getAuditLog(),
        getEncashments(),
        getAttendanceRegularizations(),
        getExpiringDocuments(90)
      ])
      setAudit(a || [])
      setEncashments(e || [])
      setRegularizations(r || [])
      setExpiring(ex || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load governance data.' })
    }
    setLoading(false)
  }

  useEffect(() => { if (tab === 'phase2') loadPhase2() }, [tab])

  useEffect(() => {
    if (p2Tab === 'gatepass' && !(visitors.list || []).length) {
      getVisitors().then((r) => setVisitors({ list: Array.isArray(r) ? r : r.visitors || [] })).catch(() => {})
    }
  }, [p2Tab])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await createResilienceFeedback(form)
      setMessage({ type: 'success', text: res.message || 'Feedback submitted.' })
      setForm({ employeeName: '', action: '', decision: 'accept', reason: '' })
      const d = await getResilienceFeedback()
      setResilience({ feedbacks: Array.isArray(d) ? d : (d.feedbacks || []) })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
    }
  }

  const statusPill = (s) => {
    const map = {
      Pending: 'bg-amber-50 text-amber-700 border-amber-200',
      Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Rejected: 'bg-red-50 text-red-700 border-red-200',
      Paid: 'bg-blue-50 text-blue-700 border-blue-200',
      Verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      NotVerified: 'bg-slate-100 text-slate-600 border-slate-200'
    }
    return map[s] || 'bg-slate-50 text-slate-600 border-slate-200'
  }

  const handleApproveEncashment = async (id) => {
    try { const r = await approveEncashment(id, currentUser.employeeId); setMessage({ type: 'success', text: r.message }); loadPhase2() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleRejectEncashment = async (id) => {
    try { const r = await rejectEncashment(id); setMessage({ type: 'success', text: r.message }); loadPhase2() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handlePayEncashment = async (id) => {
    try { const r = await markEncashmentPaid(id); setMessage({ type: 'success', text: r.message }); loadPhase2() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleRegularization = async (id, approve) => {
    try { const r = await reviewRegularization(id, approve); setMessage({ type: 'success', text: r.message }); loadPhase2() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleVerify = async (id, verified) => {
    try { const r = await verifyDocument(id, verified, ''); setMessage({ type: 'success', text: r.message }); loadPhase2() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const openPreview = async (type, id, title) => {
    try {
      const html = type === 'id-card' ? await getVirtualIdCard(id) : await getGatePass(id)
      setPreview({ type, html, title })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Could not open preview.' })
    }
  }

  const tabs = [
    { key: 'phase2', label: 'HR Governance', icon: Shield },
    { key: 'feedback', label: 'Feedback Overrides', icon: ThumbsUp },
  ]

  const phase2Tabs = [
    { key: 'audit', label: 'Audit Trail', icon: History },
    { key: 'encashment', label: 'Leave Encashment', icon: Wallet },
    { key: 'regularization', label: 'Attendance Regularization', icon: CalendarCheck },
    { key: 'documents', label: 'Document Expiry & Verification', icon: FileWarning },
    { key: 'idcard', label: 'Virtual ID Card', icon: BadgeCheck },
    { key: 'gatepass', label: 'Gate Pass', icon: DoorOpen },
  ]

  const filteredAudit = audit.filter((a) => {
    if (!filter) return true
    const q = filter.toLowerCase()
    return [a.action, a.entityType, a.actorName, a.details].some((v) => (v || '').toLowerCase().includes(q))
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${tab === t.key ? 'bg-gold-1 text-navy-dark border-gold-2' : 'bg-white text-navy/60 border-navy/10 hover:bg-navy/5'}`}>
            <t.icon size={13} className="inline mr-1" />{t.label}
          </button>
        ))}
      </div>

      {tab === 'phase2' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {phase2Tabs.map((t) => (
              <button key={t.key} onClick={() => setP2Tab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${p2Tab === t.key ? 'bg-gold-1 text-navy-dark border-gold-2' : 'bg-white text-navy/60 border-navy/10 hover:bg-navy/5'}`}>
                <t.icon size={13} className="inline mr-1" />{t.label}
              </button>
            ))}
          </div>

          {loading && <div className="text-sm text-muted">Loading...</div>}

          {p2Tab === 'audit' && (
            <div className="card-surface p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <h3 className="font-heading font-bold text-navy dark:text-white"><History size={16} className="inline mr-1" /> Audit Trail</h3>
                <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter actions / actors..." className="input w-64 text-xs" />
              </div>
              {filteredAudit.length === 0 ? (
                <p className="text-sm text-muted">No audit entries yet.</p>
              ) : (
                <div className="space-y-2 max-h-[32rem] overflow-y-auto">
                  {filteredAudit.map((a) => (
                    <div key={a.id} className="flex items-start justify-between gap-3 border border-navy/5 dark:border-white/10 rounded-lg p-3 bg-slate-50/50 dark:bg-white/5">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy dark:text-white">{a.action} <span className="text-muted font-normal">· {a.entityType}{a.entityId ? ` #${a.entityId}` : ''}</span></div>
                        <div className="text-xs text-muted truncate">{a.details || '—'}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] font-bold text-navy/60 dark:text-white/60">{a.actorName || 'System'}</div>
                        <div className="text-[10px] text-muted">{new Date(a.createdOn).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {p2Tab === 'encashment' && (
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-3">Leave Encashment Requests</h3>
              {encashments.length === 0 ? (
                <p className="text-sm text-muted">No encashment requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {encashments.map((e) => (
                    <div key={e.id} className="flex items-center justify-between gap-3 border border-navy/5 dark:border-white/10 rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy dark:text-white">{e.employeeName} · {e.leaveTypeName}</div>
                        <div className="text-xs text-muted">{e.daysRequested} day(s) · {fmt(e.amount)} · {e.reason || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(e.status)}`}>{e.status}</span>
                        {e.status === 'Pending' && isAdmin && (
                          <>
                            <button onClick={() => handleApproveEncashment(e.id)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">Approve</button>
                            <button onClick={() => handleRejectEncashment(e.id)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-xs">Reject</button>
                          </>
                        )}
                        {e.status === 'Approved' && isAdmin && (
                          <button onClick={() => handlePayEncashment(e.id)} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-bold text-xs">Mark Paid</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {p2Tab === 'regularization' && (
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-3">Attendance Regularization</h3>
              {regularizations.length === 0 ? (
                <p className="text-sm text-muted">No regularization requests yet.</p>
              ) : (
                <div className="space-y-2">
                  {regularizations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between gap-3 border border-navy/5 dark:border-white/10 rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy dark:text-white">{r.employeeName} · {r.requestType}</div>
                        <div className="text-xs text-muted">{r.attendanceDate ? new Date(r.attendanceDate).toLocaleDateString() : ''} · {r.reason || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(r.status)}`}>{r.status}</span>
                        {r.status === 'Pending' && isAdmin && (
                          <>
                            <button onClick={() => handleRegularization(r.id, true)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">Approve</button>
                            <button onClick={() => handleRegularization(r.id, false)} className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-bold text-xs">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {p2Tab === 'documents' && (
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-3">Expiring & Pending Verification</h3>
              {expiring.length === 0 ? (
                <p className="text-sm text-muted">No documents expiring within 90 days or pending verification.</p>
              ) : (
                <div className="space-y-2">
                  {expiring.map((d) => (
                    <div key={d.id} className="flex items-center justify-between gap-3 border border-navy/5 dark:border-white/10 rounded-lg p-3">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-navy dark:text-white">{d.employeeName} · {d.documentType}</div>
                        <div className="text-xs text-muted">{d.documentName} · {d.expiryDate ? `Expires ${new Date(d.expiryDate).toLocaleDateString()}` : 'No expiry'} · {d.oneDrivePath || 'Stored locally'}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusPill(d.verificationStatus)}`}>{d.verificationStatus}</span>
                        {d.verificationStatus === 'Pending' && isAdmin && (
                          <button onClick={() => handleVerify(d.id, true)} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">Verify</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {p2Tab === 'idcard' && (
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Virtual ID Card</h3>
              <p className="text-sm text-muted mb-3">Generate a printable virtual ID card for any employee. Print and issue until the physical card is produced.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {(data.employees || []).map((emp) => (
                  <div key={emp.id} className="border border-navy/5 dark:border-white/10 rounded-lg p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy dark:text-white truncate">{emp.fullName}</div>
                      <div className="text-[10px] text-muted truncate">{emp.employeeCode} · {emp.designation || emp.department}</div>
                    </div>
                    <button onClick={() => openPreview('id-card', emp.id, `${emp.fullName} — Virtual ID Card`)} className="px-2.5 py-1 rounded-lg bg-gold-1/10 text-gold-1 border border-gold-2/30 font-bold text-xs shrink-0">Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {p2Tab === 'gatepass' && (
            <div className="card-surface p-6">
              <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Visitor Gate Pass</h3>
              <p className="text-sm text-muted mb-3">Generate a printable gate pass for registered visitors until the physical ID is issued.</p>
              <div className="space-y-2">
                {(visitors.list || []).map((v) => (
                  <div key={v.id} className="border border-navy/5 dark:border-white/10 rounded-lg p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-navy dark:text-white">{v.fullName}</div>
                      <div className="text-[10px] text-muted truncate">{v.company} · {v.purpose} · {new Date(v.expectedDate).toLocaleDateString()}</div>
                    </div>
                    <button onClick={() => openPreview('gate-pass', v.id, `${v.fullName} — Gate Pass`)} className="px-2.5 py-1 rounded-lg bg-gold-1/10 text-gold-1 border border-gold-2/30 font-bold text-xs shrink-0">Open</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'feedback' && (
        <>
          <div className="card-surface p-6">
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Governance Panel</h2>
            <p className="text-muted text-sm mb-4">Submit feedback overrides and review past decisions.</p>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-3 mb-6">
              <input value={form.employeeName} onChange={(e) => setForm((s) => ({ ...s, employeeName: e.target.value }))} required placeholder="Employee Name" className="input" />
              <input value={form.action} onChange={(e) => setForm((s) => ({ ...s, action: e.target.value }))} required placeholder="Action" className="input" />
              <select value={form.decision} onChange={(e) => setForm((s) => ({ ...s, decision: e.target.value }))} className="input">
                <option value="accept">Accept</option>
                <option value="veto">Veto</option>
                <option value="modify">Modify</option>
              </select>
              <button type="submit" className="btn-primary text-xs"><Shield size={14} className="inline mr-1" />Submit Feedback</button>
              <textarea value={form.reason} onChange={(e) => setForm((s) => ({ ...s, reason: e.target.value }))} rows={2} required placeholder="Reason for decision" className="input col-span-full" />
            </form>
          </div>

          <div className="card-surface p-6">
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Past Decisions</h2>
            <p className="text-muted text-sm mb-4">Review previous feedback and governance decisions.</p>
            {feedbacks.length === 0 ? (
              <p className="text-muted text-sm">No feedback records yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((fb, i) => (
                  <div key={fb.id || i} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-navy dark:text-white text-sm">{fb.employeeName}</div>
                        <div className="text-xs text-muted mt-1">{fb.action} · {new Date(fb.createdOn || fb.createdAt).toLocaleDateString()}</div>
                        {fb.reason && <div className="text-xs text-muted mt-1">Reason: {fb.reason}</div>}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${fb.decision === 'accept' ? 'bg-emerald-50 text-emerald-700' : fb.decision === 'veto' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                        {fb.decision}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-navy/10 bg-navy-dark text-white">
              <h3 className="font-heading font-bold">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
            <div className="bg-slate-200 p-4 max-h-[70vh] overflow-auto">
              <iframe srcDoc={preview.html} title={preview.title} className="w-full h-[60vh] bg-white rounded-lg border border-navy/10" />
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3 bg-slate-50 border-t border-navy/10">
              <button onClick={() => setPreview(null)} className="px-4 py-2 rounded-lg border border-navy/10 bg-white text-navy/70 font-bold text-xs">Close</button>
              <button onClick={() => {
                const win = window.open('', '_blank')
                if (win) { win.document.write(preview.html); win.document.close(); }
              }} className="px-4 py-2 rounded-lg bg-gold-1 text-navy-dark font-bold text-xs">Open & Print</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}