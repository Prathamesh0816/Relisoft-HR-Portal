import { useState, useEffect } from 'react'
import { Globe, Search, Sun, Moon, Sunrise, Sunset, Clock } from 'lucide-react'
import timezoneData, { regions } from '../../data/timezoneData'

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

function getOffset(tz) {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
  const diff = (local.getTime() - utc) / 3600000
  const sign = diff >= 0 ? '+' : ''
  return `UTC${sign}${diff.toFixed(1).replace('.0', '')}`
}

const allEntries = timezoneData.flatMap((entry) =>
  entry.cities.map((c) => ({ ...c, offset: entry.offset, abbr: entry.abbr, tz: entry.tz, major: entry.major }))
)

export default function WorldClockPage() {
  const [times, setTimes] = useState({})
  const [search, setSearch] = useState('')
  const [activeRegion, setActiveRegion] = useState(null)

  useEffect(() => {
    const update = () => {
      const t = {}
      allEntries.forEach((c) => { t[c.tz] = getTime(c.tz) })
      setTimes(t)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  const filtered = (() => {
    if (activeRegion) {
      const region = regions.find((r) => r.name === activeRegion)
      const offsets = region ? region.offsets : []
      const entries = timezoneData.filter((e) => offsets.includes(e.offset))
      return entries.flatMap((e) => e.cities.map((c) => ({ ...c, offset: e.offset, abbr: e.abbr, tz: e.tz, major: e.major })))
    }
    if (search) {
      return allEntries.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.country.toLowerCase().includes(search.toLowerCase()) ||
        c.offset.toLowerCase().includes(search.toLowerCase())
      )
    }
    return allEntries
  })()

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-8 w-8" style={{ color: 'var(--moss)' }} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">World Clock</h1>
              <p className="text-sm text-gray-400">{timezoneData.length} timezones &middot; {allEntries.length}+ cities &middot; updates every second</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveRegion(null) }}
              placeholder="Search city, country, or timezone..." autoFocus
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => { setActiveRegion(null); setSearch('') }}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors flex-shrink-0 ${!activeRegion && !search ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50'}`}
              style={!activeRegion && !search ? { background: 'var(--moss)' } : {}}
            >
              <Globe className="h-3.5 w-3.5 inline mr-1" />All
            </button>
            {regions.map((r) => (
              <button key={r.name}
                onClick={() => { setActiveRegion(r.name); setSearch('') }}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap border transition-colors flex-shrink-0 ${activeRegion === r.name ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50'}`}
                style={activeRegion === r.name ? { background: r.color } : {}}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((c) => {
            const t = times[c.tz]
            if (!t) return null
            const Icon = t.isNight ? Moon : t.isMorning ? Sunrise : Sun
            const isLocal = c.major && c.tz === 'Asia/Kolkata'
            return (
              <div key={`${c.tz}-${c.name}`}
                className={`bg-white rounded-xl border hover:shadow-md transition-all relative overflow-hidden ${isLocal ? 'border-relisoft-300 ring-1 ring-relisoft-100' : 'border-gray-200'}`}>
                {isLocal && <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: 'var(--moss)' }} />}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{c.flag}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                          {isLocal && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: 'var(--moss)' }}>LOCAL</span>}
                        </div>
                        <p className="text-xs text-gray-400">{c.country}</p>
                      </div>
                    </div>
                    <Icon className="h-4 w-4" style={{ color: t.isNight ? '#6366f1' : t.isMorning ? '#f59e0b' : '#f97316' }} />
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-mono font-bold text-gray-900 tracking-tight">{t.time}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{t.day} &middot; {getDate(c.tz)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{getOffset(c.tz)}</span>
                      {c.abbr && <p className="text-[10px] text-gray-400 mt-0.5">{c.abbr}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Globe className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-lg">No cities found</p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" style={{ color: 'var(--moss)' }} />
            Complete Time Zone Reference
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🇺🇸 USA — 6 Timezones</p>
              <p className="text-gray-500">HST (UTC-10): Hawaii</p>
              <p className="text-gray-500">AKST (UTC-9): Alaska</p>
              <p className="text-gray-500">PST (UTC-8): West Coast</p>
              <p className="text-gray-500">MST (UTC-7): Mountain (AZ no DST)</p>
              <p className="text-gray-500">CST (UTC-6): Central</p>
              <p className="text-gray-500">EST (UTC-5): East Coast</p>
            </div>
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🇨🇦 Canada — 6 Timezones</p>
              <p className="text-gray-500">PST (UTC-8): Vancouver</p>
              <p className="text-gray-500">MST (UTC-7): Calgary, Edmonton</p>
              <p className="text-gray-500">CST (UTC-6): Winnipeg</p>
              <p className="text-gray-500">EST (UTC-5): Toronto, Ottawa, Montreal</p>
              <p className="text-gray-500">AST (UTC-4): Halifax</p>
              <p className="text-gray-500">NST (UTC-3:30): Newfoundland</p>
            </div>
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🇷🇺 Russia — 11 Timezones</p>
              <p className="text-gray-500">UTC+2: Kaliningrad &rarr; UTC+12: Kamchatka</p>
              <p className="text-gray-500">MSK (UTC+3): Moscow, St. Petersburg</p>
              <p className="text-gray-500">SAMT (UTC+4): Samara</p>
              <p className="text-gray-500">YEKT (UTC+5): Yekaterinburg</p>
              <p className="text-gray-500">OMSK (UTC+6): Omsk &bull; KRAT (UTC+7): Krasnoyarsk</p>
              <p className="text-gray-500">IRKT (UTC+8): Irkutsk &bull; YAKT (UTC+9): Yakutsk</p>
              <p className="text-gray-500">VLAT (UTC+10): Vladivostok &bull; MAGT (UTC+11): Magadan &bull; PET (UTC+12): Kamchatka</p>
            </div>
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🇦🇺 Australia — 5+ Timezones</p>
              <p className="text-gray-500">AWST (UTC+8): Perth (West)</p>
              <p className="text-gray-500">ACST (UTC+9:30): Adelaide, Darwin (Central)</p>
              <p className="text-gray-500">AEST (UTC+10): Sydney, Melbourne (East)</p>
              <p className="text-gray-500">UTC+8:45: Eucla (rare)</p>
              <p className="text-gray-500">UTC+10:30: Lord Howe Island</p>
            </div>
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🇧🇷 Brazil — 4 Timezones</p>
              <p className="text-gray-500">UTC-5: Acre (Rio Branco)</p>
              <p className="text-gray-500">UTC-4: Amazon (Manaus)</p>
              <p className="text-gray-500">UTC-3: Brasilia (São Paulo, Rio)</p>
              <p className="text-gray-500">UTC-2: Fernando de Noronha</p>
              <p className="font-bold text-gray-800 mt-2">🇮🇩 Indonesia — 3 Timezones</p>
              <p className="text-gray-500">UTC+7: Jakarta (WIB) &bull; UTC+8: Bali (WITA) &bull; UTC+9: Papua (WIT)</p>
            </div>
            <div className="space-y-1.5 p-3 bg-gray-50 rounded-lg">
              <p className="font-bold text-gray-800">🌏 Unique Offset Zones</p>
              <p className="text-gray-500">UTC+5:30: 🇮🇳 India (IST) — no DST</p>
              <p className="text-gray-500">UTC+5:45: 🇳🇵 Nepal</p>
              <p className="text-gray-500">UTC+8:45: 🇦🇺 Eucla (Australia)</p>
              <p className="text-gray-500">UTC+10:30: 🇦🇺 Lord Howe Island</p>
              <p className="text-gray-500">UTC+12:45: 🇳🇿 Chatham Islands</p>
              <p className="text-gray-500">UTC+14: 🇰🇮 Kiribati (Line Islands) — Earliest!</p>
              <p className="text-gray-500">UTC-3:30: 🇨🇦 Newfoundland — 45min offset</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
