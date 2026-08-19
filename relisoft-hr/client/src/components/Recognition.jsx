import { useEffect, useState } from 'react'
import useStore from '../store'
import {
  getKudos, giveKudos, getRecognitionAwards, createRecognitionAward,
  awardRecognitionRecipients, getFunFriday, createFunFriday, getRecognitionLeaderboard,
  getMyRewardPoints
} from '../api'
import { Star, Heart, Award, PartyPopper, Trophy, Send, Plus, X } from 'lucide-react'

const KUDOS_CATEGORIES = ['Teamwork', 'Innovation', 'Leadership', 'Customer Focus', 'Above & Beyond', 'Other']
const ADMIN_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin']
const LEADER_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin', 'Manager', 'ManagerL2', 'OrganizationHead']

export default function Recognition() {
  const { setMessage, data, currentUser } = useStore()
  const [tab, setTab] = useState('feed')
  const [feed, setFeed] = useState([])
  const [awards, setAwards] = useState([])
  const [funFriday, setFunFriday] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [myPoints, setMyPoints] = useState(null)
  const [loading, setLoading] = useState(true)

  const [kudosForm, setKudosForm] = useState({ receiverEmployeeId: '', category: 'Teamwork', message: '' })
  const [awardForm, setAwardForm] = useState({ title: '', description: '', category: 'Individual', scope: 'Monthly', periodLabel: '', awardPoints: 100 })
  const [recipientForm, setRecipientForm] = useState({ awardId: '', employees: [{ employeeId: '', teamName: '', reason: '', recognitionType: '' }] })
  const [funForm, setFunForm] = useState({ title: '', description: '', celebrationDate: new Date().toISOString().slice(0, 10) })

  const isAdmin = currentUser && ADMIN_ROLES.includes(currentUser.role)
  const isLeader = currentUser && LEADER_ROLES.includes(currentUser.role)
  const me = Number(currentUser?.employeeId)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [k, a, f, l, p] = await Promise.all([
        getKudos(), getRecognitionAwards(), getFunFriday(), getRecognitionLeaderboard(), getMyRewardPoints()
      ])
      setFeed(k); setAwards(a); setFunFriday(f); setLeaderboard(l); setMyPoints(p)
    } catch {}
    setLoading(false)
  }

  const handleGiveKudos = async () => {
    if (!kudosForm.receiverEmployeeId) return setMessage({ type: 'error', text: 'Select a colleague to recognize.' })
    try {
      const res = await giveKudos({ ...kudosForm, receiverEmployeeId: Number(kudosForm.receiverEmployeeId) })
      setMessage({ type: 'success', text: res.message })
      setKudosForm({ receiverEmployeeId: '', category: 'Teamwork', message: '' })
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to send kudos.' })
    }
  }

  const handleCreateAward = async () => {
    if (!awardForm.title) return setMessage({ type: 'error', text: 'Award title is required.' })
    try {
      const res = await createRecognitionAward(awardForm)
      setMessage({ type: 'success', text: res.message })
      setAwardForm({ title: '', description: '', category: 'Individual', scope: 'Monthly', periodLabel: '', awardPoints: 100 })
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create award.' })
    }
  }

  const handleAwardRecipients = async () => {
    if (!recipientForm.awardId) return setMessage({ type: 'error', text: 'Select an award.' })
    const recipients = recipientForm.employees.filter((r) => r.employeeId)
    if (!recipients.length) return setMessage({ type: 'error', text: 'Add at least one recipient.' })
    try {
      const res = await awardRecognitionRecipients(Number(recipientForm.awardId), { recipients })
      setMessage({ type: 'success', text: res.message })
      setRecipientForm({ awardId: '', employees: [{ employeeId: '', teamName: '', reason: '', recognitionType: '' }] })
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to award.' })
    }
  }

  const handleCreateFunFriday = async () => {
    if (!funForm.title) return setMessage({ type: 'error', text: 'Title is required.' })
    try {
      const res = await createFunFriday(funForm)
      setMessage({ type: 'success', text: res.message })
      setFunForm({ title: '', description: '', celebrationDate: new Date().toISOString().slice(0, 10) })
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create celebration.' })
    }
  }

  const updateRecipient = (i, field, value) => {
    const c = [...recipientForm.employees]
    c[i][field] = value
    setRecipientForm((s) => ({ ...s, employees: c }))
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-gold-1/30 border-t-gold-1 rounded-full animate-spin" /></div>

  const myKudos = feed.filter((k) => k.receiverId === me)
  const employees = data.employees.filter((e) => e.id !== me && (e.status === 'Active' || e.status === 'Onboarding'))

  const tabs = [
    { id: 'feed', label: 'Kudos', icon: Heart },
    { id: 'awards', label: 'Awards', icon: Award },
    { id: 'fun', label: 'Fun Friday', icon: PartyPopper },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-gold-1">{myPoints?.balance || 0}</div>
          <div className="text-xs text-muted font-bold mt-1">Points Balance</div>
        </div>
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-moss">{myKudos.length}</div>
          <div className="text-xs text-muted font-bold mt-1">Kudos Received</div>
        </div>
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">{awards.reduce((sum, a) => sum + a.recipients.filter((r) => r.employeeId === me).length, 0)}</div>
          <div className="text-xs text-muted font-bold mt-1">Awards Won</div>
        </div>
      </div>

      <div className="card-surface">
        <div className="p-5 flex items-center gap-3 border-b border-navy/10 dark:border-white/10 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t.id ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70'}`}>
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'feed' && (
          <div className="p-5 space-y-4">
            <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20">
              <select value={kudosForm.receiverEmployeeId} onChange={(e) => setKudosForm((s) => ({ ...s, receiverEmployeeId: e.target.value }))} className="input">
                <option value="">Recognize a colleague...</option>
                {employees.map((e) => (<option key={e.id} value={e.id}>{e.fullName}</option>))}
              </select>
              <select value={kudosForm.category} onChange={(e) => setKudosForm((s) => ({ ...s, category: e.target.value }))} className="input">
                {KUDOS_CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <input value={kudosForm.message} onChange={(e) => setKudosForm((s) => ({ ...s, message: e.target.value }))} className="input" placeholder="Why they deserve it..." />
              <button onClick={handleGiveKudos} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
                <Send size={14} /> Send kudos (+10 pts)
              </button>
            </div>
            <div className="space-y-2">
              {feed.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">No kudos yet. Be the first to appreciate a teammate!</div>
              ) : (
                feed.map((k) => (
                  <div key={k.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold shrink-0">
                      {k.giverName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-navy dark:text-white">{k.giverName}</span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy/5 dark:bg-white/10 text-muted">{k.category}</span>
                        <span className="text-[10px] font-bold text-gold-1">+{k.points} pts</span>
                      </div>
                      {k.message && <p className="text-xs text-muted mt-1">{k.message}</p>}
                      <div className="text-[10px] text-muted mt-1">to <span className="font-bold text-navy/70 dark:text-white/70">{k.receiverName}</span> · {new Date(k.createdOn).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'awards' && (
          <div className="p-5 space-y-4">
            {isAdmin && (
              <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-heading font-bold text-navy dark:text-white">Create a new award</div>
                </div>
                <div className="grid md:grid-cols-6 gap-3">
                  <input value={awardForm.title} onChange={(e) => setAwardForm((s) => ({ ...s, title: e.target.value }))} className="input md:col-span-2" placeholder="Award title" />
                  <input value={awardForm.description} onChange={(e) => setAwardForm((s) => ({ ...s, description: e.target.value }))} className="input md:col-span-2" placeholder="Description" />
                  <select value={awardForm.category} onChange={(e) => setAwardForm((s) => ({ ...s, category: e.target.value }))} className="input">
                    <option value="Individual">Individual</option>
                    <option value="Team">Team</option>
                    <option value="Special">Special</option>
                  </select>
                  <select value={awardForm.scope} onChange={(e) => setAwardForm((s) => ({ ...s, scope: e.target.value }))} className="input">
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="FunFriday">Fun Friday</option>
                  </select>
                  <input value={awardForm.periodLabel} onChange={(e) => setAwardForm((s) => ({ ...s, periodLabel: e.target.value }))} className="input" placeholder="Period (e.g. Aug 2026)" />
                  <input type="number" min="0" value={awardForm.awardPoints} onChange={(e) => setAwardForm((s) => ({ ...s, awardPoints: Number(e.target.value) }))} className="input" placeholder="Points" />
                  <button onClick={handleCreateAward} className="md:col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
                    <Plus size={14} /> Create award
                  </button>
                </div>
              </div>
            )}

            {isLeader && (
              <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-heading font-bold text-navy dark:text-white">Award recipients</div>
                </div>
                <div className="grid md:grid-cols-4 gap-3">
                  <select value={recipientForm.awardId} onChange={(e) => setRecipientForm((s) => ({ ...s, awardId: e.target.value }))} className="input">
                    <option value="">Select award...</option>
                    {awards.map((a) => (<option key={a.id} value={a.id}>{a.title} ({a.scope} · {a.periodLabel || a.category})</option>))}
                  </select>
                  {recipientForm.employees.map((r, i) => (
                    <div key={i} className="grid md:col-span-4 grid-cols-1 md:grid-cols-5 gap-3">
                      <select value={r.employeeId} onChange={(e) => updateRecipient(i, 'employeeId', e.target.value)} className="input">
                        <option value="">Select employee...</option>
                        {data.employees.filter((e) => e.status === 'Active' || e.status === 'Onboarding').map((e) => (<option key={e.id} value={e.id}>{e.fullName}</option>))}
                      </select>
                      <select value={r.recognitionType} onChange={(e) => updateRecipient(i, 'recognitionType', e.target.value)} className="input">
                        <option value="">Type...</option>
                        <option value="Individual">Individual</option>
                        <option value="Team">Team</option>
                        <option value="Special">Special</option>
                      </select>
                      <input value={r.teamName} onChange={(e) => updateRecipient(i, 'teamName', e.target.value)} className="input" placeholder="Team name (for team)" />
                      <input value={r.reason} onChange={(e) => updateRecipient(i, 'reason', e.target.value)} className="input md:col-span-2" placeholder="Reason" />
                      <button onClick={() => setRecipientForm((s) => ({ ...s, employees: s.employees.filter((_, j) => j !== i) }))} className="text-xs font-bold text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => setRecipientForm((s) => ({ ...s, employees: [...s.employees, { employeeId: '', teamName: '', reason: '', recognitionType: '' }] }))} className="text-xs font-bold text-gold-2">+ Add recipient</button>
                  <button onClick={handleAwardRecipients} className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
                    <Award size={14} /> Award
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {awards.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">No awards announced yet.</div>
              ) : (
                awards.map((a) => (
                  <div key={a.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark shrink-0">
                        <Award size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-heading font-bold text-navy dark:text-white">{a.title}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-navy/5 dark:bg-white/10 text-muted">{a.scope}</span>
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700">{a.category}</span>
                          {a.periodLabel && <span className="text-[10px] font-bold text-muted">{a.periodLabel}</span>}
                          <span className="text-[10px] font-bold text-gold-1">+{a.awardPoints} pts</span>
                        </div>
                        {a.description && <p className="text-xs text-muted mt-1">{a.description}</p>}
                        {a.recipients.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {a.recipients.map((r) => (
                              <span key={r.id} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 font-bold">
                                {r.employeeName}{r.teamName ? ` · ${r.teamName}` : ''} <span className="font-normal text-emerald-700/70">({r.recognitionType})</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'fun' && (
          <div className="p-5 space-y-4">
            {isAdmin && (
              <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 dark:bg-amber-900/20">
                <input value={funForm.title} onChange={(e) => setFunForm((s) => ({ ...s, title: e.target.value }))} className="input" placeholder="Theme (e.g. Diwali Special)" />
                <input value={funForm.description} onChange={(e) => setFunForm((s) => ({ ...s, description: e.target.value }))} className="input md:col-span-2" placeholder="What's happening this Friday" />
                <input type="date" value={funForm.celebrationDate} onChange={(e) => setFunForm((s) => ({ ...s, celebrationDate: e.target.value }))} className="input" />
                <button onClick={handleCreateFunFriday} className="md:col-span-4 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
                  <Plus size={14} /> Announce Fun Friday
                </button>
              </div>
            )}
            <div className="space-y-2">
              {funFriday.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">No Fun Friday celebrations yet.</div>
              ) : (
                funFriday.map((f) => (
                  <div key={f.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-gold-2 flex items-center justify-center text-white shrink-0">
                      <PartyPopper size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-navy dark:text-white">{f.title}</div>
                      {f.description && <p className="text-xs text-muted mt-1">{f.description}</p>}
                      <div className="text-[10px] text-muted mt-1">{new Date(f.celebrationDate).toLocaleDateString()} · announced by {f.createdByName}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="p-5">
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">Recognition points will appear here once colleagues earn them.</div>
              ) : (
                leaderboard.map((r, i) => (
                  <div key={r.employeeId} className="flex items-center gap-3 p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-gold-1 text-navy-dark' : i === 1 ? 'bg-gray-300 text-navy-dark' : i === 2 ? 'bg-amber-600 text-white' : 'bg-navy/5 dark:bg-white/10 text-navy dark:text-white'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-navy dark:text-white">{r.employeeName}</div>
                      <div className="text-[10px] text-muted">{r.designation || 'Employee'}</div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold text-muted">
                      <span>{r.kudosReceived} kudos</span>
                      <span className="text-gold-1">{r.lifetimeEarned} pts earned</span>
                      <span className="text-moss">{r.balance} pts balance</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}