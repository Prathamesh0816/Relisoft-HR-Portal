import { useState, useEffect } from 'react'
import useStore from '../store'
import {
  getJobPostings, createJobPosting, closeJobPosting,
  getRecruitmentCandidates, createCandidate, setCandidateStage,
  getInterviews, createInterview, updateInterview,
  getOffers, createOffer, setOfferStatus,
  loadWorkspace
} from '../api'
import { Briefcase, Users, CalendarClock, FileCheck2, Plus, X, ChevronRight } from 'lucide-react'

const HR_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin']
const MANAGER_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin', 'Manager', 'ManagerL2', 'OrganizationHead']

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Intern']

export default function Recruitment() {
  const { currentUser, data, setData, setMessage } = useStore()
  const isHr = HR_ROLES.includes(currentUser?.role)
  const isManager = MANAGER_ROLES.includes(currentUser?.role)

  const [tab, setTab] = useState('jobs')
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [interviews, setInterviews] = useState([])
  const [offers, setOffers] = useState([])

  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', employmentType: 'Full-time', experienceRequired: '', openings: 1, description: '' })
  const [showJobForm, setShowJobForm] = useState(false)
  const [applyForm, setApplyForm] = useState({ jobId: '', fullName: '', email: '', phone: '', resumeSummary: '', source: 'Portal' })
  const [showApply, setShowApply] = useState(false)
  const [intForm, setIntForm] = useState({ candidateId: '', interviewerEmployeeId: '', scheduledAt: '', mode: 'Video', round: 'Screening' })
  const [offerForm, setOfferForm] = useState({ candidateId: '', position: '', offeredSalary: '', notes: '' })

  const loadAll = async () => {
    try {
      const [js, cs, ins, ofs, ws] = await Promise.all([
        getJobPostings(), getRecruitmentCandidates(), getInterviews(), getOffers(), loadWorkspace()
      ])
      setJobs(js); setCandidates(cs); setInterviews(ins); setOffers(ofs)
      if (ws) setData(ws)
    } catch {}
  }

  useEffect(() => { loadAll() }, [])

  const employees = data.employees || []

  const handleCreateJob = async (e) => {
    e.preventDefault()
    try {
      const res = await createJobPosting(jobForm)
      setMessage({ type: 'success', text: res.message || 'Job posting created.' })
      setJobForm({ title: '', department: '', location: '', employmentType: 'Full-time', experienceRequired: '', openings: 1, description: '' })
      setShowJobForm(false)
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create job.' })
    }
  }

  const handleCloseJob = async (id) => {
    try {
      const res = await closeJobPosting(id)
      setMessage({ type: 'success', text: res.message || 'Job closed.' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleApply = async (e) => {
    e.preventDefault()
    try {
      const res = await createCandidate(applyForm)
      setMessage({ type: 'success', text: res.message || 'Application received.' })
      setApplyForm({ jobId: '', fullName: '', email: '', phone: '', resumeSummary: '', source: 'Portal' })
      setShowApply(false)
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to apply.' })
    }
  }

  const handleStage = async (id, stage) => {
    try {
      const res = await setCandidateStage(id, stage)
      setMessage({ type: 'success', text: res.message || 'Stage updated.' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleCreateInterview = async (e) => {
    e.preventDefault()
    try {
      const res = await createInterview(intForm)
      setMessage({ type: 'success', text: res.message || 'Interview scheduled.' })
      setIntForm({ candidateId: '', interviewerEmployeeId: '', scheduledAt: '', mode: 'Video', round: 'Screening' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to schedule.' }) }
  }

  const handleInterviewUpdate = async (id, updates) => {
    try {
      const res = await updateInterview(id, updates)
      setMessage({ type: 'success', text: res.message || 'Interview updated.' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleCreateOffer = async (e) => {
    e.preventDefault()
    try {
      const res = await createOffer({ ...offerForm, offeredSalary: Number(offerForm.offeredSalary) || 0 })
      setMessage({ type: 'success', text: res.message || 'Offer created.' })
      setOfferForm({ candidateId: '', position: '', offeredSalary: '', notes: '' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create offer.' }) }
  }

  const handleOfferStatus = async (id, status) => {
    try {
      const res = await setOfferStatus(id, status)
      setMessage({ type: 'success', text: res.message || 'Offer updated.' })
      loadAll()
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const stageBadge = (stage) => {
    const colors = {
      Applied: 'bg-sky-50 text-sky-700',
      Shortlisted: 'bg-violet-50 text-violet-700',
      Interview: 'bg-amber-50 text-amber-700',
      Offered: 'bg-gold-1/10 text-gold-1',
      Hired: 'bg-emerald-50 text-emerald-700',
      Rejected: 'bg-red-50 text-red-700'
    }
    return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${colors[stage] || 'bg-navy/10 text-navy/60'}`}>{stage}</span>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {[
          { id: 'jobs', label: 'Jobs', icon: Briefcase },
          { id: 'candidates', label: 'Candidates', icon: Users },
          { id: 'interviews', label: 'Interviews', icon: CalendarClock },
          { id: 'offers', label: 'Offers', icon: FileCheck2 }
        ].map((t) => (isManager || t.id === 'jobs') && (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1.5 ${tab === t.id ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'jobs' && (
        <div className="space-y-4">
          <div className="card-surface p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-navy dark:text-white">Job Postings</h3>
                <p className="text-xs text-muted mt-0.5">Open positions across the organization.</p>
              </div>
              {isHr && (
                <button onClick={() => setShowJobForm(!showJobForm)} className="btn-primary text-xs">
                  <Plus size={14} className="inline mr-1" /> {showJobForm ? 'Close' : 'Post Job'}
                </button>
              )}
            </div>

            {showJobForm && isHr && (
              <form onSubmit={handleCreateJob} className="grid md:grid-cols-3 gap-3 mb-5 p-4 rounded-xl border border-navy/10 dark:border-white/10">
                <input value={jobForm.title} onChange={(e) => setJobForm((s) => ({ ...s, title: e.target.value }))} required placeholder="Job title *" className="input" />
                <input value={jobForm.department} onChange={(e) => setJobForm((s) => ({ ...s, department: e.target.value }))} required placeholder="Department *" className="input" />
                <input value={jobForm.location} onChange={(e) => setJobForm((s) => ({ ...s, location: e.target.value }))} placeholder="Location" className="input" />
                <select value={jobForm.employmentType} onChange={(e) => setJobForm((s) => ({ ...s, employmentType: e.target.value }))} className="input">
                  {EMPLOYMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <input value={jobForm.experienceRequired} onChange={(e) => setJobForm((s) => ({ ...s, experienceRequired: e.target.value }))} placeholder="Experience (e.g. 3-5 years)" className="input" />
                <input type="number" min="1" value={jobForm.openings} onChange={(e) => setJobForm((s) => ({ ...s, openings: e.target.value }))} placeholder="Openings" className="input" />
                <textarea value={jobForm.description} onChange={(e) => setJobForm((s) => ({ ...s, description: e.target.value }))} rows={3} placeholder="Job description" className="input col-span-full" />
                <button type="submit" className="btn-primary text-xs col-span-full">Post Job</button>
              </form>
            )}

            {jobs.length === 0 ? (
              <p className="text-sm text-muted">No job postings yet.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((j) => (
                  <div key={j.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-navy dark:text-white">{j.title}</h4>
                        {j.status === 'Open'
                          ? <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Open</span>
                          : <span className="px-2 py-0.5 rounded-full bg-navy/10 text-navy/60 text-[10px] font-bold">Closed</span>}
                      </div>
                      <p className="text-xs text-muted mt-1">{j.department} · {j.location || 'Remote'} · {j.employmentType}{j.experienceRequired ? ` · ${j.experienceRequired}` : ''}</p>
                      <p className="text-xs text-muted mt-1">Openings: {j.openings} · Candidates: {j.candidateCount} · Hired: {j.hiredCount}</p>
                      {j.description && <p className="text-xs text-muted mt-2 line-clamp-2">{j.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {j.status === 'Open' && (
                        <button onClick={() => { setApplyForm((s) => ({ ...s, jobId: j.id })); setShowApply(true) }} className="btn-primary text-xs py-1.5">Apply</button>
                      )}
                      {isHr && j.status === 'Open' && (
                        <button onClick={() => handleCloseJob(j.id)} className="text-xs font-bold text-red-400 hover:text-red-600">Close</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {showApply && (
            <div className="card-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-navy dark:text-white">Apply for {jobs.find((j) => j.id === Number(applyForm.jobId))?.title || 'position'}</h3>
                <button onClick={() => setShowApply(false)} className="text-muted hover:text-navy"><X size={16} /></button>
              </div>
              <form onSubmit={handleApply} className="grid md:grid-cols-2 gap-3">
                <input value={applyForm.fullName} onChange={(e) => setApplyForm((s) => ({ ...s, fullName: e.target.value }))} required placeholder="Full name *" className="input" />
                <input type="email" value={applyForm.email} onChange={(e) => setApplyForm((s) => ({ ...s, email: e.target.value }))} required placeholder="Email *" className="input" />
                <input value={applyForm.phone} onChange={(e) => setApplyForm((s) => ({ ...s, phone: e.target.value }))} placeholder="Phone" className="input" />
                <select value={applyForm.source} onChange={(e) => setApplyForm((s) => ({ ...s, source: e.target.value }))} className="input">
                  {['Portal', 'Referral', 'LinkedIn', 'Walk-in', 'Internal'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <textarea value={applyForm.resumeSummary} onChange={(e) => setApplyForm((s) => ({ ...s, resumeSummary: e.target.value }))} rows={3} placeholder="Resume summary / why you're a fit" className="input col-span-full" />
                <button type="submit" className="btn-primary text-xs col-span-full">Submit Application</button>
              </form>
            </div>
          )}
        </div>
      )}

      {tab === 'candidates' && isManager && (
        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Candidate Pipeline</h3>
          <p className="text-xs text-muted mb-4">Move candidates through the hiring stages.</p>
          {candidates.length === 0 ? (
            <p className="text-sm text-muted">No candidates yet.</p>
          ) : (
            <div className="space-y-3">
              {candidates.map((c) => (
                <div key={c.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-navy dark:text-white text-sm">{c.fullName}</h4>
                      {stageBadge(c.stage)}
                    </div>
                    <p className="text-xs text-muted mt-1">{c.jobTitle} · {c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
                    <p className="text-xs text-muted mt-0.5">Source: {c.source || 'Portal'} · Applied {new Date(c.createdOn).toLocaleDateString()} · {c.interviewCount} interview(s)</p>
                    {c.resumeSummary && <p className="text-xs text-muted mt-1">{c.resumeSummary}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {c.stage === 'Applied' && (
                      <>
                        <button onClick={() => handleStage(c.id, 'Shortlisted')} className="btn-primary text-xs py-1.5">Shortlist</button>
                        <button onClick={() => handleStage(c.id, 'Rejected')} className="text-xs font-bold text-red-400 hover:text-red-600">Reject</button>
                      </>
                    )}
                    {c.stage === 'Shortlisted' && (
                      <>
                        <button onClick={() => handleStage(c.id, 'Interview')} className="btn-primary text-xs py-1.5">Move to Interview</button>
                        <button onClick={() => handleStage(c.id, 'Rejected')} className="text-xs font-bold text-red-400 hover:text-red-600">Reject</button>
                      </>
                    )}
                    {c.stage === 'Interview' && (
                      <button onClick={() => { setOfferForm((s) => ({ ...s, candidateId: c.id, position: c.jobTitle })); setTab('offers') }} className="btn-primary text-xs py-1.5">Offer <ChevronRight size={12} /></button>
                    )}
                    {c.stage === 'Offered' && <span className="text-xs font-bold text-gold-1">Offer sent</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'interviews' && isManager && (
        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Schedule Interview</h3>
            <form onSubmit={handleCreateInterview} className="grid md:grid-cols-3 gap-3 mt-3">
              <select value={intForm.candidateId} onChange={(e) => setIntForm((s) => ({ ...s, candidateId: e.target.value }))} required className="input">
                <option value="">Candidate *</option>
                {candidates.filter((c) => c.stage === 'Shortlisted' || c.stage === 'Interview' || c.stage === 'Applied').map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName} — {c.jobTitle}</option>
                ))}
              </select>
              <select value={intForm.interviewerEmployeeId} onChange={(e) => setIntForm((s) => ({ ...s, interviewerEmployeeId: e.target.value }))} required className="input">
                <option value="">Interviewer *</option>
                {employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} — {e.designation}</option>)}
              </select>
              <input type="datetime-local" value={intForm.scheduledAt} onChange={(e) => setIntForm((s) => ({ ...s, scheduledAt: e.target.value }))} required className="input" />
              <select value={intForm.mode} onChange={(e) => setIntForm((s) => ({ ...s, mode: e.target.value }))} className="input">
                {['Video', 'In-person', 'Phone'].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={intForm.round} onChange={(e) => setIntForm((s) => ({ ...s, round: e.target.value }))} className="input">
                {['Screening', 'Technical', 'Managerial', 'HR', 'Final'].map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" className="btn-primary text-xs">Schedule</button>
            </form>
          </div>

          <div className="card-surface p-5">
            <h3 className="font-heading font-bold text-navy dark:text-white mb-4">Upcoming & Past Interviews</h3>
            {interviews.length === 0 ? (
              <p className="text-sm text-muted">No interviews scheduled.</p>
            ) : (
              <div className="space-y-3">
                {interviews.map((i) => (
                  <InterviewRow key={i.id} interview={i} onUpdate={handleInterviewUpdate} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'offers' && isHr && (
        <div className="space-y-4">
          <div className="card-surface p-5">
            <h3 className="font-heading font-bold text-navy dark:text-white mb-1">Create Offer</h3>
            <form onSubmit={handleCreateOffer} className="grid md:grid-cols-2 gap-3 mt-3">
              <select value={offerForm.candidateId} onChange={(e) => setOfferForm((s) => ({ ...s, candidateId: e.target.value }))} required className="input">
                <option value="">Candidate *</option>
                {candidates.filter((c) => c.stage === 'Interview' || c.stage === 'Offered').map((c) => (
                  <option key={c.id} value={c.id}>{c.fullName} — {c.jobTitle}</option>
                ))}
              </select>
              <input value={offerForm.position} onChange={(e) => setOfferForm((s) => ({ ...s, position: e.target.value }))} placeholder="Position / title *" className="input" />
              <input type="number" min="0" step="0.01" value={offerForm.offeredSalary} onChange={(e) => setOfferForm((s) => ({ ...s, offeredSalary: e.target.value }))} placeholder="Offered CTC / salary" className="input" />
              <textarea value={offerForm.notes} onChange={(e) => setOfferForm((s) => ({ ...s, notes: e.target.value }))} rows={2} placeholder="Notes (joining date, perks...)" className="input" />
              <button type="submit" className="btn-primary text-xs">Send Offer</button>
            </form>
          </div>

          <div className="card-surface p-5">
            <h3 className="font-heading font-bold text-navy dark:text-white mb-4">Offers</h3>
            {offers.length === 0 ? (
              <p className="text-sm text-muted">No offers yet.</p>
            ) : (
              <div className="space-y-3">
                {offers.map((o) => (
                  <div key={o.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 flex flex-col md:flex-row md:items-center gap-3 justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-navy dark:text-white text-sm">{o.candidateName}</h4>
                        {stageBadge(o.status === 'Joined' ? 'Hired' : o.status === 'Accepted' ? 'Hired' : o.status)}
                      </div>
                      <p className="text-xs text-muted mt-1">{o.position} · {o.jobTitle}</p>
                      <p className="text-xs text-muted mt-0.5">Offered ₹{Number(o.offeredSalary).toLocaleString()} · {new Date(o.offeredOn).toLocaleDateString()}</p>
                      {o.notes && <p className="text-xs text-muted mt-1">{o.notes}</p>}
                    </div>
                    {o.status === 'Sent' && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => handleOfferStatus(o.id, 'Accepted')} className="btn-primary text-xs py-1.5">Accepted</button>
                        <button onClick={() => handleOfferStatus(o.id, 'Declined')} className="text-xs font-bold text-red-400 hover:text-red-600">Declined</button>
                      </div>
                    )}
                    {o.status === 'Accepted' && (
                      <button onClick={() => handleOfferStatus(o.id, 'Joined')} className="btn-primary text-xs py-1.5">Mark Joined</button>
                    )}
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

function InterviewRow({ interview: i, onUpdate }) {
  const [feedback, setFeedback] = useState(i.feedback || '')
  const [rating, setRating] = useState(i.rating || 0)
  const [status, setStatus] = useState(i.status || 'Scheduled')

  return (
    <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-navy dark:text-white text-sm">{i.candidateName}</h4>
            <span className="px-2 py-0.5 rounded-full bg-navy/10 text-navy/60 text-[10px] font-bold">{i.round}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${i.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : i.status === 'Cancelled' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{i.status}</span>
          </div>
          <p className="text-xs text-muted mt-1">{i.jobTitle} · {i.interviewerName} · {i.mode}</p>
          <p className="text-xs text-muted mt-0.5">{new Date(i.scheduledAt).toLocaleString()}</p>
        </div>
        {i.status !== 'Completed' && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input text-xs py-1.5 w-auto">
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-show">No-show</option>
            </select>
            <button onClick={() => onUpdate(i.id, { status })} className="btn-primary text-xs py-1.5">Save</button>
          </div>
        )}
      </div>
      {i.status === 'Completed' && (
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="Feedback" className="input col-span-2" />
          <div className="flex items-center gap-2">
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input text-xs py-1.5 flex-1">
              <option value={0}>Rating</option>
              {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{'★'.repeat(r)}</option>)}
            </select>
            <button onClick={() => onUpdate(i.id, { feedback, rating })} className="btn-primary text-xs py-1.5">Update</button>
          </div>
        </div>
      )}
    </div>
  )
}