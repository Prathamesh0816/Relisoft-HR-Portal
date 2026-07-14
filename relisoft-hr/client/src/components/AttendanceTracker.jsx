import { useState, useEffect } from 'react'
import { getAttendance, clockIn, clockOut } from '../api'
import useStore from '../store'
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle } from 'lucide-react'

export default function AttendanceTracker() {
  const { currentUser, attendance, setAttendance } = useStore()
  const [records, setRecords] = useState([])
  const [today, setToday] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const loadData = async () => {
    try {
      const data = await getAttendance(currentUser?.id)
      const t = data.find(r => new Date(r.date).toDateString() === new Date().toDateString())
      setRecords(data)
      setToday(t || null)
      setAttendance({ records: data, today: t || null, loading: false })
    } catch {}
  }

  useEffect(() => { loadData() }, [])

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
    </div>
  )
}
