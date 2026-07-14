import { useEffect, useState } from 'react'
import useStore from '../store'
import { getDesks, getMeetingRooms, bookDesk, bookRoom, getMyBookings, cancelDeskBooking, cancelRoomBooking } from '../api'
import { Monitor, DoorOpen, Calendar, Clock, X, CheckCircle, Building2 } from 'lucide-react'

const timeSlots = []
for (let h = 8; h <= 18; h++) {
  timeSlots.push(`${h.toString().padStart(2, '0')}:00`)
  if (h < 18) timeSlots.push(`${h.toString().padStart(2, '0')}:30`)
}

export default function DeskRoomBooking() {
  const { bookings, setBookings, setMessage, currentUser } = useStore()
  const [tab, setTab] = useState('desks')
  const [desks, setDesks] = useState([])
  const [rooms, setRooms] = useState([])
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState(null)
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [roomTitle, setRoomTitle] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setBookings({ loading: true })
    try {
      const [deskList, roomList, myBookings] = await Promise.all([
        getDesks(), getMeetingRooms(), getMyBookings()
      ])
      setDesks(deskList); setRooms(roomList)
      setBookings({
        desks: deskList, rooms: roomList,
        myDeskBookings: myBookings.deskBookings || [],
        myRoomBookings: myBookings.roomBookings || [],
        loading: false
      })
    } catch { setBookings({ loading: false }) }
  }

  const handleBookDesk = async () => {
    if (!selectedDesk) return
    try {
      await bookDesk({ deskId: selectedDesk, date: bookingDate, startTime: `${bookingDate}T${startTime}:00`, endTime: `${bookingDate}T${endTime}:00` })
      setMessage({ type: 'success', text: 'Desk booked!' })
      setSelectedDesk(null)
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Booking failed' }) }
  }

  const handleBookRoom = async () => {
    if (!selectedRoom || !roomTitle.trim()) return
    try {
      await bookRoom({ roomId: selectedRoom, title: roomTitle, date: bookingDate, startTime: `${bookingDate}T${startTime}:00`, endTime: `${bookingDate}T${endTime}:00` })
      setMessage({ type: 'success', text: 'Room booked!' })
      setSelectedRoom(null); setRoomTitle('')
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Booking failed' }) }
  }

  const handleCancelDesk = async (id) => {
    try { await cancelDeskBooking(id); loadAll() }
    catch { }
  }

  const handleCancelRoom = async (id) => {
    try { await cancelRoomBooking(id); loadAll() }
    catch { }
  }

  const buildings = [...new Set([...bookings.desks.map(d => d.building), ...bookings.rooms.map(r => r.building)])]
  const filteredDesks = desks.filter(d => !buildingFilter || d.building === buildingFilter)
  const filteredRooms = rooms.filter(r => !buildingFilter || r.building === buildingFilter)

  if (bookings.loading) return <div className="text-center py-10 text-muted">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['desks', 'rooms', 'my'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-navy dark:text-white/70'}`}>
            {t === 'desks' ? 'Hot Desks' : t === 'rooms' ? 'Meeting Rooms' : 'My Bookings'}
          </button>
        ))}
      </div>

      {tab === 'desks' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Monitor size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Book a Desk</h3></div>
            {buildings.length > 0 && (
              <select value={buildingFilter} onChange={e => setBuildingFilter(e.target.value)} className="input mb-4">
                <option value="">All Buildings</option>
                {buildings.map(b => <option key={b}>{b}</option>)}
              </select>
            )}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {filteredDesks.map(d => (
                <button key={d.id} onClick={() => setSelectedDesk(d.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${selectedDesk === d.id ? 'border-moss bg-moss/10' : 'border-gray-200 dark:border-navy-dark/60 hover:border-moss/50'}`}>
                  <DoorOpen size={24} className="mx-auto text-moss mb-1" />
                  <div className="font-bold text-sm text-navy dark:text-white">{d.name}</div>
                  <div className="text-xs text-muted">{d.floor}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Date</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="input w-full" />
              </div>
              <div>
                <label className="label">From</label>
                <select value={startTime} onChange={e => setStartTime(e.target.value)} className="input w-full">
                  {timeSlots.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">To</label>
                <select value={endTime} onChange={e => setEndTime(e.target.value)} className="input w-full">
                  {timeSlots.filter(t => t > startTime).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleBookDesk} disabled={!selectedDesk} className="btn-primary w-full">Book Desk</button>
          </div>
        </div>
      )}

      {tab === 'rooms' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Building2 size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Book a Meeting Room</h3></div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {filteredRooms.map(r => (
                <button key={r.id} onClick={() => setSelectedRoom(r.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${selectedRoom === r.id ? 'border-moss bg-moss/10' : 'border-gray-200 dark:border-navy-dark/60 hover:border-moss/50'}`}>
                  <DoorOpen size={24} className="mx-auto text-moss mb-1" />
                  <div className="font-bold text-sm text-navy dark:text-white">{r.name}</div>
                  <div className="text-xs text-muted">{r.capacity}p · {r.floor}</div>
                  <div className="text-xs text-muted mt-1">{r.hasProjector ? '📽️' : ''} {r.hasMonitor ? '🖥️' : ''}</div>
                </button>
              ))}
            </div>
            <input value={roomTitle} onChange={e => setRoomTitle(e.target.value)} placeholder="Meeting title..." className="input w-full mb-4" />
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="label">Date</label>
                <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} className="input w-full" />
              </div>
              <div>
                <label className="label">From</label>
                <select value={startTime} onChange={e => setStartTime(e.target.value)} className="input w-full">
                  {timeSlots.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">To</label>
                <select value={endTime} onChange={e => setEndTime(e.target.value)} className="input w-full">
                  {timeSlots.filter(t => t > startTime).map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <button onClick={handleBookRoom} disabled={!selectedRoom || !roomTitle.trim()} className="btn-primary w-full">Book Room</button>
          </div>
        </div>
      )}

      {tab === 'my' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <h3 className="font-bold text-navy dark:text-white mb-4"><Monitor size={16} className="inline mr-2" />My Desk Bookings</h3>
            {bookings.myDeskBookings.length === 0 ? <p className="text-muted text-sm">No desk bookings.</p> : (
              <div className="space-y-2">
                {bookings.myDeskBookings.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                    <Calendar size={16} className="text-moss" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-navy dark:text-white">{new Date(b.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted">{b.startTime?.slice(11, 16)} - {b.endTime?.slice(11, 16)} · {b.status}</div>
                    </div>
                    {b.status === 'Confirmed' && <button onClick={() => handleCancelDesk(b.id)} className="text-red-500 hover:text-red-700"><X size={16} /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-surface p-6">
            <h3 className="font-bold text-navy dark:text-white mb-4"><Building2 size={16} className="inline mr-2" />My Room Bookings</h3>
            {bookings.myRoomBookings.length === 0 ? <p className="text-muted text-sm">No room bookings.</p> : (
              <div className="space-y-2">
                {bookings.myRoomBookings.map(b => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                    <Calendar size={16} className="text-moss" />
                    <div className="flex-1">
                      <div className="text-sm font-bold text-navy dark:text-white">{b.title}</div>
                      <div className="text-xs text-muted">{new Date(b.date).toLocaleDateString()} · {b.startTime?.slice(11, 16)} - {b.endTime?.slice(11, 16)} · {b.status}</div>
                    </div>
                    {b.status === 'Confirmed' && <button onClick={() => handleCancelRoom(b.id)} className="text-red-500 hover:text-red-700"><X size={16} /></button>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
