import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMentorshipProfile, saveMentorshipProfile, getMentors, getMyMentees, getMyMentor, requestMentorship, respondToMentorshipRequest, completeMentorship, getMentorshipSessions, addMentorshipSession } from '../api'
import { GraduationCap, UserCheck, Search, BookOpen, Clock, CheckCircle, XCircle, Plus, Users } from 'lucide-react'

export default function MentorshipProgram() {
  const { mentorship, setMentorship, setMessage, currentUser } = useStore()
  const [tab, setTab] = useState('profile')
  const [isMentor, setIsMentor] = useState(false)
  const [isMentee, setIsMentee] = useState(false)
  const [bio, setBio] = useState('')
  const [expertise, setExpertise] = useState('')
  const [goals, setGoals] = useState('')
  const [maxMentees, setMaxMentees] = useState(3)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMentorId, setSelectedMentorId] = useState(null)
  const [requestMsg, setRequestMsg] = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setMentorship({ loading: true })
    try {
      const [profile, mentors, myMentees, myMentor] = await Promise.all([
        getMentorshipProfile(), getMentors(), getMyMentees(), getMyMentor()
      ])
      setMentorship({ profile, mentors, myMentees, myMentor, loading: false })
      if (profile) {
        setIsMentor(profile.isMentor)
        setIsMentee(profile.isMentee)
        setBio(profile.bio || '')
        setExpertise(profile.areasOfExpertise || '')
        setGoals(profile.goals || '')
        setMaxMentees(profile.maxMentees || 3)
      }
    } catch { setMentorship({ loading: false }) }
  }

  const handleSaveProfile = async () => {
    try {
      await saveMentorshipProfile({ isMentor, isMentee, bio, areasOfExpertise: expertise, goals, maxMentees })
      setMessage({ type: 'success', text: 'Profile saved!' })
      loadAll()
    } catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleRequestMentor = async () => {
    if (!selectedMentorId) return
    try {
      await requestMentorship({ mentorId: selectedMentorId, goals: requestMsg })
      setMessage({ type: 'success', text: 'Request sent!' })
      setSelectedMentorId(null); setRequestMsg('')
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }) }
  }

  const handleRespond = async (id, action) => {
    try { await respondToMentorshipRequest(id, action); loadAll(); setMessage({ type: 'success', text: `Request ${action}d` }) }
    catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleComplete = async (id) => {
    try { await completeMentorship(id); loadAll(); setMessage({ type: 'success', text: 'Mentorship completed!' }) }
    catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleLoadSessions = async (matchId) => {
    try {
      const sessions = await getMentorshipSessions(matchId)
      setMentorship({ sessions })
    } catch { }
  }

  if (mentorship.loading) return <div className="text-center py-10 text-muted">Loading...</div>

  const filteredMentors = mentorship.mentors.filter(m =>
    !searchTerm || m.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) || m.areasOfExpertise?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['profile', 'find', 'mentees', 'mentor'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-navy dark:text-white/70'}`}>
            {t === 'profile' ? 'My Profile' : t === 'find' ? 'Find a Mentor' : t === 'mentees' ? 'My Mentees' : 'My Mentor'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2"><GraduationCap size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Mentorship Profile</h3></div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isMentor} onChange={e => setIsMentor(e.target.checked)} className="rounded" />
              <span className="text-sm font-bold text-navy dark:text-white">I want to be a Mentor</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isMentee} onChange={e => setIsMentee(e.target.checked)} className="rounded" />
              <span className="text-sm font-bold text-navy dark:text-white">I want a Mentor</span>
            </label>
          </div>
          <div>
            <label className="label">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="input w-full" rows={3} placeholder="Tell us about yourself..." />
          </div>
          <div>
            <label className="label">Areas of Expertise</label>
            <input value={expertise} onChange={e => setExpertise(e.target.value)} className="input w-full" placeholder="e.g., React, Leadership, Career Planning" />
          </div>
          <div>
            <label className="label">What are you looking for?</label>
            <textarea value={goals} onChange={e => setGoals(e.target.value)} className="input w-full" rows={2} placeholder="What do you hope to gain from mentorship?" />
          </div>
          {isMentor && (
            <div>
              <label className="label">Max Mentees</label>
              <input type="number" min={1} max={10} value={maxMentees} onChange={e => setMaxMentees(Number(e.target.value))} className="input w-24" />
            </div>
          )}
          <button onClick={handleSaveProfile} className="btn-primary"><UserCheck size={16} /> Save Profile</button>
        </div>
      )}

      {tab === 'find' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Search size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Find a Mentor</h3></div>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or expertise..." className="input w-full mb-4" />
            {filteredMentors.length === 0 ? (
              <p className="text-muted text-sm">No mentors found.</p>
            ) : (
              <div className="space-y-3">
                {filteredMentors.map(m => (
                  <div key={m.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold">
                        {m.employeeName?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-navy dark:text-white text-sm">{m.employeeName}</div>
                        <div className="text-xs text-muted">{m.areasOfExpertise}</div>
                        <div className="text-xs text-muted mt-0.5">{m.bio?.slice(0, 100)}</div>
                      </div>
                      <button onClick={() => setSelectedMentorId(m.employeeId)}
                        className="px-3 py-1.5 rounded-lg bg-moss text-white text-xs font-bold hover:bg-moss-dark">
                        Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedMentorId && (
            <div className="card-surface p-6 space-y-4">
              <h3 className="font-bold text-navy dark:text-white">Send Request</h3>
              <textarea value={requestMsg} onChange={e => setRequestMsg(e.target.value)} className="input w-full" rows={2} placeholder="What would you like to learn?" />
              <div className="flex gap-2">
                <button onClick={handleRequestMentor} className="btn-primary flex-1">Send Request</button>
                <button onClick={() => setSelectedMentorId(null)} className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-navy-dark/60 text-muted font-bold">Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'mentees' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Users size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">My Mentees</h3></div>
            {mentorship.myMentees.length === 0 ? (
              <p className="text-muted text-sm">No mentees yet.</p>
            ) : (
              <div className="space-y-3">
                {mentorship.myMentees.map(m => (
                  <div key={m.id} className="p-4 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-navy dark:text-white text-sm">{m.menteeName}</div>
                        <div className="text-xs text-muted">Status: {m.status} · Started: {m.startDate ? new Date(m.startDate).toLocaleDateString() : 'N/A'}</div>
                        {m.goals && <div className="text-xs text-muted mt-1">Goals: {m.goals}</div>}
                      </div>
                      <div className="flex gap-1">
                        {m.status === 'Pending' && (
                          <>
                            <button onClick={() => handleRespond(m.id, 'approve')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600"><CheckCircle size={16} /></button>
                            <button onClick={() => handleRespond(m.id, 'reject')} className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600"><XCircle size={16} /></button>
                          </>
                        )}
                        {m.status === 'Active' && (
                          <button onClick={() => handleComplete(m.id)} className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-xs font-bold">Complete</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'mentor' && (
        <div className="space-y-4">
          {!mentorship.myMentor ? (
            <div className="card-surface p-6 text-center text-muted">You don't have a mentor assigned yet. Go to "Find a Mentor" to request one.</div>
          ) : (
            <div className="card-surface p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold text-lg">
                  {mentorship.myMentor.mentorName?.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-navy dark:text-white text-lg">{mentorship.myMentor.mentorName}</div>
                  <div className="text-xs text-muted">Mentor since {mentorship.myMentor.startDate ? new Date(mentorship.myMentor.startDate).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
              {mentorship.myMentor.goals && (
                <div>
                  <div className="font-bold text-navy dark:text-white text-sm">Goals</div>
                  <p className="text-sm text-muted mt-1">{mentorship.myMentor.goals}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
