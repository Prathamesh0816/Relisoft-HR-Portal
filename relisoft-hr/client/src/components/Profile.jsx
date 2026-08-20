import { useEffect, useMemo, useState } from 'react'
import useStore from '../store'
import {
  getMyProfile, getProfile, updateMyProfile, updateProfile,
  getProfileRequests, getMyProfileRequests, reviewProfileRequest
} from '../api'
import { UserCircle2, ShieldCheck, Pencil, Check, X, Clock, Phone, Mail, MapPin, Calendar, Heart } from 'lucide-react'

const HR_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin']
const MANAGER_ROLES = ['Manager', 'ManagerL2', 'OrganizationHead']

function initials(name) {
  return (name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

function Field({ label, value }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-navy/40 dark:text-white/40">{label}</div>
      <div className="text-sm text-navy dark:text-white font-medium mt-0.5">{value || '—'}</div>
    </div>
  )
}

const PROFILE_FIELDS = [
  { field: 'fullName', label: 'Full name' },
  { field: 'phoneNumber', label: 'Phone number' },
  { field: 'personalEmail', label: 'Personal email' },
  { field: 'dateOfBirth', label: 'Date of birth', type: 'date' },
  { field: 'bloodGroup', label: 'Blood group' },
  { field: 'maritalStatus', label: 'Marital status' },
  { field: 'address', label: 'Address' },
  { field: 'emergencyContactName', label: 'Emergency contact name' },
  { field: 'emergencyContactPhone', label: 'Emergency contact phone' },
  { field: 'emergencyContactRelation', label: 'Emergency contact relation' },
]

export default function Profile() {
  const { currentUser, data, setMessage } = useStore()
  const [tab, setTab] = useState('myProfile')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({})
  const [myRequests, setMyRequests] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [requests, setRequests] = useState([])
  const [rejecting, setRejecting] = useState(null)

  const isHR = HR_ROLES.includes(currentUser?.role)
  const canViewPeople = isHR || MANAGER_ROLES.includes(currentUser?.role)

  const employees = useMemo(() => data.employees || [], [data.employees])

  const loadMy = async () => {
    setLoading(true)
    try {
      const [p, reqs] = await Promise.all([getMyProfile(), getMyProfileRequests()])
      setProfile(p)
      setMyRequests(reqs)
    } catch {}
    setLoading(false)
  }

  const loadRequests = async () => {
    try { setRequests(await getProfileRequests('Pending')) } catch {}
  }

  useEffect(() => {
    if (tab === 'myProfile') loadMy()
    if (tab === 'approvals') loadRequests()
    if (tab === 'people') setSelectedEmployee('')
  }, [tab])

  const viewEmployee = async (id) => {
    if (!id) { setProfile(null); return }
    try {
      const p = await getProfile(id)
      setProfile(p)
      setEditing(false)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load profile.' })
    }
  }

  const startEdit = () => {
    setForm({
      fullName: profile.fullName || '',
      phoneNumber: profile.phoneNumber || '',
      personalEmail: profile.personalEmail || '',
      dateOfBirth: profile.dateOfBirth ? String(profile.dateOfBirth).slice(0, 10) : '',
      bloodGroup: profile.bloodGroup || '',
      maritalStatus: profile.maritalStatus || '',
      address: profile.address || '',
      emergencyContactName: profile.emergencyContactName || '',
      emergencyContactPhone: profile.emergencyContactPhone || '',
      emergencyContactRelation: profile.emergencyContactRelation || '',
    })
    setEditing(true)
  }

  const handleSelfSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateMyProfile(form)
      setMessage({ type: 'success', text: res.message })
      setEditing(false)
      await loadMy()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to submit changes.' })
    }
    setSaving(false)
  }

  const handleHrSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await updateProfile(profile.id, form)
      setMessage({ type: 'success', text: res.message })
      setEditing(false)
      await viewEmployee(profile.id)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' })
    }
    setSaving(false)
  }

  const handleReview = async (id, action) => {
    try {
      const res = await reviewProfileRequest(id, action, rejecting?.id === id ? rejecting.comments : '')
      setMessage({ type: 'success', text: res.message })
      setRejecting(null)
      await loadRequests()
      if (tab === 'myProfile') await loadMy()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Review failed.' })
    }
  }

  const p = profile

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="section-kicker">People</span>
          <h2 className="section-title text-2xl mt-1">Employee Profile</h2>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('myProfile')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'myProfile' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
          My Profile
        </button>
        {canViewPeople && (
          <button onClick={() => setTab('people')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'people' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
            Team & People
          </button>
        )}
        {isHR && (
          <button onClick={() => setTab('approvals')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === 'approvals' ? 'gold-button' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
            Approvals
          </button>
        )}
      </div>

      {tab === 'myProfile' && (
        <>
          {loading ? (
            <div className="card-surface p-8 text-center text-sm text-muted">Loading profile...</div>
          ) : p && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card-surface p-6">
                <div className="flex items-center gap-4">
                  {p.profileImageUrl
                    ? <img src={p.profileImageUrl} alt={p.fullName} className="w-20 h-20 rounded-2xl object-cover" />
                    : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-1 to-gold-2 text-navy-dark grid place-items-center text-2xl font-bold">{initials(p.fullName)}</div>}
                  <div>
                    <h3 className="font-heading font-bold text-lg text-navy dark:text-white">{p.fullName}</h3>
                    <p className="text-sm text-muted dark:text-white/60">{p.designation || p.jobRole || 'Employee'}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{p.role}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-navy/70 dark:text-white/70"><Mail size={14} />{p.email}</div>
                  {p.phoneNumber && <div className="flex items-center gap-2 text-navy/70 dark:text-white/70"><Phone size={14} />{p.phoneNumber}</div>}
                  <div className="flex items-center gap-2 text-navy/70 dark:text-white/70"><MapPin size={14} />{p.location || '—'}</div>
                  <div className="flex items-center gap-2 text-navy/70 dark:text-white/70"><Calendar size={14} />Joined {new Date(p.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div className="pt-2 border-t border-navy/10 dark:border-white/10 text-xs font-bold text-navy/50 dark:text-white/50">
                    {p.employeeCode} · {p.department || 'General'} · {p.team || 'No team'}
                  </div>
                </div>
                <button onClick={startEdit} className="gold-button w-full mt-5 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                  <Pencil size={14} /> Edit profile
                </button>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {editing ? (
                  <form onSubmit={handleSelfSave} className="card-surface p-6 space-y-4">
                    <h3 className="font-heading font-bold text-navy dark:text-white">Edit profile</h3>
                    <p className="text-xs text-muted dark:text-white/60 bg-amber-50/50 dark:bg-white/5 p-3 rounded-xl">
                      Changes are submitted for HR approval. Your profile updates only after HR approves.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {PROFILE_FIELDS.map(({ field, label, type }) => (
                        <div key={field}>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">{label}</label>
                          <input type={type || 'text'} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-sm text-navy dark:text-white" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={saving} className="gold-button px-5 py-2.5 rounded-xl text-sm font-bold">
                        {saving ? 'Submitting...' : 'Submit for approval'}
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 text-sm font-bold">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-4"><UserCircle2 size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">Contact & personal</h3></div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Phone number" value={p.phoneNumber} />
                        <Field label="Personal email" value={p.personalEmail} />
                        <Field label="Date of birth" value={p.dateOfBirth ? new Date(p.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} />
                        <Field label="Blood group" value={p.bloodGroup} />
                        <Field label="Marital status" value={p.maritalStatus} />
                        <Field label="Address" value={p.address} />
                        <Field label="PAN number" value={p.panNumber} />
                        <Field label="UAN number" value={p.uanNumber} />
                      </div>
                    </div>
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-4"><Heart size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">Emergency contact</h3></div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Field label="Name" value={p.emergencyContactName} />
                        <Field label="Phone" value={p.emergencyContactPhone} />
                        <Field label="Relation" value={p.emergencyContactRelation} />
                      </div>
                    </div>
                  </>
                )}

                <div className="card-surface p-6">
                  <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">My change requests</h3></div>
                  {myRequests.length === 0 ? (
                    <p className="text-sm text-muted dark:text-white/60">No change requests yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {myRequests.map((r) => (
                        <div key={r.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="text-sm font-bold text-navy dark:text-white capitalize">{r.field.replace(/([A-Z])/g, ' $1')}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                              r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-50 text-amber-700'}`}>
                              {r.status}
                            </span>
                          </div>
                          <p className="text-xs text-muted dark:text-white/60 mt-1">
                            {r.oldValue || '—'} → {r.newValue || '—'}
                          </p>
                          <p className="text-[10px] text-muted dark:text-white/40 mt-1">
                            Requested {new Date(r.requestedOn).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {r.reviewedByName && ` · Reviewed by ${r.reviewedByName}`}
                            {r.reviewComments && ` · "${r.reviewComments}"`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'people' && canViewPeople && (
        <div className="space-y-4">
          <div className="card-surface p-5">
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Select employee</label>
            <select value={selectedEmployee} onChange={(e) => { setSelectedEmployee(e.target.value); viewEmployee(e.target.value) }}
              className="mt-1.5 w-full max-w-md h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-sm text-navy dark:text-white">
              <option value="">Choose an employee...</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName} — {e.designation || e.jobRole} ({e.employeeCode})</option>
              ))}
            </select>
          </div>

          {profile && (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="card-surface p-6">
                <div className="flex items-center gap-4">
                  {profile.profileImageUrl
                    ? <img src={profile.profileImageUrl} alt={profile.fullName} className="w-20 h-20 rounded-2xl object-cover" />
                    : <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-1 to-gold-2 text-navy-dark grid place-items-center text-2xl font-bold">{initials(profile.fullName)}</div>}
                  <div>
                    <h3 className="font-heading font-bold text-lg text-navy dark:text-white">{profile.fullName}</h3>
                    <p className="text-sm text-muted dark:text-white/60">{profile.designation || profile.jobRole || 'Employee'}</p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{profile.role}</span>
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-navy/70 dark:text-white/70">
                  <div className="flex items-center gap-2"><Mail size={14} />{profile.email}</div>
                  {profile.phoneNumber && <div className="flex items-center gap-2"><Phone size={14} />{profile.phoneNumber}</div>}
                  <div className="flex items-center gap-2"><Calendar size={14} />Joined {new Date(profile.joinDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {isHR && (
                  <button onClick={startEdit} className="gold-button w-full mt-5 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <Pencil size={14} /> {editing ? 'Editing...' : 'Edit profile'}
                  </button>
                )}
              </div>

              <div className="lg:col-span-2 space-y-4">
                {editing ? (
                  <form onSubmit={handleHrSave} className="card-surface p-6 space-y-4">
                    <h3 className="font-heading font-bold text-navy dark:text-white">Update {profile.fullName}'s profile</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {PROFILE_FIELDS.map(({ field, label, type }) => (
                        <div key={field}>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">{label}</label>
                          <input type={type || 'text'} value={form[field] || ''} onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-sm text-navy dark:text-white" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={saving} className="gold-button px-5 py-2.5 rounded-xl text-sm font-bold">
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 text-sm font-bold">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-4"><UserCircle2 size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">Contact & personal</h3></div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Field label="Phone number" value={profile.phoneNumber} />
                        <Field label="Personal email" value={profile.personalEmail} />
                        <Field label="Date of birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''} />
                        <Field label="Blood group" value={profile.bloodGroup} />
                        <Field label="Marital status" value={profile.maritalStatus} />
                        <Field label="Address" value={profile.address} />
                        <Field label="PAN number" value={profile.panNumber} />
                        <Field label="UAN number" value={profile.uanNumber} />
                      </div>
                    </div>
                    <div className="card-surface p-6">
                      <div className="flex items-center gap-2 mb-4"><Heart size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">Emergency contact</h3></div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Field label="Name" value={profile.emergencyContactName} />
                        <Field label="Phone" value={profile.emergencyContactPhone} />
                        <Field label="Relation" value={profile.emergencyContactRelation} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'approvals' && isHR && (
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4"><ShieldCheck size={16} className="text-gold-1" /><h3 className="font-heading font-bold text-navy dark:text-white">Pending profile change requests</h3></div>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted dark:text-white/60">No pending requests.</div>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-navy dark:text-white">{r.employeeName}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Pending</span>
                      </div>
                      <p className="text-xs text-muted dark:text-white/60 mt-1 capitalize">{r.field.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="text-sm text-navy dark:text-white mt-1">
                        <span className="text-muted line-through">{r.oldValue || '—'}</span> → <strong>{r.newValue || '—'}</strong>
                      </p>
                      <p className="text-[10px] text-muted dark:text-white/40 mt-1">
                        Requested by {r.requestedByName} · {new Date(r.requestedOn).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {rejecting?.id === r.id && (
                        <input value={rejecting.comments} onChange={(e) => setRejecting({ ...rejecting, comments: e.target.value })}
                          placeholder="Reason for rejection (optional)" autoFocus
                          className="mt-2 w-full max-w-md px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy dark:text-white outline-none focus:ring-2 focus:ring-gold-1/40" />
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {rejecting?.id === r.id ? (
                        <>
                          <button onClick={() => handleReview(r.id, 'reject')} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold">Confirm reject</button>
                          <button onClick={() => setRejecting(null)} className="px-4 py-2 rounded-xl border border-navy/10 text-xs font-bold">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleReview(r.id, 'approve')} className="px-4 py-2 rounded-xl bg-green-600 text-white text-xs font-bold flex items-center gap-1"><Check size={14} /> Approve</button>
                          <button onClick={() => setRejecting({ id: r.id, comments: '' })} className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold flex items-center gap-1"><X size={14} /> Reject</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}