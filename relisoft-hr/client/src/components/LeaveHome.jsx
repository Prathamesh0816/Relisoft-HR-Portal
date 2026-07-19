import { useState, useEffect } from 'react'
import useStore from '../store'
import { applyLeave, getMyLeaveRequests, cancelLeave, requestCancellation, loadWorkspace, checkLeaveBalance, applyCompOff, getFloaterUsage, uploadMedicalCertificate, transferCompOff, getCompOffTransfers } from '../api'

function statusClass(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'approved') return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700'
  if (s === 'rejected' || s === 'cancelled') return 'bg-red-50 dark:bg-red-900/30 text-red-700'
  return 'bg-amber-50 dark:bg-amber-900/30 text-amber-700'
}

export default function LeaveHome() {
  const { data, leaveForm, myLeaves, currentUser, updateForm, setSubmitting, resetForm, setMyLeaves, setMessage } = useStore()
  const employee = data.employees.find((e) => String(e.id) === String(currentUser?.employeeId))
  const [cancelDialog, setCancelDialog] = useState({ request: null, reason: 'Plans changed.', submitting: false })
  const [balanceInfo, setBalanceInfo] = useState(null)
  const [showLossOfPay, setShowLossOfPay] = useState(false)
  const [compOffForm, setCompOffForm] = useState({ workedDate: '', reason: '', submitting: false })
  const [floaterUsage, setFloaterUsage] = useState(null)
  const [showCompOff, setShowCompOff] = useState(false)
  const [medicalFile, setMedicalFile] = useState(null)
  const [medicalUploading, setMedicalUploading] = useState(false)
  const [medicalLeaveId, setMedicalLeaveId] = useState(null)
  const [transferForm, setTransferForm] = useState({ toEmployeeId: '', days: '', reason: '', submitting: false })
  const [transfers, setTransfers] = useState([])
  const [showTransferForm, setShowTransferForm] = useState(false)

  useEffect(() => {
    if (currentUser?.employeeId) {
      getMyLeaveRequests(currentUser.employeeId).then((res) => {
        setMyLeaves({ requests: res.requests || [], loading: false })
      })
      getCompOffTransfers(currentUser.employeeId).then((t) => setTransfers(Array.isArray(t) ? t : t?.transfers || [])).catch(() => {})
    }
  }, [currentUser?.employeeId])

  useEffect(() => {
    if (!leaveForm.leaveTypeId || !currentUser?.employeeId) return
    const lt = data.leaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))
    if (!lt) return
    checkLeaveBalance(currentUser.employeeId, leaveForm.leaveTypeId).then(setBalanceInfo)
    if (lt.isFloaterHoliday) {
      getFloaterUsage(currentUser.employeeId, new Date().getFullYear()).then(setFloaterUsage)
    } else {
      setFloaterUsage(null)
    }
  }, [leaveForm.leaveTypeId, currentUser?.employeeId])

  useEffect(() => {
    if (!balanceInfo || !leaveForm.startDate || !leaveForm.endDate || leaveForm.startDate > leaveForm.endDate) {
      setShowLossOfPay(false)
      return
    }
    const days = Math.ceil((new Date(leaveForm.endDate) - new Date(leaveForm.startDate)) / (1000 * 60 * 60 * 24)) + 1
    setShowLossOfPay(days > (balanceInfo?.remaining ?? 999))
  }, [leaveForm.startDate, leaveForm.endDate, balanceInfo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (leaveForm.submitting) return
    setSubmitting('leaveForm', true)
    try {
      const res = await applyLeave({
        employeeId: Number(leaveForm.employeeId || currentUser?.employeeId),
        leaveTypeId: Number(leaveForm.leaveTypeId),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        isHalfDay: leaveForm.isHalfDay,
        reason: leaveForm.reason
      })
      resetForm('leaveForm', { employeeId: String(currentUser?.employeeId || ''), leaveTypeId: leaveForm.leaveTypeId, startDate: '', endDate: '', isHalfDay: false, reason: '', submitting: false, balanceCheck: null })
      setBalanceInfo(null)
      setMessage({ type: res.lossOfPay ? 'warning' : 'success', text: res.message })
      if (res.isMedicalLeave) setMedicalLeaveId(res.id)
      await Promise.all([loadWorkspace().then((d) => useStore.getState().setData(d)), getMyLeaveRequests(currentUser?.employeeId).then((r) => setMyLeaves({ requests: r.requests || [] }))])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit.' })
    } finally {
      setSubmitting('leaveForm', false)
    }
  }

  const handleCancel = async (e) => {
    e.preventDefault()
    if (!cancelDialog.request || cancelDialog.submitting) return
    setCancelDialog((c) => ({ ...c, submitting: true }))
    try {
      if (cancelDialog.request.status === 'Approved') {
        await requestCancellation(cancelDialog.request.id, { employeeId: currentUser?.employeeId, reason: cancelDialog.reason })
        setMessage({ type: 'success', text: 'Cancellation request submitted for approval.' })
      } else {
        await cancelLeave(cancelDialog.request.id, { employeeId: currentUser?.employeeId, reason: cancelDialog.reason })
        setMessage({ type: 'success', text: 'Leave request withdrawn.' })
      }
      setCancelDialog({ request: null, reason: 'Plans changed.', submitting: false })
      await Promise.all([loadWorkspace().then((d) => useStore.getState().setData(d)), getMyLeaveRequests(currentUser?.employeeId).then((r) => setMyLeaves({ requests: r.requests || [] }))])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' })
      setCancelDialog((c) => ({ ...c, submitting: false }))
    }
  }

  const handleMedicalUpload = async (e) => {
    e.preventDefault()
    if (!medicalFile || medicalUploading || !medicalLeaveId) return
    setMedicalUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', medicalFile)
      await uploadMedicalCertificate(medicalLeaveId, formData)
      setMessage({ type: 'success', text: 'Medical certificate uploaded.' })
      setMedicalFile(null)
      setMedicalLeaveId(null)
      await Promise.all([loadWorkspace().then((d) => useStore.getState().setData(d)), getMyLeaveRequests(currentUser?.employeeId).then((r) => setMyLeaves({ requests: r.requests || [] }))])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to upload.' })
    } finally {
      setMedicalUploading(false)
    }
  }

  const handleTransfer = async (e) => {
    e.preventDefault()
    if (transferForm.submitting) return
    setTransferForm((f) => ({ ...f, submitting: true }))
    try {
      await transferCompOff({
        fromEmployeeId: Number(currentUser?.employeeId),
        toEmployeeId: Number(transferForm.toEmployeeId),
        days: Number(transferForm.days),
        reason: transferForm.reason
      })
      setMessage({ type: 'success', text: 'Comp off transferred.' })
      setTransferForm({ toEmployeeId: '', days: '', reason: '', submitting: false })
      setShowTransferForm(false)
      const t = await getCompOffTransfers(currentUser?.employeeId)
      setTransfers(Array.isArray(t) ? t : t?.transfers || [])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Transfer failed.' })
      setTransferForm((f) => ({ ...f, submitting: false }))
    }
  }

  const handleCompOff = async (e) => {
    e.preventDefault()
    if (compOffForm.submitting) return
    setCompOffForm((f) => ({ ...f, submitting: true }))
    try {
      await applyCompOff({ employeeId: currentUser?.employeeId, workedDate: compOffForm.workedDate, reason: compOffForm.reason })
      setMessage({ type: 'success', text: 'Comp off request submitted.' })
      setCompOffForm({ workedDate: '', reason: '', submitting: false })
      setShowCompOff(false)
      await Promise.all([loadWorkspace().then((d) => useStore.getState().setData(d)), getMyLeaveRequests(currentUser?.employeeId).then((r) => setMyLeaves({ requests: r.requests || [] }))])
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit comp off.' })
      setCompOffForm((f) => ({ ...f, submitting: false }))
    }
  }

  const approverName = (emp) => {
    if (!emp) return 'Select an employee'
    if (emp.approverName) return emp.approverName
    if (emp.role === 'OrganizationHead') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No active HR found'
    if (emp.role === 'HR' || emp.role === 'HRL2') return data.employees.find((e) => e.role === 'OrganizationHead')?.fullName || 'No organization head found'
    if (emp.role === 'Manager' || emp.role === 'ManagerL2') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
    if (emp.primaryProject?.approvalRoute === 'TeamLead') return emp.primaryTeam?.leadName || emp.primaryProject.managerName || 'No primary team lead assigned'
    if (emp.primaryProject?.approvalRoute === 'Delegate') return emp.primaryProject.approvalDelegateName || emp.primaryProject.managerName || 'No delegate assigned'
    return emp.primaryProject?.managerName || emp.primaryTeam?.projectManagerName || 'No project manager assigned'
  }

  const selectedLeaveType = data.leaveTypes.find((l) => String(l.id) === String(leaveForm.leaveTypeId))

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Apply for leave</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Your balance is shown per leave type — insufficient balance triggers a Loss of Pay warning.</p>
        </div>
        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Applying as</div>
              <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{employee?.fullName || 'Signed-in employee'}</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {employee && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{employee.employeeCode}</span>}
                {employee && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{data.roles.find((r) => r.id === employee.roleId)?.label || employee.role}</span>}
                {employee?.primaryProject && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{employee.primaryProject.name}</span>}
                {employee?.primaryTeam && <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{employee.primaryTeam.name}</span>}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Leave type</label>
              <select value={leaveForm.leaveTypeId} disabled={leaveForm.submitting} onChange={(e) => updateForm('leaveForm', 'leaveTypeId', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                {data.leaveTypes.filter((lt) => !lt.isCompOff).map((lt) => <option key={lt.id} value={lt.id}>{lt.name}{lt.isFloaterHoliday ? ` (max ${lt.maxFloaterPerYear}/yr)` : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">From</label>
              <input type="date" value={leaveForm.startDate} disabled={leaveForm.submitting} onChange={(e) => updateForm('leaveForm', 'startDate', e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
            </div>
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">To</label>
              <input type="date" value={leaveForm.endDate} disabled={leaveForm.submitting} onChange={(e) => updateForm('leaveForm', 'endDate', e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
            </div>
            {data.hrPolicy?.allowHalfDayLeave && (
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer">
                  <input type="checkbox" checked={leaveForm.isHalfDay} disabled={leaveForm.submitting} onChange={(e) => updateForm('leaveForm', 'isHalfDay', e.target.checked)} className="w-5 h-5 rounded border-navy/20 text-gold-1" />
                  <span className="text-sm font-semibold text-navy dark:text-white">Half day for each selected date</span>
                </label>
              </div>
            )}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Reason</label>
              <textarea value={leaveForm.reason} disabled={leaveForm.submitting} onChange={(e) => updateForm('leaveForm', 'reason', e.target.value)} placeholder="A short note for the approver" required className="mt-1.5 w-full h-24 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white resize-vertical" />
            </div>
          </div>
          {balanceInfo && (
            <div className={`p-4 rounded-xl border ${showLossOfPay ? 'border-red-300 bg-red-50 dark:bg-red-900/30' : 'border-navy/10 bg-amber-50/30'}`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Current balance</span>
                  <strong className="block text-lg text-navy dark:text-white">{balanceInfo.remaining} remaining</strong>
                </div>
                {balanceInfo.isFloater && floaterUsage && (
                  <div className="text-xs font-bold text-navy/50 dark:text-white/50">Used {floaterUsage.used} of {floaterUsage.max} floater holidays this year</div>
                )}
                {showLossOfPay && (
                  <div className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold">This request will be treated as Loss of Pay</div>
                )}
              </div>
            </div>
          )}
          {selectedLeaveType?.isFloaterHoliday && floaterUsage && floaterUsage.used >= floaterUsage.max && (
            <div className="p-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/30">
              <span className="text-xs font-bold text-red-700">Floater holiday limit reached ({floaterUsage.max}/year). Cannot apply.</span>
            </div>
          )}
          <hr className="border-navy/10" />
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Default approver</div>
            <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{approverName(employee)}</h3>
          </div>
          <hr className="border-navy/10" />
          <div>
            <h3 className="font-heading font-bold text-navy dark:text-white">Leave balance snapshot</h3>
            <p className="text-muted dark:text-white/60 text-xs mt-1">A quick read on used versus remaining balance by category.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {(employee?.leaveBalances || []).map((lb) => {
                const remaining = lb.remainingLeaves
                const used = lb.usedLeaves
                const allocated = lb.allocatedLeaves
                const pct = allocated > 0 ? Math.min(100, Math.max(0, (used / allocated) * 100)) : 0
                return (
                  <div key={lb.leaveTypeId} className="flex items-center gap-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="w-[72px] h-[72px] shrink-0 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(#f5a623 0deg ${pct * 3.6}deg, rgba(0,35,73,0.08) ${pct * 3.6}deg 360deg)` }}>
                      <div className="w-[52px] h-[52px] rounded-full bg-white dark:bg-[var(--bg-secondary)] flex flex-col items-center justify-center">
                        <strong className="text-lg leading-none text-navy dark:text-white">{remaining}</strong>
                        <span className="text-[10px] font-bold text-navy/50 dark:text-white/50">left</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy dark:text-white text-sm">{lb.leaveTypeName}</h4>
                      <div className="text-xs text-navy/50 dark:text-white/50 mt-1">{used} used of {allocated}</div>
                    </div>
                  </div>
                )
              })}
              {(!employee?.leaveBalances || employee.leaveBalances.length === 0) && (
                <div className="md:col-span-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="text-sm text-navy/50 dark:text-white/50">No leave balance records are attached to this employee yet.</div>
                </div>
              )}
            </div>
          </div>
          {leaveForm.submitting && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-navy/5 overflow-hidden relative">
                <div className="absolute inset-0 w-2/4 rounded-full bg-gradient-to-r from-gold-1 to-teal-400 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-navy/50 dark:text-white/50">Submitting leave request...</span>
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={leaveForm.submitting || (selectedLeaveType?.isFloaterHoliday && floaterUsage?.used >= floaterUsage?.max)} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">
              {leaveForm.submitting ? 'Sending request...' : 'Submit leave request'}
            </button>
            <button type="button" onClick={() => setShowCompOff(!showCompOff)} className="px-5 py-3 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">
              {showCompOff ? 'Close comp off' : 'Apply comp off'}
            </button>
          </div>
        </form>
        {medicalLeaveId && (
          <form onSubmit={handleMedicalUpload} className="px-5 pb-5 border-t border-navy/10 pt-4 space-y-4">
            <h3 className="font-heading font-bold text-navy dark:text-white">Upload medical certificate</h3>
            <p className="text-muted dark:text-white/60 text-xs">Leave &gt; 3 days requires a medical certificate before approval.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Certificate file (PDF/JPG/PNG)</label>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setMedicalFile(e.target.files[0])} disabled={medicalUploading} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gold-1 file:text-white file:font-bold file:text-xs" />
              </div>
            </div>
            <button type="submit" disabled={!medicalFile || medicalUploading} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">{medicalUploading ? 'Uploading...' : 'Upload certificate'}</button>
          </form>
        )}
        {showCompOff && (
          <form onSubmit={handleCompOff} className="px-5 pb-5 border-t border-navy/10 pt-4 space-y-4">
            <h3 className="font-heading font-bold text-navy dark:text-white">Compensatory off request</h3>
            <p className="text-muted dark:text-white/60 text-xs">For weekend or holiday work. Must be applied within 30 days of the worked date.</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Worked date</label>
                <input type="date" value={compOffForm.workedDate} disabled={compOffForm.submitting} onChange={(e) => setCompOffForm((f) => ({ ...f, workedDate: e.target.value }))} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Reason</label>
                <textarea value={compOffForm.reason} disabled={compOffForm.submitting} onChange={(e) => setCompOffForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Weekend / holiday work details" required className="mt-1.5 w-full h-24 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white resize-vertical" />
              </div>
            </div>
            <button type="submit" disabled={compOffForm.submitting} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">{compOffForm.submitting ? 'Submitting...' : 'Submit comp off'}</button>
          </form>
        )}
        <div className="border-t border-navy/10 px-5 py-4">
          <button type="button" onClick={() => setShowTransferForm(!showTransferForm)} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">
            {showTransferForm ? 'Close transfer' : 'Transfer comp off to colleague'}
          </button>
          {showTransferForm && (
            <form onSubmit={handleTransfer} className="mt-4 space-y-4">
              <h3 className="font-heading font-bold text-navy dark:text-white">Transfer comp off days</h3>
              <p className="text-muted dark:text-white/60 text-xs">Send your earned comp off days to a colleague.</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Recipient</label>
                  <select value={transferForm.toEmployeeId} disabled={transferForm.submitting} onChange={(e) => setTransferForm((f) => ({ ...f, toEmployeeId: e.target.value }))} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    <option value="">Select employee</option>
                    {data.employees.filter((e) => String(e.id) !== String(currentUser?.employeeId)).map((e) => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Days</label>
                  <input type="number" min="0.5" max="30" step="0.5" value={transferForm.days} disabled={transferForm.submitting} onChange={(e) => setTransferForm((f) => ({ ...f, days: e.target.value }))} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Reason</label>
                  <textarea value={transferForm.reason} disabled={transferForm.submitting} onChange={(e) => setTransferForm((f) => ({ ...f, reason: e.target.value }))} placeholder="Why are you transferring comp off?" required className="mt-1.5 w-full h-20 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white resize-vertical" />
                </div>
              </div>
              <button type="submit" disabled={transferForm.submitting} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">{transferForm.submitting ? 'Transferring...' : 'Transfer comp off'}</button>
            </form>
          )}
          {transfers.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-bold text-sm text-navy dark:text-white">Transfer history</h4>
              {transfers.map((t) => (
                <div key={t.id} className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between text-sm">
                  <div>
                    <span className="font-bold text-navy dark:text-white">{t.fromEmployeeName}</span>
                    <span className="text-muted mx-1">→</span>
                    <span className="font-bold text-navy dark:text-white">{t.toEmployeeName}</span>
                    <span className="text-muted ml-2">{t.days} day(s)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${t.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">My leave requests</h2>
          <p className="text-muted dark:text-white/60 text-xs mt-1">Pending and approved requests can be cancelled from here.</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {myLeaves.loading ? (
            <div className="p-4 text-sm text-navy/50 dark:text-white/50">Loading leave requests...</div>
          ) : myLeaves.requests.length === 0 ? (
            <div className="p-4 text-sm text-navy/50 dark:text-white/50 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">No leave requests submitted yet.</div>
          ) : (
            myLeaves.requests.map((req) => (
              <div key={req.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">{req.leaveTypeName}</h4>
                    <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">Approver: {req.approverName || 'Not assigned'}</div>
                    {req.lossOfPay && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-50 dark:bg-red-900/30 text-red-600 text-[10px] font-bold">Loss of Pay</span>}
                    {req.isMedicalLeave && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 text-[10px] font-bold">{req.medicalCertificatePath ? 'Cert uploaded' : 'Med cert needed'}</span>}
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusClass(req.status)}`}>{req.status}</span>
                    <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[['From', req.fromDate], ['To', req.toDate], ['Applied', req.appliedOn], [req.status === 'Cancelled' ? 'Cancelled' : 'Actioned', req.actionedOn || 'Not yet']].map(([label, value]) => (
                    <div key={label} className="p-3 rounded-xl bg-amber-50/50 border border-navy/5 dark:border-white/5">
                      <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">{label}</span>
                      <strong className="block text-sm text-navy dark:text-white mt-1">{value ? new Date(value).toLocaleDateString() : 'Not yet'}</strong>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-navy/70 dark:text-white/70">{req.reason || 'No note'}</p>
                {(req.status === 'Pending' || req.status === 'Approved') && (
                  <button onClick={() => setCancelDialog({ request: req, reason: 'Plans changed.', submitting: false })} className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100 transition-all">
                    {req.status === 'Approved' ? 'Request cancellation' : 'Withdraw'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {cancelDialog.request && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-navy/40 backdrop-blur-sm">
          <div className="card-surface w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="flex items-start justify-between gap-4 p-5 border-b border-navy/10 bg-white dark:bg-[var(--bg-secondary)]">
              <div>
                <h2 className="font-heading font-bold text-xl text-navy dark:text-white">{cancelDialog.request?.status === 'Approved' ? 'Request cancellation' : 'Cancel leave request'}</h2>
                <p className="text-muted dark:text-white/60 text-sm mt-1">{cancelDialog.request.leaveTypeName} — {new Date(cancelDialog.request.fromDate).toLocaleDateString()} to {new Date(cancelDialog.request.toDate).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setCancelDialog({ request: null, reason: 'Plans changed.', submitting: false })} className="px-4 py-2 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Close</button>
            </div>
            <form onSubmit={handleCancel} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Cancellation reason</label>
                <textarea value={cancelDialog.reason} disabled={cancelDialog.submitting} onChange={(e) => setCancelDialog((c) => ({ ...c, reason: e.target.value }))} placeholder="Tell the approver why this request is being cancelled." required className="mt-1.5 w-full h-24 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white resize-vertical" />
              </div>
              {cancelDialog.submitting && (
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-navy/5 overflow-hidden relative">
                    <div className="absolute inset-0 w-2/4 rounded-full bg-gradient-to-r from-gold-1 to-teal-400 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-navy/50 dark:text-white/50">Cancelling leave request...</span>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setCancelDialog({ request: null, reason: 'Plans changed.', submitting: false })} disabled={cancelDialog.submitting} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Keep request</button>
                <button type="submit" disabled={cancelDialog.submitting} className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100">{cancelDialog.submitting ? 'Cancelling...' : 'Cancel leave'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
