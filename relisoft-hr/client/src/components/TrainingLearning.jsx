import { useEffect, useState } from 'react'
import useStore from '../store'
import { getTrainingCourses, createTrainingCourse, getMyTrainingRegistrations, registerForTraining, completeTraining, getMyCertifications } from '../api'
import { BookOpen, Users, Clock, Plus, CheckCircle, Award, Search, GraduationCap } from 'lucide-react'

export default function TrainingLearning() {
  const { training, setTraining, setMessage, currentUser } = useStore()
  const isAdmin = currentUser?.role === 'HR' || currentUser?.role === 'HRL2'
  const [tab, setTab] = useState('courses')
  const [courseForm, setCourseForm] = useState({ title: '', category: '', duration: '', mode: 'Online', totalSeats: '' })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [scoreInput, setScoreInput] = useState({})

  useEffect(() => {
    Promise.all([getTrainingCourses(), getMyTrainingRegistrations(), getMyCertifications()]).then(([c, r, cert]) =>
      setTraining({ courses: c.courses || [], registrations: r.registrations || [], certifications: cert.certifications || [], loading: false })
    )
  }, [])

  const refreshAll = async () => {
    const [c, r, cert] = await Promise.all([getTrainingCourses(), getMyTrainingRegistrations(), getMyCertifications()])
    setTraining({ courses: c.courses || [], registrations: r.registrations || [], certifications: cert.certifications || [] })
  }

  const handleRegister = async (courseId) => {
    try { await registerForTraining(courseId); setMessage({ type: 'success', text: 'Registered!' }); refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleComplete = async (id) => {
    const score = scoreInput[id]
    try { await completeTraining(id, score ? Number(score) : undefined); setMessage({ type: 'success', text: 'Training completed!' }); refreshAll() }
    catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    try {
      const res = await createTrainingCourse({ ...courseForm, totalSeats: Number(courseForm.totalSeats) })
      setMessage({ type: 'success', text: res.message || 'Course created.' })
      setCourseForm({ title: '', category: '', duration: '', mode: 'Online', totalSeats: '' })
      setShowCreateForm(false)
      const c = await getTrainingCourses()
      setTraining({ courses: c.courses || [] })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-4">
          <div className="inline-flex gap-1.5 p-1.5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <button onClick={() => setTab('courses')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'courses' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Courses</button>
            <button onClick={() => setTab('registrations')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'registrations' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>My Registrations</button>
            <button onClick={() => setTab('certifications')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'certifications' ? 'bg-gold-1 text-navy-dark' : 'text-navy/50 dark:text-white/50 hover:text-navy dark:hover:text-white'}`}>Certifications</button>
          </div>
        </div>
      </div>

      {tab === 'courses' && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Training Courses</h2>
              <p className="text-muted text-sm mt-1">Browse available courses and register.</p>
            </div>
            {isAdmin && <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary text-xs"><Plus size={14} className="inline mr-1" />{showCreateForm ? 'Cancel' : 'Create Course'}</button>}
          </div>
          {showCreateForm && (
            <form onSubmit={handleCreateCourse} className="grid md:grid-cols-5 gap-3 mb-4 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <input value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} required placeholder="Title" className="input" />
              <input value={courseForm.category} onChange={(e) => setCourseForm((s) => ({ ...s, category: e.target.value }))} required placeholder="Category" className="input" />
              <input value={courseForm.duration} onChange={(e) => setCourseForm((s) => ({ ...s, duration: e.target.value }))} required placeholder="e.g. 2 hours" className="input" />
              <select value={courseForm.mode} onChange={(e) => setCourseForm((s) => ({ ...s, mode: e.target.value }))} className="input">
                <option value="Online">Online</option>
                <option value="In-Person">In-Person</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <input type="number" min={1} value={courseForm.totalSeats} onChange={(e) => setCourseForm((s) => ({ ...s, totalSeats: e.target.value }))} required placeholder="Seats" className="input" />
              <button type="submit" className="btn-primary col-span-full"><Plus size={16} /> Create Course</button>
            </form>
          )}
          {training.courses.length === 0 ? (
            <p className="text-muted text-sm">No courses available.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {training.courses.map((c) => (
                <div key={c.id} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center mb-3">
                    <BookOpen size={22} className="text-navy-dark" />
                  </div>
                  <h3 className="font-bold text-navy dark:text-white text-sm">{c.title}</h3>
                  <div className="text-xs text-muted mt-1 space-y-1">
                    <div><Clock size={12} className="inline mr-1" />{c.duration}</div>
                    <div><GraduationCap size={12} className="inline mr-1" />{c.category}</div>
                    <div><Users size={12} className="inline mr-1" />{c.mode} · {c.availableSeats ?? c.totalSeats} seats</div>
                  </div>
                  <button onClick={() => handleRegister(c.id)} className="mt-auto btn-primary text-xs py-2 mt-3">Register</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'registrations' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Registrations</h2>
          <p className="text-muted text-sm mb-4">Track your training registrations.</p>
          {training.registrations.length === 0 ? (
            <p className="text-muted text-sm">No registrations yet.</p>
          ) : (
            <div className="space-y-3">
              {training.registrations.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{r.courseTitle}</div>
                    <div className="text-xs text-muted mt-1">Registered: {new Date(r.createdOn).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : r.status === 'Approved' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{r.status}</span>
                    {r.status === 'Approved' && (
                      <div className="flex gap-1">
                        <input type="number" min={0} max={100} value={scoreInput[r.id] || ''} onChange={(e) => setScoreInput((s) => ({ ...s, [r.id]: e.target.value }))} placeholder="Score" className="input w-16 text-xs" />
                        <button onClick={() => handleComplete(r.id)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100"><CheckCircle size={14} className="inline mr-1" />Complete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'certifications' && (
        <div className="card-surface p-6">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">My Certifications</h2>
          <p className="text-muted text-sm mb-4">Completed courses and certifications.</p>
          {training.certifications.length === 0 ? (
            <p className="text-muted text-sm">No certifications yet.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {training.certifications.map((c) => (
                <div key={c.id} className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10 flex flex-col items-center text-center">
                  <Award size={36} className="text-emerald-600 mb-2" />
                  <h3 className="font-bold text-navy dark:text-white text-sm">{c.courseTitle}</h3>
                  <div className="text-xs text-muted mt-1">Score: {c.score || 'N/A'}</div>
                  <div className="text-xs text-muted">{new Date(c.completedOn).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
