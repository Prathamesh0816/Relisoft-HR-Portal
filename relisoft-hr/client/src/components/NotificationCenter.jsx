import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMyNotifications, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount } from '../api'
import { Bell, CheckCheck, CheckCircle, Mail, MailOpen, ExternalLink, X } from 'lucide-react'

const CATEGORY_COLORS = {
  Leave: 'bg-blue-50 text-blue-700',
  Payroll: 'bg-emerald-50 text-emerald-700',
  General: 'bg-amber-50 text-amber-700',
  Ticket: 'bg-purple-50 text-purple-700',
  Training: 'bg-cyan-50 text-cyan-700',
  Benefits: 'bg-rose-50 text-rose-700'
}

export default function NotificationCenter() {
  const { notifications, setNotifications, setMessage } = useStore()
  const [tab, setTab] = useState('all')

  useEffect(() => {
    getMyNotifications().then((r) => setNotifications({ list: r.notifications || [], loading: false }))
    getUnreadNotificationCount().then((r) => setNotifications({ unreadCount: r.count || 0 }))
  }, [])

  const refreshAll = async () => {
    const [r, cnt] = await Promise.all([getMyNotifications(tab === 'unread'), getUnreadNotificationCount()])
    setNotifications({ list: r.notifications || [], unreadCount: cnt.count || 0 })
  }

  const handleMarkRead = async (id) => {
    try { await markNotificationRead(id); const r = await getMyNotifications(tab === 'unread'); setNotifications({ list: r.notifications || [] }); const cnt = await getUnreadNotificationCount(); setNotifications({ unreadCount: cnt.count || 0 }) }
    catch { }
  }

  const handleMarkAllRead = async () => {
    try { await markAllNotificationsRead(); await refreshAll(); setMessage({ type: 'success', text: 'All marked as read.' }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const handleTabChange = (t) => {
    setTab(t)
    getMyNotifications(t === 'unread').then((r) => setNotifications({ list: r.notifications || [] }))
  }

  const filtered = notifications.list

  return (
    <div className="space-y-4">
      <div className="card-surface p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center relative">
              <Bell size={22} className="text-navy-dark" />
              {notifications.unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{notifications.unreadCount > 99 ? '99+' : notifications.unreadCount}</span>
              )}
            </div>
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Notifications</h2>
              <p className="text-muted text-sm mt-1">{notifications.unreadCount} unread</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
              <button onClick={() => handleTabChange('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'all' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>All</button>
              <button onClick={() => handleTabChange('unread')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tab === 'unread' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Unread</button>
            </div>
            {notifications.unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="px-3 py-1.5 rounded-xl border border-navy/10 text-muted font-bold text-xs hover:bg-navy/5"><CheckCheck size={14} className="inline mr-1" />Mark all read</button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">No notifications.</div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${n.isRead ? 'border-navy/5 dark:border-white/5 bg-white dark:bg-[var(--bg-secondary)]' : 'border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10'}`}
                onClick={() => { if (!n.isRead) handleMarkRead(n.id) }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${CATEGORY_COLORS[n.category] || 'bg-gray-50 text-gray-700'}`}>{n.category || 'General'}</span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-gold-1" />}
                    </div>
                    <div className={`font-bold text-sm ${n.isRead ? 'text-navy/60 dark:text-white/60' : 'text-navy dark:text-white'}`}>{n.title}</div>
                    {n.message && <div className={`text-xs mt-1 ${n.isRead ? 'text-navy/50 dark:text-white/50' : 'text-navy/70 dark:text-white/70'}`}>{n.message}</div>}
                    <div className="text-[10px] text-muted mt-1">{new Date(n.createdOn).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!n.isRead && (
                      <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id) }} className="p-1.5 rounded-lg bg-navy/5 text-muted hover:bg-navy/10"><MailOpen size={14} /></button>
                    )}
                    {n.linkUrl && (
                      <a href={n.linkUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 rounded-lg bg-navy/5 text-muted hover:bg-navy/10"><ExternalLink size={14} /></a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
