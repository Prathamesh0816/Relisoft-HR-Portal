import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Plus, X, Loader2, Trash2, Sun, Moon, Star, Gift, Globe } from 'lucide-react'
import toast from 'react-hot-toast'
import { holidayAPI } from '../../services/api'
import countryHolidays, { countryFlags } from '../../data/holidayData'

const countries = Object.keys(countryHolidays)

const typeColors = {
  Public: 'bg-red-100 text-red-800',
  Federal: 'bg-blue-100 text-blue-800',
  National: 'bg-green-100 text-green-800',
  Statutory: 'bg-purple-100 text-purple-800',
  'Bank Holiday': 'bg-indigo-100 text-indigo-800',
  Optional: 'bg-relisoft-100 text-relisoft-800',
  Observance: 'bg-amber-100 text-amber-800',
  State: 'bg-orange-100 text-orange-800',
  Regular: 'bg-rose-100 text-rose-800',
  Special: 'bg-teal-100 text-teal-800',
}

const locations = ['All', 'Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata']

export default function HolidayList() {
  const [holidays, setHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedCountry, setSelectedCountry] = useState('India')
  const [showAddModal, setShowAddModal] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [locationFilter, setLocationFilter] = useState('All')
  const [monthFilter, setMonthFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [form, setForm] = useState({ date: '', name: '', type: 'Public', locations: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadHolidays()
  }, [selectedYear])

  const loadHolidays = async () => {
    try {
      const { data } = await holidayAPI.list({ year: selectedYear })
      setHolidays(data.holidays || data.data || data || countryHolidays[selectedCountry] || [])
    } catch (err) {
      setHolidays(countryHolidays[selectedCountry] || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setHolidays(countryHolidays[selectedCountry] || [])
  }, [selectedCountry])

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await holidayAPI.create(form)
      toast.success('Holiday added successfully')
      setShowAddModal(false)
      setForm({ date: '', name: '', type: 'Public', locations: '' })
      loadHolidays()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add holiday')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this holiday?')) return
    try {
      await holidayAPI.delete(id)
      toast.success('Holiday deleted')
      loadHolidays()
    } catch (err) {
      toast.error('Failed to delete holiday')
    }
  }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const filteredHolidays = holidays.filter((h) => {
    if (locationFilter !== 'All' && !(h.locations || [selectedCountry]).includes(locationFilter)) return false
    if (monthFilter !== 'All' && h.date && new Date(h.date).getMonth() !== parseInt(monthFilter)) return false
    if (typeFilter !== 'All' && h.type !== typeFilter) return false
    return true
  })

  const upcoming = filteredHolidays
    .filter((h) => h.date && h.date >= todayStr)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3)

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const getDayName = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const getHolidayIcon = (name) => {
    const lname = name.toLowerCase()
    if (lname.includes('diwali') || lname.includes('navratri') || lname.includes('dussehra')) return <Star className="h-4 w-4" />
    if (lname.includes('christmas') || lname.includes('new year') || lname.includes('gift')) return <Gift className="h-4 w-4" />
    if (lname.includes('holi') || lname.includes('spring')) return <Sun className="h-4 w-4" />
    if (lname.includes('eid') || lname.includes('ramadan') || lname.includes('muharram')) return <Moon className="h-4 w-4" />
    return <CalendarIcon className="h-4 w-4" />
  }

  const allTypes = [...new Set(holidays.map((h) => h.type).filter(Boolean))]
  const stats = {
    total: filteredHolidays.length,
    public: filteredHolidays.filter((h) => h.type === 'Public' || h.type === 'Federal' || h.type === 'National' || h.type === 'Statutory' || h.type === 'Bank Holiday' || h.type === 'Regular').length,
    optional: filteredHolidays.filter((h) => h.type === 'Optional' || h.type === 'Observance' || h.type === 'Special').length,
    weekends: filteredHolidays.filter((h) => {
      if (!h.date) return false
      const d = new Date(h.date)
      return d.getDay() === 0 || d.getDay() === 6
    }).length,
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Holiday Calendar</h1>
              <span className="text-2xl">{countryFlags[selectedCountry] || '🌍'}</span>
            </div>
            <p className="text-gray-500 mt-1">{selectedCountry} holiday calendar — {holidays.length} holidays</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={viewMode} onChange={(e) => setViewMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
              <option value="list">Table View</option>
              <option value="calendar">Calendar View</option>
            </select>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Add Holiday
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Total Holidays</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Mandatory</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.public}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Optional</p>
            <p className="text-2xl font-bold text-relisoft-600 mt-1">{stats.optional}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wider">On Weekends</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.weekends}</p>
          </div>
        </div>

        {upcoming.length > 0 && (
          <div className="bg-gradient-to-r from-relisoft-600 to-relisoft-700 rounded-xl p-4 mb-6 text-white shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <CalendarIcon className="h-5 w-5" />
              <h3 className="font-semibold">Upcoming {selectedCountry} Holidays</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {upcoming.map((h, i) => (
                <div key={i} className="bg-white/20 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2">
                  <span className="font-medium">{new Date(h.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</span>
                  <span className="opacity-80">&middot;</span>
                  <span>{h.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none font-medium">
                {countries.map((c) => (
                  <option key={c} value={c}>{countryFlags[c] || '🌍'} {c}</option>
                ))}
              </select>
            </div>
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
              {[2024, 2025, 2026, 2027, 2028].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {selectedCountry === 'India' && (
              <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                <option value="All">All Locations</option>
                {locations.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            )}
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
              <option value="All">All Months</option>
              {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
              <option value="All">All Types</option>
              {allTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-sm text-gray-400 ml-auto">
              {filteredHolidays.length} holiday{filteredHolidays.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Holiday Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHolidays.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No holidays found for {selectedCountry}</td></tr>
                  ) : filteredHolidays.map((h, i) => {
                    const isToday = h.date === todayStr
                    return (
                      <tr key={h._id || i} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-relisoft-50' : ''}`}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {h.date ? new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '--'}
                          {isToday && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: 'var(--moss)' }}>TODAY</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{h.day || (h.date ? getDayName(h.date) : '--')}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                          <span style={{ color: 'var(--moss)' }}>{getHolidayIcon(h.name)}</span>
                          {h.name}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[h.type] || 'bg-gray-100 text-gray-800'}`}>{h.type || 'Public'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {h._id && <button onClick={() => handleDelete(h._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {months.map((month, mi) => {
                const monthHolidays = filteredHolidays.filter((h) => h.date && new Date(h.date).getMonth() === mi)
                return (
                  <div key={mi} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
                      <span>{month}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{monthHolidays.length}</span>
                    </h4>
                    {monthHolidays.length === 0 ? (
                      <p className="text-xs text-gray-400 py-4 text-center">No holidays</p>
                    ) : (
                      <div className="space-y-2">
                        {monthHolidays.map((h, i) => (
                          <div key={i} className={`text-sm p-2.5 rounded-lg border ${h.date === todayStr ? 'bg-relisoft-50 border-relisoft-200' : 'bg-gray-50 border-transparent'}`}>
                            <div className="flex items-center gap-2">
                              <span style={{ color: 'var(--moss)' }}>{getHolidayIcon(h.name)}</span>
                              <div>
                                <p className="font-medium text-gray-900">{h.name}</p>
                                <p className="text-xs text-gray-500">{new Date(h.date).getDate()} {month} &middot; {h.day || ''}</p>
                              </div>
                            </div>
                            <span className={`inline-flex mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[h.type] || 'bg-gray-100'}`}>{h.type || 'Public'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Holiday</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                  <option value="Public">Public</option>
                  <option value="Optional">Optional</option>
                  <option value="Company">Company</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locations (comma separated)</label>
                <input type="text" value={form.locations} onChange={(e) => setForm({ ...form, locations: e.target.value })}
                  placeholder="e.g. Mumbai, Delhi, Bangalore"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Holiday
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
