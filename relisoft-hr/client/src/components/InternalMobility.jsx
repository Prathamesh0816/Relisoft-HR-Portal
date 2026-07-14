import { useEffect, useState } from 'react'
import useStore from '../store'
import { getInternalJobs, createInternalJob, updateInternalJob, closeInternalJob, getMyJobApplications, applyForInternalJob, getAllJobApplications, shortlistJobApplication, rejectJobApplication } from '../api'
import { Briefcase, Plus, Edit3, CheckCircle, X, Search, Send, FileText, Users } from 'lucide-react'

function statusBadge(status) {
  const s = (status || '').toLowerCase()
  if (s === 'shortlisted' || s === 'approved') return 'bg-emerald-50 text-emerald-700'
  if (s === 'rejected' || s === 'closed') return 'bg-red-50 text-red-600'
  return 'bg-amber-50 text-amber-700'
}

export default function InternalMobility() {
  const { internalMobility, setInternalMobility, setMessage, currentUser } = useStore()
  const isHr = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('jobs')
  const [jobForm, setJobForm] = useState({ title: '', department: '', location: '', description: '', requirements: '' })
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJobId, setEditingJobId] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [applyingTo, setApplyingTo] = useState(null)

  useEffect(() => {
    Promise.all([getInternalJobs(), getMyJobApplications()]).then(([j, a]) =>
      setInternalMobility({ jobs: j.jobs || [], myApplications: a.applications || [], loading: false })
    )
    if (isHr) getAllJobApplications().then((r) => setInternalMobility({ allApplications: r.applications || [] }))
  }, [])

  const refreshAll = async () => {
    const [j, a] = await Promise.all([getInternalJobs(), getMyJobApplications()])
    setInternalMobility({ jobs: j.jobs || [], myApplications: a.applications || [] })
    if (isHr) { const r = await getAllJobApplications(); setInternalMobility({ allApplications: r.applications || [] }) }
  }

  const handleSaveJob = async (e) => {
    e.preventDefault()
    try {
      if (editingJobId) {
        await updateInternalJob(editingJobId, jobForm)
        setMessage({ type: 'success', text: 'Job updated.' })
      } else {
        await createInternalJob(jobForm)
        setMessage({ type: 'success', text: 'Job created.' })
      }
      setJobForm({ title: '', department: '', location: '', description: '', requirements: '' })
      setEditingJobId(null)
      setShowJobForm(false)
      const j = await getInternalJobs()
      setInternalMobility({ jobs: j.jobs || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleApply = async (jobId) => {
    if (!coverNote.trim()) return
    try { await applyForInternalJob(jobId, coverNote); setMessage({ type: 'success', text: 'Application submitted.' }); setApplyingTo(null); setCoverNote(''); refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleShortlist = async (id) => {
    try { await shortlistJobApplication(id); setMessage({ type: 'success', text: 'Shortlisted.' }); const r = await getAllJobApplications(); setInternalMobility({ allApplications: r.applications || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const handleReject = async (id) => {
    try { await rejectJobApplication(id); setMessage({ type: 'success', text: 'Rejected.' }); const r = await getAllJobApplications(); setInternalMobility({ allApplications: r.applications || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const handleClose = async (id) => {
    try { await closeInternalJob(id); setMessage({ type: 'success', text: 'Job closed.' }); const j = await getInternalJobs(); setInternalMobility({ jobs: j.jobs || [] }) }
    catch { setMessage({ type: 'error', text: 'Failed.' }) }
  }

  const editJob = (job) => {
    setJobForm({ title: job.title, department: job.department, location: job.location || '', description: job.description || '', requirements: job.requirements || '' })
    setEditingJobId(job.id)
    setShowJobForm(true)
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('jobs')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'jobs' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Job Postings</button>
            <button onClick={() => setTab('my')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'my' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Applications</button>
            {isHr && <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'all' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>All Applications</button>}
          </div>
        </div>
      </div>

      {tab === 'jobs' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Internal Job Postings</h2>
              <p className="text-muted text-sm mt-1">Explore opportunities within the organization.</p>
            </div>
            {isHr && <button onClick={() => { setShowJobForm(!showJobForm); if (!showJobForm) { setJobForm({ title: '', department: '', location: '', description: '', requirements: '' }); setEditingJobId(null) } }} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />{showJobForm ? 'Cancel' : 'Create Job'}</button>}
          </div>
          {showJobForm && (
            <form onSubmit={handleSaveJob} className="grid md:grid-cols-2 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input value={jobForm.title} onChange={(e) => setJobForm((s) => ({ ...s, title: e.target.value }))} required placeholder="Job title" className="input" />
              <input value={jobForm.department} onChange={(e) => setJobForm((s) => ({ ...s, department: e.target.value }))} required placeholder="Department" className="input" />
              <input value={jobForm.location} onChange={(e) => setJobForm((s) => ({ ...s, location: e.target.value }))} placeholder="Location" className="input" />
              <div className="flex gap-2 items-end">
                <button type="submit" className="btn-primary text-xs">{editingJobId ? <Edit3 size={14} className="inline mr-1" /> : <Plus size={14} className="inline mr-1" />}{editingJobId ? 'Update' : 'Create'}</button>
              </div>
              <textarea value={jobForm.description} onChange={(e) => setJobForm((s) => ({ ...s, description: e.target.value }))} rows={3} placeholder="Description" className="input col-span-full" />
              <textarea value={jobForm.requirements} onChange={(e) => setJobForm((s) => ({ ...s, requirements: e.target.value }))} rows={3} placeholder="Requirements" className="input col-span-full" />
            </form>
          )}
          {internalMobility.jobs.length === 0 ? (
            <p className="text-muted text-sm">No job postings available.</p>
          ) : (
            <div className="space-y-3">
              {internalMobility.jobs.map((j) => (
                <div key={j.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-navy dark:text-white text-sm">{j.title}</div>
                      <div className="text-xs text-muted mt-1">{j.department} · {j.location || 'N/A'}</div>
                      {j.description && <div className="text-xs text-muted mt-1">{j.description.slice(0, 200)}</div>}
                      {j.requirements && <div className="text-xs text-muted mt-1">Requirements: {j.requirements.slice(0, 200)}</div>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${j.status === 'Open' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{j.status}</span>
                      {j.status === 'Open' && (
                        <>
                          <button onClick={() => { setApplyingTo(j.id); setCoverNote('') }} className="btn-primary text-xs"><Send size={14} className="inline mr-1" />Apply</button>
                          {isHr && <button onClick={() => editJob(j)} className="p-2 rounded-xl border border-navy/10 text-muted hover:bg-navy/5"><Edit3 size={14} /></button>}
                          {isHr && <button onClick={() => handleClose(j.id)} className="p-2 rounded-xl bg-red-50 text-red-600"><X size={14} /></button>}
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

      {applyingTo && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Apply with Cover Note</h2>
          <p className="text-muted text-sm mb-4">Explain why you're a good fit for this role.</p>
          <textarea value={coverNote} onChange={(e) => setCoverNote(e.target.value)} rows={4} className="input w-full" placeholder="Your cover note..." />
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleApply(applyingTo)} className="btn-primary"><Send size={16} /> Submit Application</button>
            <button onClick={() => setApplyingTo(null)} className="px-4 py-2 rounded-xl border border-navy/10 text-muted font-bold">Cancel</button>
          </div>
        </div>
      )}

      {tab === 'my' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Applications</h2>
          <p className="text-muted text-sm mb-4">Track your internal job applications.</p>
          {internalMobility.myApplications.length === 0 ? (
            <p className="text-muted text-sm">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {internalMobility.myApplications.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{a.jobTitle}</div>
                    <div className="text-xs text-muted mt-1">{a.department} · Applied: {new Date(a.createdOn).toLocaleDateString()}</div>
                    {a.coverNote && <div className="text-xs text-muted mt-1">Note: {a.coverNote.slice(0, 100)}</div>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'all' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">All Applications</h2>
          <p className="text-muted text-sm mb-4">Review applications for your job postings.</p>
          {internalMobility.allApplications.length === 0 ? (
            <p className="text-muted text-sm">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {internalMobility.allApplications.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-navy dark:text-white text-sm">{a.employeeName} · {a.jobTitle}</div>
                      <div className="text-xs text-muted mt-1">{a.department} · Applied: {new Date(a.createdOn).toLocaleDateString()}</div>
                      {a.coverNote && <div className="text-xs text-muted mt-1">Note: {a.coverNote.slice(0, 150)}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge(a.status)}`}>{a.status}</span>
                      {a.status === 'Pending' && (
                        <>
                          <button onClick={() => handleShortlist(a.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Shortlist</button>
                          <button onClick={() => handleReject(a.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100"><X size={14} className="inline mr-1" />Reject</button>
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
