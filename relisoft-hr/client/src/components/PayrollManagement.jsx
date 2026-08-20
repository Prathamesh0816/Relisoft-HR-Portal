import { useState, useEffect, useCallback } from 'react'
import useStore from '../store'
import {
  getPayComponents, createPayComponent, updatePayComponent,
  getSalaryStructure, setSalaryStructure,
  getPayRuns, getPayRun, createPayRun, generatePayslips,
  readyPayRun, verifyPayRun, payPayRun, getUnpaidEmployees,
  getMyPayslips, addPayslipLine, downloadForm16,
  downloadPayslipZip, emailPayslips
} from '../api'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthName = (m) => MONTHS[m - 1] || ''
const fmt = (n) => '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const PAYROLL_ADMIN_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin']

const statusBadge = (status) => {
  const styles = {
    Draft: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    Ready: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
    Verified: 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
    Paid: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  }
  return <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${styles[status] || styles.Draft}`}>{status}</span>
}
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'

export default function PayrollManagement() {
  const { currentUser, data, setMessage } = useStore()
  const canManage = PAYROLL_ADMIN_ROLES.includes(currentUser?.role)

  const [myPayslips, setMyPayslips] = useState(null)
  const [components, setComponents] = useState([])
  const [structureEmployeeId, setStructureEmployeeId] = useState('')
  const [structure, setStructure] = useState(null)
  const [structureLoaded, setStructureLoaded] = useState(false)
  const [structureComponents, setStructureComponents] = useState([])
  const [structureAmounts, setStructureAmounts] = useState({})
  const [structureEffectiveFrom, setStructureEffectiveFrom] = useState(new Date().toISOString().slice(0, 10))
  const [runs, setRuns] = useState([])
  const [selectedRun, setSelectedRun] = useState(null)
  const [newRun, setNewRun] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  const [componentForm, setComponentForm] = useState({ name: '', type: 'Earning', description: '', isAuto: false, rate: 0 })
  const [lineForm, setLineForm] = useState({ payslipId: '', payComponentId: '', amount: '' })
  const [unpaid, setUnpaid] = useState([])
  const [loading, setLoading] = useState(false)

  const loadMyPayslips = useCallback(async () => {
    if (!currentUser?.employeeId) return
    try {
      setMyPayslips(await getMyPayslips(currentUser.employeeId))
    } catch {
      setMyPayslips([])
    }
  }, [currentUser?.employeeId])

  const handleDownloadForm16 = async () => {
    if (!currentUser?.employeeId) return
    try {
      const res = await downloadForm16(currentUser.employeeId, new Date().getFullYear())
      setMessage({ type: 'success', text: res.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to download Form 16.' })
    }
  }

  const loadRuns = useCallback(async () => {
    try {
      setRuns(await getPayRuns())
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load pay runs.' })
    }
  }, [setMessage])

  useEffect(() => {
    loadMyPayslips()
  }, [loadMyPayslips])

  useEffect(() => {
    if (!canManage) return
    getPayComponents().then(setComponents).catch(() => setComponents([]))
    loadRuns()
  }, [canManage, loadRuns])

  const loadStructure = async () => {
    if (!structureEmployeeId) {
      setMessage({ type: 'error', text: 'Select an employee.' })
      return
    }
    setLoading(true)
    setStructure(null)
    setStructureLoaded(true)
    try {
      const activeComponents = await getPayComponents(true)
      const existing = await getSalaryStructure(structureEmployeeId)
      const amounts = {}
      activeComponents.forEach((c) => {
        const match = existing?.lines?.find((l) => String(l.payComponentId) === String(c.id))
        amounts[c.id] = match ? match.monthlyAmount : 0
      })
      setStructureComponents(activeComponents)
      setStructureAmounts(amounts)
      setStructureEffectiveFrom(existing?.effectiveFrom ? existing.effectiveFrom.slice(0, 10) : new Date().toISOString().slice(0, 10))
      setStructure(existing)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load salary structure.' })
    } finally {
      setLoading(false)
    }
  }

  const saveStructure = async () => {
    if (!structureEmployeeId) return
    setLoading(true)
    try {
      const lines = Object.entries(structureAmounts)
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => ({ payComponentId: Number(id), monthlyAmount: Number(amount) }))
        .filter(({ payComponentId }) => {
          const comp = structureComponents.find((c) => c.id === payComponentId)
          return comp ? !comp.isAuto : true
        })
      await setSalaryStructure(structureEmployeeId, {
        employeeId: Number(structureEmployeeId),
        effectiveFrom: structureEffectiveFrom,
        lines
      })
      setMessage({ type: 'success', text: 'Salary structure saved.' })
      await loadStructure()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save salary structure.' })
    } finally {
      setLoading(false)
    }
  }

  const handleAddComponent = async () => {
    if (!componentForm.name.trim()) {
      setMessage({ type: 'error', text: 'Component name is required.' })
      return
    }
    try {
      await createPayComponent({ name: componentForm.name, type: componentForm.type, description: componentForm.description, isAuto: componentForm.isAuto, rate: Number(componentForm.rate) || 0 })
      setMessage({ type: 'success', text: 'Pay component created.' })
      setComponentForm({ name: '', type: 'Earning', description: '', isAuto: false, rate: 0 })
      setComponents(await getPayComponents())
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create pay component.' })
    }
  }

  const toggleComponent = async (component) => {
    try {
      await updatePayComponent(component.id, {
        id: component.id,
        name: component.name,
        type: component.type,
        description: component.description,
        isActive: !component.isActive,
        isAuto: component.isAuto,
        rate: Number(component.rate) || 0
      })
      setComponents(await getPayComponents())
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update pay component.' })
    }
  }

  const handleCreateRun = async () => {
    try {
      await createPayRun({ periodMonth: Number(newRun.month), periodYear: Number(newRun.year) })
      setMessage({ type: 'success', text: 'Pay run created.' })
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create pay run.' })
    }
  }

  const openRun = async (id) => {
    try {
      setSelectedRun(await getPayRun(id))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load pay run.' })
    }
    try {
      setUnpaid(await getUnpaidEmployees(id))
    } catch {
      setUnpaid([])
    }
  }

  const handleGenerate = async () => {
    if (!selectedRun) return
    try {
      await generatePayslips(selectedRun.id)
      setMessage({ type: 'success', text: 'Payslips generated.' })
      await openRun(selectedRun.id)
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to generate payslips.' })
    }
  }

  const handleReady = async () => {
    if (!selectedRun) return
    try {
      await readyPayRun(selectedRun.id)
      setMessage({ type: 'success', text: 'Pay run submitted for verification.' })
      await openRun(selectedRun.id)
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit pay run.' })
    }
  }

  const handleVerify = async () => {
    if (!selectedRun) return
    try {
      await verifyPayRun(selectedRun.id)
      setMessage({ type: 'success', text: 'Pay run verified.' })
      await openRun(selectedRun.id)
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to verify pay run.' })
    }
  }

  const handlePay = async () => {
    if (!selectedRun) return
    try {
      await payPayRun(selectedRun.id)
      setMessage({ type: 'success', text: 'Salary disbursed. Payslips emailed to everyone.' })
      await openRun(selectedRun.id)
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to disburse salary.' })
    }
  }

  const handleExportZip = async () => {
    if (!selectedRun) return
    try {
      const res = await downloadPayslipZip(selectedRun.id)
      setMessage({ type: 'success', text: res.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Export failed.' })
    }
  }

  const handleEmailPayslips = async () => {
    if (!selectedRun) return
    try {
      const res = await emailPayslips(selectedRun.id)
      setMessage({ type: 'success', text: res.message })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to email payslips.' })
    }
  }

  const handleAddLine = async () => {
    if (!selectedRun) return
    if (!lineForm.payslipId || !lineForm.payComponentId || !lineForm.amount) {
      setMessage({ type: 'error', text: 'Select an employee, a component, and enter an amount.' })
      return
    }
    try {
      const res = await addPayslipLine(selectedRun.id, Number(lineForm.payslipId), {
        payComponentId: Number(lineForm.payComponentId),
        amount: Number(lineForm.amount)
      })
      setMessage({ type: 'success', text: res.message })
      setLineForm({ payslipId: '', payComponentId: '', amount: '' })
      await openRun(selectedRun.id)
      await loadRuns()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to add line.' })
    }
  }

  const oneOffComponents = components.filter((c) => {
    const n = c.name.toLowerCase()
    return n.includes('bonus') || n.includes('referral') || n.includes('incentive') || n.includes('tds') || n.includes('provident') || n.includes('tax')
  })

  return (
    <div className="space-y-4">
      {/* My payslips */}
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">My Payslips</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Payslips issued for you across processed pay runs.</p>
          <button onClick={handleDownloadForm16} className="gold-button px-4 py-2 rounded-xl font-bold text-xs mt-2">Download Form 16 (Yearly Summary)</button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {myPayslips === null ? (
            <div className="p-4 text-sm text-navy/50 dark:text-white/50">Loading payslips...</div>
          ) : myPayslips.length === 0 ? (
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
              No payslips yet.
            </div>
          ) : (
            myPayslips.map((payslip) => (
              <div key={payslip.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <h4 className="font-bold text-navy dark:text-white text-sm">{monthName(payslip.periodMonth)} {payslip.periodYear}</h4>
                  <div className="flex gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">Gross {fmt(payslip.grossEarnings)}</span>
                    <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">Deductions {fmt(payslip.totalDeductions)}</span>
                    <span className="px-3 py-1 rounded-full bg-navy/5 dark:bg-white/5 text-navy dark:text-white font-bold">Net {fmt(payslip.netPay)}</span>
                  </div>
                </div>
                {payslip.lines?.length > 0 && (
                  <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-navy/5 dark:bg-white/5">
                          <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Component</th>
                          <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Type</th>
                          <th className="text-right px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslip.lines.map((line, i) => (
                          <tr key={i} className="border-t border-navy/5 dark:border-white/5">
                            <td className="px-4 py-2.5 font-bold text-navy dark:text-white">{line.componentName}</td>
                            <td className="px-4 py-2.5 text-navy/70 dark:text-white/70">{line.type}</td>
                            <td className={`px-4 py-2.5 text-right font-bold ${line.type === 'Deduction' ? 'text-red-600 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              {line.type === 'Deduction' ? '-' : ''}{fmt(line.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
</table>
                </div>
              )}
              </div>
            ))
          )}
        </div>
      </div>

      {canManage && (
        <>
          {/* Pay components */}
          <div className="card-surface">
            <div className="p-5">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Pay Components</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">Earning and deduction components used in salary structures and payslips.</p>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Name</label>
                  <input value={componentForm.name} onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })} placeholder="e.g. Basic, HRA, PF" className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Type</label>
                  <select value={componentForm.type} onChange={(e) => setComponentForm({ ...componentForm, type: e.target.value })} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                    <option value="Earning">Earning</option>
                    <option value="Deduction">Deduction</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Description</label>
                  <input value={componentForm.description} onChange={(e) => setComponentForm({ ...componentForm, description: e.target.value })} placeholder="Optional" className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                </div>
                {componentForm.type === 'Deduction' && (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isAuto"
                        checked={componentForm.isAuto}
                        onChange={(e) => setComponentForm({ ...componentForm, isAuto: e.target.checked })}
                        className="h-4 w-4 accent-gold-1"
                      />
                      <label htmlFor="isAuto" className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Auto-calculated</label>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Rate (%)</label>
                      <input type="number" min="0" step="0.25" value={componentForm.rate} onChange={(e) => setComponentForm({ ...componentForm, rate: e.target.value })} placeholder="e.g. 12" disabled={!componentForm.isAuto} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white disabled:opacity-40" />
                    </div>
                  </>
                )}
                <button onClick={handleAddComponent} className="gold-button px-6 py-3 rounded-xl font-bold text-sm h-12">Add Component</button>
              </div>
              {components.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy/5 dark:bg-white/5">
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Description</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Auto</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((c) => (
                        <tr key={c.id} className="border-t border-navy/5 dark:border-white/5">
                          <td className="px-4 py-3 font-bold text-navy dark:text-white">{c.name}</td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{c.type}</td>
                          <td className="px-4 py-3 text-navy/50 dark:text-white/50">{c.description || '—'}</td>
                          <td className="px-4 py-3">
                            {c.isAuto
                              ? <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-gold-1/10 text-gold-1">{c.rate}% of basic</span>
                              : <span className="text-navy/40 dark:text-white/40">Manual</span>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${c.isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-navy/5 dark:bg-white/5 text-navy/50 dark:text-white/50'}`}>
                              {c.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => toggleComponent(c)} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">
                              {c.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Salary structures */}
          <div className="card-surface">
            <div className="p-5">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Salary Structures</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">Set the monthly amounts for each component per employee.</p>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Employee</label>
                  <select value={structureEmployeeId} onChange={(e) => { setStructureEmployeeId(e.target.value); setStructure(null); setStructureLoaded(false) }} className="mt-1.5 w-72 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                    <option value="">Select an employee...</option>
                    {data.employees.map((e) => (
                      <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode}){e.isUnpaidIntern ? ' — Unpaid intern' : ''}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Effective from</label>
                  <input type="date" value={structureEffectiveFrom} onChange={(e) => setStructureEffectiveFrom(e.target.value)} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                </div>
                <button onClick={loadStructure} disabled={loading} className="px-5 py-3 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5 transition-all h-12">
                  {loading ? 'Loading...' : 'Load'}
                </button>
              </div>

              {structureLoaded && structureEmployeeId && (
                <div>
                  {structure !== null && (
                    <div className="mb-3 text-sm text-navy/60 dark:text-white/60">
                      Existing structure: effective {new Date(structure.effectiveFrom).toLocaleDateString()}.
                    </div>
                  )}
                  <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-navy/5 dark:bg-white/5">
                          <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Component</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Type</th>
                          <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Monthly amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(structureAmounts).length === 0 && (
                          <tr><td colSpan={3} className="px-4 py-4 text-center text-navy/50 dark:text-white/50">No active components. Add components above first.</td></tr>
                        )}
                        {structureComponents.map((c) => (
                          <tr key={c.id} className="border-t border-navy/5 dark:border-white/5">
                            <td className="px-4 py-3 font-bold text-navy dark:text-white">{c.name}</td>
                            <td className="px-4 py-3 text-navy/70 dark:text-white/70">{c.type}</td>
                            <td className="px-4 py-3 text-right">
                              {c.isAuto ? (
                                <span className="text-xs text-navy/40 dark:text-white/40">Auto — {c.rate}% of Basic (computed at generation)</span>
                              ) : (
                                <input
                                  type="number"
                                  min="0"
                                  value={structureAmounts[c.id] ?? 0}
                                  onChange={(e) => setStructureAmounts({ ...structureAmounts, [c.id]: Number(e.target.value) })}
                                  className="h-9 w-40 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-right text-navy dark:text-white"
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button onClick={saveStructure} disabled={loading} className="gold-button px-6 py-3 rounded-xl font-bold text-sm mt-3 h-12 disabled:opacity-40">
                    {loading ? 'Saving...' : 'Save salary structure'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pay runs */}
          <div className="card-surface">
            <div className="p-5">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Pay Runs</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">Create monthly pay runs, generate payslips, and process them to email everyone.</p>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Month</label>
                  <select value={newRun.month} onChange={(e) => setNewRun({ ...newRun, month: e.target.value })} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                    {MONTHS.map((m, i) => (
                      <option key={i + 1} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Year</label>
                  <input type="number" value={newRun.year} onChange={(e) => setNewRun({ ...newRun, year: e.target.value })} className="mt-1.5 h-12 w-28 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                </div>
                <button onClick={handleCreateRun} className="gold-button px-6 py-3 rounded-xl font-bold text-sm h-12">Create pay run</button>
              </div>

              {runs.length === 0 ? (
                <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
                  No pay runs yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy/5 dark:bg-white/5">
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Period</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Payslips</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Total net pay</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {runs.map((run) => (
                        <tr key={run.id} className="border-t border-navy/5 dark:border-white/5">
                          <td className="px-4 py-3 font-bold text-navy dark:text-white">{monthName(run.periodMonth)} {run.periodYear}</td>
                          <td className="px-4 py-3">
                            {statusBadge(run.status)}
                          </td>
                          <td className="px-4 py-3 text-right text-navy/70 dark:text-white/70">{run.payslipCount}</td>
                          <td className="px-4 py-3 text-right font-bold text-navy dark:text-white">{fmt(run.totalNetPay)}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => openRun(run.id)} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Open</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedRun && (
                <div className="p-4 rounded-xl border border-gold-1/30 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                    <h4 className="font-bold text-navy dark:text-white text-sm">
                      {monthName(selectedRun.periodMonth)} {selectedRun.periodYear}
                      <span className="ml-2 inline-block align-middle">{statusBadge(selectedRun.status)}</span>
                    </h4>
                    <button onClick={() => setSelectedRun(null)} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Close</button>
                  </div>
                  {selectedRun.status === 'Draft' && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button onClick={handleGenerate} className="px-4 py-2 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Generate/refresh payslips</button>
                      <button onClick={handleReady} disabled={selectedRun.payslipCount === 0} className="gold-button px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-40">
                        Submit for verification
                      </button>
                    </div>
                  )}
                  {selectedRun.status === 'Ready' && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button onClick={handleVerify} disabled={selectedRun.payslipCount === 0} className="gold-button px-4 py-2 rounded-lg font-bold text-xs disabled:opacity-40">
                        Verify payroll
                      </button>
                    </div>
                  )}
                  {selectedRun.status === 'Verified' && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button onClick={handlePay} className="gold-button px-4 py-2 rounded-lg font-bold text-xs">
                        Mark as paid — salary shot
                      </button>
                    </div>
                  )}
                  {selectedRun.status === 'Paid' && (
                    <div className="mb-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 text-xs text-navy/70 dark:text-white/70">
                      Salary disbursed on {fmtDate(selectedRun.paidOn)}
                      {selectedRun.autoDisbursed && <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold">Automatic</span>}
                    </div>
                  )}
                  {(selectedRun.status === 'Ready' || selectedRun.status === 'Verified' || selectedRun.status === 'Paid') && (
                    <div className="mb-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-navy/60 dark:text-white/60">
                      <div>Submitted: <b className="text-navy dark:text-white">{fmtDate(selectedRun.readyOn)}</b></div>
                      <div>Verified: <b className="text-navy dark:text-white">{fmtDate(selectedRun.verifiedOn)}</b></div>
                      <div>Paid: <b className="text-navy dark:text-white">{fmtDate(selectedRun.paidOn)}</b></div>
                      <div>Processed: <b className="text-navy dark:text-white">{fmtDate(selectedRun.processedOn)}</b></div>
                    </div>
                  )}
                  {selectedRun.payslipCount > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      <button onClick={handleExportZip} className="px-4 py-2 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Export all payslips (ZIP)</button>
                      <button onClick={handleEmailPayslips} disabled={selectedRun.status === 'Draft'} className="px-4 py-2 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5 disabled:opacity-40">
                        Email all payslips
                      </button>
                    </div>
                  )}
                  {selectedRun.status === 'Draft' && selectedRun.payslips?.length > 0 && (
                    <div className="mb-3 p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20">
                      <div className="text-xs font-bold text-navy/70 dark:text-white/70 mb-2 uppercase tracking-wider">One-off additions (bonus, referral, PF, TDS...)</div>
                      <div className="flex flex-wrap items-end gap-2">
                        <select value={lineForm.payslipId} onChange={(e) => setLineForm({ ...lineForm, payslipId: e.target.value })} className="h-10 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-xs font-bold text-navy dark:text-white outline-none">
                          <option value="">Employee...</option>
                          {selectedRun.payslips.map((p) => (
                            <option key={p.id} value={p.id}>{p.employeeName}</option>
                          ))}
                        </select>
                        <select value={lineForm.payComponentId} onChange={(e) => setLineForm({ ...lineForm, payComponentId: e.target.value })} className="h-10 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-xs font-bold text-navy dark:text-white outline-none">
                          <option value="">Component...</option>
                          {oneOffComponents.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                          ))}
                        </select>
                        <input type="number" min="0" value={lineForm.amount} onChange={(e) => setLineForm({ ...lineForm, amount: e.target.value })} placeholder="Amount" className="h-10 w-32 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-xs font-bold text-navy dark:text-white outline-none" />
                        <button onClick={handleAddLine} className="h-10 px-4 rounded-lg bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs">Add to payslip</button>
                      </div>
                    </div>
                  )}
                  {selectedRun.payslips?.length === 0 ? (
                    <div className="text-sm text-navy/50 dark:text-white/50">No payslips generated yet.</div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-navy/5 dark:bg-white/5">
                            <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Employee</th>
                            <th className="text-right px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Gross</th>
                            <th className="text-right px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Deductions</th>
                            <th className="text-right px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Net</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedRun.payslips.map((p) => (
                            <tr key={p.id} className="border-t border-navy/5 dark:border-white/5">
                              <td className="px-4 py-2.5 font-bold text-navy dark:text-white">{p.employeeName}</td>
                              <td className="px-4 py-2.5 text-right text-emerald-700 dark:text-emerald-400 font-bold">{fmt(p.grossEarnings)}</td>
                              <td className="px-4 py-2.5 text-right text-red-600 dark:text-red-400 font-bold">{fmt(p.totalDeductions)}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-navy dark:text-white">{fmt(p.netPay)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {unpaid.length > 0 && (
                    <div className="mt-3 p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/40 dark:bg-red-900/20">
                      <div className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-2">
                        Unpaid employees ({unpaid.length}) — eligible but missing from this run
                      </div>
                      <div className="space-y-1.5">
                        {unpaid.map((u) => (
                          <div key={u.employeeId} className="flex items-center justify-between text-xs text-navy/80 dark:text-white/80">
                            <span className="font-bold">{u.employeeName} <span className="text-navy/40 dark:text-white/40">({u.employeeCode})</span></span>
                            <span className="text-red-600 dark:text-red-400">{u.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
