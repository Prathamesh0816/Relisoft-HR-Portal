import { useState, useEffect, useMemo } from 'react'
import useStore from '../store'
import { getHolidays } from '../api'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function LeaveCalendar() {
  const { data } = useStore()
  const [month, setMonth] = useState(new Date().getMonth())
  const [year, setYear] = useState(new Date().getFullYear())
  const [holidays, setHolidays] = useState([])

  useEffect(() => {
    getHolidays(year).then(setHolidays).catch(() => {})
  }, [year])

  const holidayMap = useMemo(() => {
    const map = {}
    for (const h of holidays) {
      const d = new Date(h.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(h)
    }
    return map
  }, [holidays])

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

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Leave calendar</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Month-wise view of leave activity and holidays across the organization.</p>
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
            {grid.map((day, i) => {
              const key = day ? `${year}-${month}-${day}` : null
              const dayHolidays = key ? holidayMap[key] : []
              const isHoliday = dayHolidays?.length > 0
              return (
                <div key={i} className={`p-3 min-h-[80px] border-b border-r border-navy/5 dark:border-white/5 ${day ? (isHoliday ? 'bg-green-50 dark:bg-green-900/20' : 'bg-white dark:bg-[var(--bg-secondary)]') : 'bg-navy/[0.02]'}`}>
                  {day && (
                    <>
                      <span className={`text-xs font-bold ${isToday(day) ? 'text-gold-1' : isHoliday ? 'text-green-700 dark:text-green-400' : 'text-navy/70 dark:text-white/70'}`}>
                        {day}
                        {isToday(day) && <span className="ml-1 text-[8px]">&#9679;</span>}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {isHoliday && dayHolidays.slice(0, 2).map((h) => (
                          <div key={h.id} className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-800/40 text-green-800 dark:text-green-300 truncate font-bold">{h.name}</div>
                        ))}
                        {data.employees.filter((e) => e.leaveBalances?.some((lb) => lb.usedLeaves > 0)).slice(0, 2).map((e) => (
                          <div key={e.id} className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-800 truncate font-bold">{e.fullName.split(' ')[0]}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 space-y-3">
          <div>
            <span className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Legend</span>
            <div className="flex flex-wrap gap-3 mt-2">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-50 dark:bg-amber-900/30" /><span className="text-xs text-navy/70 dark:text-white/70">Leave day</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-50 dark:bg-red-900/30" /><span className="text-xs text-navy/70 dark:text-white/70">Today</span></div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-100 dark:bg-green-800/40" /><span className="text-xs text-navy/70 dark:text-white/70">Holiday</span></div>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Holidays {year}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {holidays.map((h) => (
                <div key={h.id} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white dark:bg-navy-dark/60 border border-navy/5 dark:border-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${h.type === 'Fixed' ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <span className="text-[10px] text-navy/70 dark:text-white/70">
                    <span className="font-bold">{h.name}</span>
                    <span className="text-navy/40 dark:text-white/40"> — {h.date}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
