import { useState, useMemo } from 'react'
import useStore from '../store'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function LeaveCalendar() {
  const { data, currentUser } = useStore()
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())

  const employee = data.employees.find((e) => String(e.id) === String(currentUser?.employeeId))

  const myLeaves = useMemo(() => {
    if (!employee) return []
    const leaves = []
    for (const emp of data.employees) {
      for (const lb of emp.leaveBalances || []) {
        leaves.push({ ...lb, employeeName: emp.fullName })
      }
    }
    return leaves.filter((l) => String(emp.id) === String(employee.id))
  }, [data.employees, employee])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const grid = useMemo(() => {
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(d)
    return cells
  }, [firstDay, daysInMonth])

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Leave calendar</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Month-wise view of leave activity across the organization.</p>
      </div>
      <div className="px-5 pb-5 space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={prev} className="px-4 py-2 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">&larr;</button>
          <h3 className="font-heading font-bold text-lg text-navy dark:text-white">{MONTHS[month]} {year}</h3>
          <button onClick={next} className="px-4 py-2 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">&rarr;</button>
        </div>
        <div className="rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] overflow-hidden">
          <div className="grid grid-cols-7">
            {DAYS.map((d) => (
              <div key={d} className="p-2 text-center text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase bg-amber-50/50 border-b border-navy/5 dark:border-white/5">{d}</div>
            ))}
            {grid.map((day, i) => (
              <div key={i} className={`p-3 min-h-[80px] border-b border-r border-navy/5 dark:border-white/5 ${day ? 'bg-white dark:bg-[var(--bg-secondary)]' : 'bg-navy/[0.02]'}`}>
                {day && (
                  <>
                    <span className={`text-xs font-bold ${day === today.getDate() && month === today.getMonth() && year === today.getFullYear() ? 'text-gold-1' : 'text-navy/70 dark:text-white/70'}`}>{day}</span>
                    <div className="mt-1 space-y-0.5">
                      {data.employees.filter((e) => e.leaveBalances?.some((lb) => lb.usedLeaves > 0)).slice(0, 3).map((e) => (
                        <div key={e.id} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-800 truncate font-bold">{e.fullName.split(' ')[0]}</div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
          <span className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Legend</span>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/30" /><span className="text-xs text-navy/70 dark:text-white/70">Leave day</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/30" /><span className="text-xs text-navy/70 dark:text-white/70">Today</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
