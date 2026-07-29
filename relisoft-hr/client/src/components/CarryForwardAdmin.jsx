import { useState, useEffect } from 'react'
import useStore from '../store'
import { getCarryForwardPreview, processCarryForward, getCarryForwardHistory } from '../api'

function getFYOptions() {
  const now = new Date()
  const currentFYYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
  const options = []
  for (let y = currentFYYear; y >= currentFYYear - 3; y--) {
    options.push(`FY${y}`)
  }
  return options
}

export default function CarryForwardAdmin() {
  const { setMessage } = useStore()
  const fyOptions = getFYOptions()
  const [selectedFY, setSelectedFY] = useState(fyOptions[1] || fyOptions[0])
  const [preview, setPreview] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    setHistoryLoading(true)
    try {
      const data = await getCarryForwardHistory()
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const handlePreview = async () => {
    setLoading(true)
    setPreview(null)
    try {
      const data = await getCarryForwardPreview(selectedFY)
      setPreview(data)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load preview.' })
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    setProcessing(true)
    try {
      const stored = localStorage.getItem('relisoft-hr-user')
      const user = stored ? JSON.parse(stored) : null
      const result = await processCarryForward(selectedFY, user?.employeeId ? Number(user.employeeId) : null)
      setMessage({ type: 'success', text: result.message || 'Carry-forward processed successfully.' })
      setPreview(result)
      setConfirmOpen(false)
      await loadHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to process carry-forward.' })
    } finally {
      setProcessing(false)
    }
  }

  // Group history by FY transition
  const historyGroups = history.reduce((acc, log) => {
    const key = `${log.fromFinancialYear}→${log.toFinancialYear}`
    if (!acc[key]) acc[key] = { from: log.fromFinancialYear, to: log.toFinancialYear, trigger: log.triggerType, date: log.processedOn, items: [] }
    acc[key].items.push(log)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Year-End Leave Carry-Forward</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">
            Carry forward unused leave balances from one financial year to the next. Eligible leave types are automatically determined by their carry-forward percentage.
          </p>
        </div>
        <div className="px-5 pb-5 space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Source FY (year ending)</label>
              <select value={selectedFY} onChange={(e) => { setSelectedFY(e.target.value); setPreview(null) }} className="mt-1.5 w-48 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                {fyOptions.map((fy) => (
                  <option key={fy} value={fy}>{fy} (Apr {fy.replace('FY', '')} – Mar {Number(fy.replace('FY', '')) + 1})</option>
                ))}
              </select>
            </div>
            <button onClick={handlePreview} disabled={loading} className="px-5 py-3 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5 transition-all h-12">
              {loading ? 'Loading...' : 'Preview'}
            </button>
            <button onClick={() => setConfirmOpen(true)} disabled={loading || processing || !preview || preview.items?.length === 0} className="gold-button px-6 py-3 rounded-xl font-bold text-sm h-12 disabled:opacity-40">
              {processing ? 'Processing...' : 'Process Carry-Forward'}
            </button>
          </div>

          {preview && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/10">
                  <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">From → To</span>
                  <strong className="block text-sm text-navy dark:text-white mt-1">{preview.fromFinancialYear} → {preview.toFinancialYear}</strong>
                </div>
                <div className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/10">
                  <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Employees</span>
                  <strong className="block text-sm text-navy dark:text-white mt-1">{preview.employeesProcessed}</strong>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Days Carried</span>
                  <strong className="block text-sm text-emerald-700 dark:text-emerald-400 mt-1">{preview.totalCarryForwardDays}</strong>
                </div>
                <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10">
                  <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Days Lapsed</span>
                  <strong className="block text-sm text-red-700 dark:text-red-400 mt-1">{preview.totalLapsedDays}</strong>
                </div>
              </div>

              {preview.items?.length > 0 && (
                <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy/5 dark:bg-white/5">
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Employee</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Leave Type</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Allocated</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Used</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Remaining</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">CF %</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-emerald-600 uppercase tracking-wider">Carry Fwd</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-red-600 uppercase tracking-wider">Lapsed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.items.map((item, i) => (
                        <tr key={i} className="border-t border-navy/5 dark:border-white/5 hover:bg-navy/[0.02] dark:hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            <div className="font-bold text-navy dark:text-white">{item.employeeName}</div>
                            <div className="text-[10px] text-navy/40 dark:text-white/40">{item.employeeCode}</div>
                          </td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{item.leaveTypeName}</td>
                          <td className="px-4 py-3 text-right text-navy/70 dark:text-white/70">{item.allocatedLeaves}</td>
                          <td className="px-4 py-3 text-right text-navy/70 dark:text-white/70">{item.usedLeaves}</td>
                          <td className="px-4 py-3 text-right font-bold text-navy dark:text-white">{item.remainingLeaves}</td>
                          <td className="px-4 py-3 text-right text-navy/50 dark:text-white/50">{item.carryForwardPct}%</td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">{item.carryForwardDays}</td>
                          <td className="px-4 py-3 text-right font-bold text-red-500">{item.lapsedDays}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {preview.items?.length === 0 && (
                <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
                  No eligible leave balances found for carry-forward from {preview.fromFinancialYear}.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Processing History */}
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Carry-Forward History</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Past carry-forward processing events.</p>
        </div>
        <div className="px-5 pb-5 space-y-3">
          {historyLoading ? (
            <div className="p-4 text-sm text-navy/50 dark:text-white/50">Loading history...</div>
          ) : Object.keys(historyGroups).length === 0 ? (
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
              No carry-forward history found.
            </div>
          ) : (
            Object.entries(historyGroups).map(([key, group]) => (
              <div key={key} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white text-sm">{group.from} → {group.to}</h4>
                    <div className="text-xs text-navy/50 dark:text-white/50 mt-0.5">
                      {new Date(group.date).toLocaleDateString()} · {group.items.length} employee(s) · {group.items.reduce((s, i) => s + i.carryForwardDays, 0)} days carried
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${group.trigger?.includes('Auto') ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700'}`}>
                      {group.trigger}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-navy/40 backdrop-blur-sm">
          <div className="card-surface w-full max-w-md">
            <div className="p-5 border-b border-navy/10">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Confirm Carry-Forward</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">
                This will carry forward <strong>{preview?.totalCarryForwardDays || 0} day(s)</strong> from <strong>{selectedFY}</strong> and reset balances for the new FY. This action cannot be undone.
              </p>
            </div>
            <div className="p-5 flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} disabled={processing} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Cancel</button>
              <button onClick={handleProcess} disabled={processing} className="gold-button px-6 py-2.5 rounded-xl font-bold text-sm">
                {processing ? 'Processing...' : 'Confirm & Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
