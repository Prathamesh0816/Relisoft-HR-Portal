import { useState, useEffect, useCallback } from 'react'
import useStore from '../store'
import { getPayRuns, getStatutoryReport, exportStatutoryReport } from '../api'
import { Download, Wallet, Percent, ShieldCheck, FileSpreadsheet } from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const monthName = (m) => MONTHS[m - 1] || ''
const fmt = (n) => '₹' + (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const PAYROLL_ADMIN_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin']

export default function PayrollStatutory() {
  const { currentUser, setMessage } = useStore()
  const canManage = PAYROLL_ADMIN_ROLES.includes(currentUser?.role)

  const [runs, setRuns] = useState([])
  const [runId, setRunId] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const loadRuns = useCallback(async () => {
    try {
      const list = await getPayRuns()
      const processed = (list || []).filter((r) => r.status === 'Processed')
      setRuns(processed)
      if (processed.length && !runId) setRunId(String(processed[0].id))
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load pay runs.' })
    }
  }, [runId, setMessage])

  useEffect(() => { loadRuns() }, [loadRuns])

  const loadReport = useCallback(async () => {
    if (!runId) return
    setLoading(true)
    try {
      const data = await getStatutoryReport(runId)
      setReport(data)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load statutory register.' })
    } finally {
      setLoading(false)
    }
  }, [runId, setMessage])

  useEffect(() => { loadReport() }, [loadReport])

  const handleExport = async () => {
    if (!runId) return
    setExporting(true)
    try {
      await exportStatutoryReport(runId)
      setMessage({ type: 'success', text: 'Statutory register downloaded.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Export failed.' })
    } finally {
      setExporting(false)
    }
  }

  const employees = Array.isArray(report?.employees) ? report.employees : []
  const totals = report?.totals || {}

  return (
    <div className="space-y-6">
      <div className="card-surface p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-navy-dark border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Statutory Register</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-0.5">PF, ESI and Professional Tax computed from a processed pay run.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              className="input w-56"
              disabled={!runs.length}
            >
              {!runs.length && <option value="">No processed runs</option>}
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {monthName(r.periodMonth)} {r.periodYear} (Run #{r.id})
                </option>
              ))}
            </select>
            {canManage && (
              <button
                onClick={handleExport}
                disabled={exporting || !employees.length}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy dark:bg-navy-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Download size={16} /> {exporting ? 'Exporting…' : 'Export Excel'}
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card-surface p-10 text-center text-muted dark:text-white/60">Loading statutory register…</div>
      ) : !runId || !employees.length ? (
        <div className="card-surface p-10 text-center text-muted dark:text-white/60">
          <FileSpreadsheet className="mx-auto mb-3 opacity-40" size={40} />
          No statutory data yet. Process a pay run and it will appear here.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
            {[
              { label: 'Gross (month)', value: totals.gross, icon: Wallet },
              { label: 'PF (Employee)', value: totals.employeePf, icon: Percent },
              { label: 'PF (Employer)', value: totals.employerPf, icon: Percent },
              { label: 'EPS (Employer)', value: totals.employerEps, icon: Percent },
              { label: 'EDLI (Employer)', value: totals.employerEdli, icon: Percent },
              { label: 'ESI (Employee)', value: totals.employeeEsi, icon: Percent },
              { label: 'ESI (Employer)', value: totals.employerEsi, icon: Percent },
              { label: 'Professional Tax', value: totals.professionalTax, icon: Percent },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="card-surface p-4">
                <div className="flex items-center gap-2 text-[11px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wide">
                  <Icon size={13} /> {label}
                </div>
                <div className="mt-2 font-heading font-extrabold text-lg text-navy dark:text-white">{fmt(value)}</div>
              </div>
            ))}
          </div>

          <div className="card-surface overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-navy/50 dark:text-white/50 border-b border-navy/10 dark:border-white/10">
                  <th className="p-3">Employee</th>
                  <th className="p-3 text-right">Basic</th>
                  <th className="p-3 text-right">Gross</th>
                  <th className="p-3 text-right">PF (Emp)</th>
                  <th className="p-3 text-right">PF (Empr)</th>
                  <th className="p-3 text-right">EPS</th>
                  <th className="p-3 text-right">EDLI</th>
                  <th className="p-3 text-right">ESI (Emp)</th>
                  <th className="p-3 text-right">ESI (Empr)</th>
                  <th className="p-3 text-right">PT</th>
                  <th className="p-3 text-right">TDS</th>
                  <th className="p-3 text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.employeeId} className="border-b border-navy/5 dark:border-white/5 hover:bg-navy/[0.02] dark:hover:bg-white/[0.02]">
                    <td className="p-3">
                      <div className="font-bold text-navy dark:text-white">{e.employeeName}</div>
                      <div className="text-xs text-muted dark:text-white/50">{e.employeeCode}</div>
                    </td>
                    <td className="p-3 text-right text-navy dark:text-white">{fmt(e.basic)}</td>
                    <td className="p-3 text-right text-navy dark:text-white">{fmt(e.gross)}</td>
                    <td className="p-3 text-right">{fmt(e.employeePf)}</td>
                    <td className="p-3 text-right">{fmt(e.employerPf)}</td>
                    <td className="p-3 text-right">{fmt(e.employerEps)}</td>
                    <td className="p-3 text-right">{fmt(e.employerEdli)}</td>
                    <td className="p-3 text-right">{fmt(e.employeeEsi)}</td>
                    <td className="p-3 text-right">{fmt(e.employerEsi)}</td>
                    <td className="p-3 text-right">{fmt(e.professionalTax)}</td>
                    <td className="p-3 text-right">{fmt(e.tds)}</td>
                    <td className="p-3 text-right font-bold text-navy dark:text-white">{fmt(e.netPay)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-navy/[0.03] dark:bg-white/[0.03] font-bold text-navy dark:text-white">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3 text-right">{fmt(totals.basic)}</td>
                  <td className="p-3 text-right">{fmt(totals.gross)}</td>
                  <td className="p-3 text-right">{fmt(totals.employeePf)}</td>
                  <td className="p-3 text-right">{fmt(totals.employerPf)}</td>
                  <td className="p-3 text-right">{fmt(totals.employerEps)}</td>
                  <td className="p-3 text-right">{fmt(totals.employerEdli)}</td>
                  <td className="p-3 text-right">{fmt(totals.employeeEsi)}</td>
                  <td className="p-3 text-right">{fmt(totals.employerEsi)}</td>
                  <td className="p-3 text-right">{fmt(totals.professionalTax)}</td>
                  <td className="p-3 text-right">{fmt(totals.tds)}</td>
                  <td className="p-3 text-right"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  )
}