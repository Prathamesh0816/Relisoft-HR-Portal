import { useState } from 'react'
import useStore from '../store'
import { submitCandidateForm } from '../api'

export default function CandidateOnboarding() {
  const { setMessage } = useStore()
  const [form, setForm] = useState({
    fullName: '', email: '', department: '', designation: '', jobRole: '',
    location: '', joinDate: '', panNumber: '', aadhaarNumber: '', hasPriorExperience: false
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (f, v) => setForm((s) => ({ ...s, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await submitCandidateForm(form)
      setMessage({ type: 'success', text: res.message })
      setForm({ fullName: '', email: '', department: '', designation: '', jobRole: '', location: '', joinDate: '', panNumber: '', aadhaarNumber: '', hasPriorExperience: false })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Submission failed.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Candidate onboarding form</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Fill in your details to begin the onboarding process. HR will review and activate your account.</p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Full name *</label>
            <input required value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="input w-full" placeholder="e.g. John Doe" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Email *</label>
            <input required type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input w-full" placeholder="e.g. john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Department</label>
            <input value={form.department} onChange={(e) => handleChange('department', e.target.value)} className="input w-full" placeholder="e.g. Engineering" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Designation</label>
            <input value={form.designation} onChange={(e) => handleChange('designation', e.target.value)} className="input w-full" placeholder="e.g. Software Engineer" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Job role</label>
            <input value={form.jobRole} onChange={(e) => handleChange('jobRole', e.target.value)} className="input w-full" placeholder="e.g. Frontend Developer" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Location</label>
            <input value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="input w-full" placeholder="e.g. Mumbai" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Join date *</label>
            <input required type="date" value={form.joinDate} onChange={(e) => handleChange('joinDate', e.target.value)} className="input w-full" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">PAN number</label>
            <input value={form.panNumber} onChange={(e) => handleChange('panNumber', e.target.value)} className="input w-full" placeholder="e.g. ABCDE1234F" />
          </div>
          <div>
            <label className="block text-xs font-bold text-navy/70 dark:text-white/70 mb-1">Aadhaar number</label>
            <input value={form.aadhaarNumber} onChange={(e) => handleChange('aadhaarNumber', e.target.value)} className="input w-full" placeholder="e.g. 1234 5678 9012" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" id="priorExp" checked={form.hasPriorExperience} onChange={(e) => handleChange('hasPriorExperience', e.target.checked)} className="w-4 h-4 rounded border-navy/20 accent-gold-1" />
            <label htmlFor="priorExp" className="text-xs font-bold text-navy/70 dark:text-white/70">Has prior work experience</label>
          </div>
        </div>
        <button type="submit" disabled={submitting} className="btn-primary w-full md:w-auto">{submitting ? 'Submitting...' : 'Submit for HR review'}</button>
      </form>
    </div>
  )
}
