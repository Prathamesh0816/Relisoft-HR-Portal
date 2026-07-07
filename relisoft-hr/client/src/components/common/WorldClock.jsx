import { useState, useEffect, useRef } from 'react'
import { Globe, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import timezoneData from '../../data/timezoneData'

function getTime(tz) {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, weekday: 'short',
  })
  const parts = fmt.formatToParts(now)
  const time = parts.filter((p) => p.type === 'hour' || p.type === 'minute' || p.type === 'second' || p.type === 'dayPeriod').map((p) => p.value).join('')
  const day = parts.find((p) => p.type === 'weekday')?.value || ''
  const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0')
  return { time, day, isNight: h < 6 || h >= 18, isMorning: h >= 6 && h < 12 }
}

function getDate(tz) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: tz, day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())
}

export default function WorldClock() {
  const [open, setOpen] = useState(false)
  const [times, setTimes] = useState({})
  const ref = useRef(null)

  useEffect(() => {
    const update = () => {
      const t = {}
      timezoneData.forEach((e) => { t[e.tz] = getTime(e.tz) })
      setTimes(t)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const tIndia = times['Asia/Kolkata']

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${open ? 'text-white bg-[var(--moss)]' : 'text-[var(--ink)] bg-transparent'}`}
        style={{ borderColor: 'var(--muted)' }}
        title="World Clock"
      >
        <Globe className="h-3.5 w-3.5" />
        {tIndia && (
          <span className="hidden md:inline whitespace-nowrap">🇮🇳 {tIndia.time}</span>
        )}
      </button>

      {open && (
        <div className="fixed md:absolute right-2 md:right-0 top-14 md:top-full mt-1 w-[360px] md:w-[440px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-[85vh] overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white sticky top-0 bg-white z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                <Globe className="h-4 w-4" style={{ color: 'var(--moss)' }} />
                World Clock — {timezoneData.length} Timezones
              </h3>
              {tIndia && <span className="text-xs text-gray-400">Updated: {tIndia.time}</span>}
            </div>
          </div>
          <div className="divide-y divide-gray-50 overflow-y-auto max-h-[65vh]">
            {timezoneData.map((entry) => {
              const t = times[entry.tz]
              if (!t) return null
              const Icon = t.isNight ? Moon : t.isMorning ? Sunrise : Sun
              return (
                <div key={entry.tz} className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${entry.major ? 'bg-gradient-to-r from-relisoft-50/50 to-transparent' : ''}`}>
                  <span className="text-base flex-shrink-0 w-7 text-center">{entry.cities[0].flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${entry.major ? 'text-gray-900' : 'text-gray-800'}`}>
                        {entry.offset}
                      </span>
                      {entry.abbr && <span className="text-[10px] text-gray-400">{entry.abbr}</span>}
                      {entry.major && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: 'var(--moss)' }}>IST</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">{entry.cities.map((c) => c.name).slice(0, 3).join(', ')}{entry.cities.length > 3 ? ` +${entry.cities.length - 3}` : ''}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Icon className="h-3 w-3" style={{ color: t.isNight ? '#6366f1' : t.isMorning ? '#f59e0b' : '#f97316' }} />
                      <span className="text-sm font-mono font-bold text-gray-900">{t.time}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{t.day} &middot; {getDate(entry.tz)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="p-2 border-t border-gray-100 bg-gray-50 text-center sticky bottom-0 bg-gray-50">
            <a href="/world-clock" className="text-xs font-medium" style={{ color: 'var(--moss)' }}>View Full World Clock &rarr;</a>
          </div>
        </div>
      )}
    </div>
  )
}
