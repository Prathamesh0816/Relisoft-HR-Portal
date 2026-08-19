import { useState, useEffect } from 'react'
import { getAttendance, clockIn, clockOut, getAttendanceRegularizations, requestRegularization } from '../api'
import useStore from '../store'
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AttendanceTracker() {
  const { currentUser, attendance, setAttendance, setMessage } = useStore()
  const [records, setRecords] = useState([])
  const [today, setToday] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)
  const [showReg, setShowReg] = useState(false)
  const [regForm, setRegForm] = useState({ recordId: '', requestType: 'LateArrival', reason: '', submitting: false })
  const [myRegularizations, setMyRegularizations] = useState([])

  const loadData = async () => {
    try {
      const data = await getAttendance(currentUser?.employeeId)
      const t = data.find(r => new Date(r.date).toDateString() === new Date().toDateString())
      setRecords(data)
      setToday(t || null)
      setAttendance({ records: data, today: t || null, loading: false })
    } catch {}
  }

  useEffect(() => { loadData(); loadRegularizations() }, [])

  const loadRegularizations = async () => {
    try {
      const r = await getAttendanceRegularizations(currentUser?.employeeId)
      setMyRegularizations(Array.isArray(r) ? r : r || [])
    } catch {}
  }

  const handleRegularize = async (e) => {
    e.preventDefault()
    if (regForm.submitting) return
    setRegForm((f) => ({ ...f, submitting: true }))
    try {
      await requestRegularization({
        attendanceRecordId: Number(regForm.recordId),
        requestType: regForm.requestType,
        reason: regForm.reason
      })
      setMessage({ type: 'success', text: 'Regularization request submitted for HR approval.' })
      setRegForm({ recordId: '', requestType: 'LateArrival', reason: '', submitting: false })
      setShowReg(false)
      loadRegularizations()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Regularization request failed.' })
      setRegForm((f) => ({ ...f, submitting: false }))
    }
  }

  const handleClockIn = async () => {
    setLoadingAction(true)
    try {
      await clockIn()
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Clock in failed')
    }
    setLoadingAction(false)
  }

  const handleClockOut = async () => {
    setLoadingAction(true)
    try {
      await clockOut()
      await loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Clock out failed')
    }
    setLoadingAction(false)
  }

  const formatTime = (dt) => {
    if (!dt) return '--:--'
    return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const getDuration = (clockInTime, clockOutTime) => {
    if (!clockInTime) return '--'
    const start = new Date(clockInTime)
    const end = clockOutTime ? new Date(clockOutTime) : new Date()
    const diff = Math.floor((end - start) / 60000)
    const h = Math.floor(diff / 60)
    const m = diff % 60
    return `${h}h ${m}m`
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card-surface p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center mx-auto mb-4">
              <Clock size={36} className="text-navy-dark" />
            </div>
            <div className="text-3xl font-bold text-navy dark:text-white mb-1">
              {today ? formatTime(today.clockIn) : '--:--'}
            </div>
            <div className="text-sm text-muted dark:text-white/60 mb-1">Clock In</div>
            <div className="text-2xl font-bold text-navy dark:text-white mb-1">
              {today ? formatTime(today.clockOut) : '--:--'}
            </div>
            <div className="text-sm text-muted dark:text-white/60 mb-4">Clock Out</div>

            {today ? (
              <div className="mb-4">
                <div className="text-lg font-bold text-navy dark:text-white">{getDuration(today.clockIn, today.clockOut)}</div>
                <div className="text-xs text-muted dark:text-white/60">Today's Duration</div>
              </div>
            ) : (
              <div className="mb-4 px-4 py-2 rounded-lg bg-sage dark:bg-white/5 text-sm text-muted dark:text-white/60">
                <AlertCircle size={14} className="inline mr-1" />
                Not clocked in yet
              </div>
            )}

            <div className="flex gap-3 justify-center">
              {!today?.clockIn ? (
                <button onClick={handleClockIn} disabled={loadingAction}
                  className="gold-button px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <LogIn size={16} /> {loadingAction ? '...' : 'Clock In'}
                </button>
              ) : !today?.clockOut ? (
                <button onClick={handleClockOut} disabled={loadingAction}
                  className="px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 bg-danger text-white hover:bg-red-700 transition-all">
                  <LogOut size={16} /> {loadingAction ? '...' : 'Clock Out'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 size={18} /> Completed
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card-surface p-5">
            <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">Recent Attendance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-navy/10 dark:border-white/10">
                    <th className="text-left py-3 px-2 font-bold text-navy dark:text-white/80 text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-2 font-bold text-navy dark:text-white/80 text-xs uppercase tracking-wider">Clock In</th>
                    <th className="text-left py-3 px-2 font-bold text-navy dark:text-white/80 text-xs uppercase tracking-wider">Clock Out</th>
                    <th className="text-left py-3 px-2 font-bold text-navy dark:text-white/80 text-xs uppercase tracking-wider">Duration</th>
                    <th className="text-left py-3 px-2 font-bold text-navy dark:text-white/80 text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.slice(0, 10).map((r) => (
                    <tr key={r.id} className="border-b border-navy/5 dark:border-white/5 hover:bg-navy/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-medium text-navy dark:text-white">
                        {new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-2 text-muted dark:text-white/70">{formatTime(r.clockIn)}</td>
                      <td className="py-3 px-2 text-muted dark:text-white/70">{formatTime(r.clockOut)}</td>
                      <td className="py-3 px-2 text-muted dark:text-white/70">{getDuration(r.clockIn, r.clockOut)}</td>
                      <td className="py-3 px-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Present' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                          r.status === 'Late' ? 'bg-orange-100 dark:bg-orange-900/20 text-warning' :
                          'bg-red-100 dark:bg-red-900/20 text-danger'
                        }`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr><td colSpan={5} className="py-8 text-center text-muted dark:text-white/60 text-sm">No attendance records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="card-surface p-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-heading font-bold text-navy dark:text-white text-lg">Attendance regularization</h3>
            <p className="text-xs text-muted dark:text-white/60 mt-1">Request corrections for late arrival, early exit, or missed punches.</p>
          </div>
          <button onClick={() => setShowReg(!showReg)} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">
            {showReg ? 'Close' : 'Request correction'}
          </button>
        </div>
        {showReg && (
          <form onSubmit={handleRegularize} className="mt-4 grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Attendance record</label>
              <select value={regForm.recordId} disabled={regForm.submitting} onChange={(e) => setRegForm((f) => ({ ...f, recordId: e.target.value }))} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                <option value="">Select date</option>
                {records.filter((r) => r.status === 'Late' || r.status === 'EarlyExit' || r.status === 'Absent' || r.status === 'MissedPunch').map((r) => (
                  <option key={r.id} value={r.id}>{new Date(r.date).toLocaleDateString('en-IN')} — {r.status}</option>
                ))}
                {records.length > 0 && records.filter((r) => r.status === 'Late' || r.status === 'EarlyExit' || r.status === 'Absent' || r.status === 'MissedPunch').length === 0 && (
                  <option value="" disabled>No eligible records (Late / Early / Missed)</option>
                )}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Request type</label>
              <select value={regForm.requestType} disabled={regForm.submitting} onChange={(e) => setRegForm((f) => ({ ...f, requestType: e.target.value }))} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                <option value="LateArrival">Late arrival</option>
                <option value="EarlyExit">Early exit</option>
                <option value="MissedPunch">Missed punch</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Reason</label>
              <input value={regForm.reason} disabled={regForm.submitting} onChange={(e) => setRegForm((f) => ({ ...f, reason: e.target.value }))} placeholder="e.g. traffic, medical emergency" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
            </div>
            <div className="md:col-span-4">
              <button type="submit" disabled={regForm.submitting} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">{regForm.submitting ? 'Submitting...' : 'Submit request'}</button>
            </div>
          </form>
        )}
        {myRegularizations.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-bold text-sm text-navy dark:text-white">My requests</h4>
            {myRegularizations.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between text-sm">
                <div>
                  <span className="font-bold text-navy dark:text-white">{r.requestType}</span>
                  <span className="text-muted ml-2">{r.attendanceDate ? new Date(r.attendanceDate).toLocaleDateString('en-IN') : ''} · {r.reason}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : r.status === 'Rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
