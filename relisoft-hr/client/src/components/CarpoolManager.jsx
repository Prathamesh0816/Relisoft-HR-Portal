import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMyCommuteRoute, saveCommuteRoute, deleteCommuteRoute, findCarpoolMatches, getCarpoolGroups, createCarpoolGroup, joinCarpoolGroup, leaveCarpoolGroup } from '../api'
import { Car, Users, MapPin, Clock, Plus, LogOut, Search, UserPlus } from 'lucide-react'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function CarpoolManager() {
  const { carpool, setCarpool, setMessage } = useStore()
  const [tab, setTab] = useState('route')
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [commuteDays, setCommuteDays] = useState([])
  const [preferredTime, setPreferredTime] = useState('09:00')
  const [isDriver, setIsDriver] = useState(false)
  const [capacity, setCapacity] = useState(1)
  const [groupName, setGroupName] = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setCarpool({ loading: true })
    try {
      const [route, matches, groups] = await Promise.all([
        getMyCommuteRoute(), findCarpoolMatches(), getCarpoolGroups()
      ])
      setCarpool({ myRoute: route, matches, groups, loading: false })
      if (route) {
        setSource(route.sourceArea || '')
        setDestination(route.destinationArea || '')
        setCommuteDays(route.commuteDays?.split(',') || [])
        setPreferredTime(route.preferredTime?.slice(0, 5) || '09:00')
        setIsDriver(route.isDriver)
        setCapacity(route.capacity)
      }
    } catch { setCarpool({ loading: false }) }
  }

  const toggleDay = (day) => {
    setCommuteDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleSaveRoute = async () => {
    try {
      await saveCommuteRoute({
        sourceArea: source, destinationArea: destination,
        commuteDays: commuteDays.join(','), preferredTime,
        isDriver, capacity
      })
      setMessage({ type: 'success', text: 'Route saved!' })
      loadAll()
    } catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleDeleteRoute = async () => {
    try { await deleteCommuteRoute(); setCarpool({ myRoute: null }); setMessage({ type: 'success', text: 'Route removed' }) }
    catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return
    try {
      await createCarpoolGroup({ name: groupName })
      setGroupName(''); setMessage({ type: 'success', text: 'Group created!' })
      loadAll()
    } catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleJoin = async (id) => {
    try { await joinCarpoolGroup(id); loadAll(); setMessage({ type: 'success', text: 'Joined!' }) }
    catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleLeave = async (id) => {
    try { await leaveCarpoolGroup(id); loadAll() }
    catch { }
  }

  if (carpool.loading) return <div className="text-center py-10 text-muted">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['route', 'matches', 'groups'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-navy dark:text-white/70'}`}>
            {t === 'route' ? 'My Route' : t === 'matches' ? 'Matches' : 'Carpool Groups'}
          </button>
        ))}
      </div>

      {tab === 'route' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2"><MapPin size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">My Commute Route</h3></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Source Area</label>
              <input value={source} onChange={e => setSource(e.target.value)} className="input w-full" placeholder="e.g., Baner" />
            </div>
            <div>
              <label className="label">Destination Area</label>
              <input value={destination} onChange={e => setDestination(e.target.value)} className="input w-full" placeholder="e.g., Hinjewadi" />
            </div>
          </div>
          <div>
            <label className="label">Commute Days</label>
            <div className="flex gap-2 flex-wrap">
              {days.map(d => (
                <button key={d} onClick={() => toggleDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${commuteDays.includes(d) ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-muted'}`}>
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Preferred Time</label>
              <input type="time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)} className="input w-full" />
            </div>
            <div>
              <label className="label">Are you a driver?</label>
              <button onClick={() => setIsDriver(!isDriver)} className={`input w-full text-left ${isDriver ? 'text-moss' : ''}`}>
                {isDriver ? 'Yes (I can drive)' : 'No (I need a ride)'}
              </button>
            </div>
          </div>
          {isDriver && (
            <div>
              <label className="label">Seats Available</label>
              <input type="number" min={1} max={6} value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="input w-24" />
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSaveRoute} className="btn-primary flex-1"><Car size={16} /> Save Route</button>
            {carpool.myRoute && <button onClick={handleDeleteRoute} className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 font-bold text-sm hover:bg-red-200">Remove</button>}
          </div>
        </div>
      )}

      {tab === 'matches' && (
        <div className="space-y-4">
          {!carpool.myRoute ? (
            <div className="card-surface p-6 text-center text-muted">Save your route first to find matches.</div>
          ) : carpool.matches.length === 0 ? (
            <div className="card-surface p-6 text-center text-muted">No matches found along your route.</div>
          ) : (
            carpool.matches.map(m => (
              <div key={m.id} className="card-surface p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold text-sm">
                  {m.employeeName?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-navy dark:text-white text-sm">{m.employeeName}</div>
                  <div className="text-xs text-muted">{m.sourceArea} → {m.destinationArea} · {m.commuteDays}</div>
                </div>
                <div className="text-right text-xs text-muted">
                  <div>{m.isDriver ? '🚗 Driver' : '🚶 Rider'}</div>
                  <div>{m.preferredTime?.slice(0, 5)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'groups' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Users size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Create a Carpool Group</h3></div>
            <div className="flex gap-2">
              <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name..." className="input flex-1" />
              <button onClick={handleCreateGroup} className="btn-primary"><Plus size={16} /> Create</button>
            </div>
          </div>
          {carpool.groups.length === 0 ? (
            <div className="card-surface p-6 text-center text-muted">No groups yet. Create one or look for public groups!</div>
          ) : (
            carpool.groups.map(g => (
              <div key={g.id} className="card-surface p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-moss/10 flex items-center justify-center"><Users size={20} className="text-moss" /></div>
                <div className="flex-1">
                  <div className="font-bold text-navy dark:text-white text-sm">{g.name}</div>
                  <div className="text-xs text-muted">{g.members?.length || 0} members</div>
                  <div className="flex gap-2 mt-1">
                    {g.members?.map(m => (
                      <span key={m.employeeId} className="text-xs bg-gray-100 dark:bg-navy-dark/60 px-2 py-0.5 rounded-full">
                        {m.employeeName} {m.isDriver ? '🚗' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                {g.members?.some(m => m.employeeId === useStore.getState().currentUser?.id) ? (
                  <button onClick={() => handleLeave(g.id)} className="text-xs font-bold text-red-500 hover:text-red-700"><LogOut size={16} /></button>
                ) : (
                  <button onClick={() => handleJoin(g.id)} className="btn-primary text-xs py-1.5"><UserPlus size={14} /> Join</button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
