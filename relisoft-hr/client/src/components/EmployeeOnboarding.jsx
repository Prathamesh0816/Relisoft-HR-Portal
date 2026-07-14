import { useEffect, useRef } from 'react'
import useStore from '../store'
import { getOnboardingProfile, saveOnboardingProfile } from '../api'

export default function EmployeeOnboarding() {
  const { data, onboardingForm, currentUser, setOnboardingForm, updateForm, updateExperience, addExperience, removeExperience, setMessage } = useStore()
  const employee = data.employees.find((e) => String(e.id) === String(currentUser?.employeeId))
  const expLetterRefs = useRef({})
  const salarySlipsRef = useRef(null)
  const additionalDocsRef = useRef(null)

  useEffect(() => {
    if (currentUser?.employeeId) {
      getOnboardingProfile(currentUser.employeeId).then((res) => {
        const profile = res.profile || {}
        setOnboardingForm({
          panNumber: profile.panNumber || '',
          aadhaarNumber: profile.aadhaarNumber || '',
          hasPriorExperience: profile.hasPriorExperience !== false,
          experiences: profile.experiences?.length ? profile.experiences.map((e) => ({ ...e, yearsOfExperience: e.yearsOfExperience === null || e.yearsOfExperience === undefined ? '' : String(e.yearsOfExperience) })) : [{ id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }],
          documents: res.documents || []
        })
      })
    }
  }, [currentUser?.employeeId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    fd.append('employeeId', String(currentUser?.employeeId))
    fd.append('panNumber', onboardingForm.panNumber)
    fd.append('aadhaarNumber', onboardingForm.aadhaarNumber)
    fd.append('hasPriorExperience', String(onboardingForm.hasPriorExperience))
    onboardingForm.experiences.forEach((exp, i) => {
      fd.append(`experiences[${i}].id`, exp.id || '')
      fd.append(`experiences[${i}].companyName`, exp.companyName)
      fd.append(`experiences[${i}].jobTitle`, exp.jobTitle)
      fd.append(`experiences[${i}].yearsOfExperience`, exp.yearsOfExperience || '')
      fd.append(`experiences[${i}].relievingEmailForwarded`, String(exp.relievingEmailForwarded))
      const fileInput = expLetterRefs.current[i]
      const file = fileInput?.files?.[0]
      if (file) fd.append(`experiences[${i}].experienceLetter`, file)
    })
    const salaryFiles = salarySlipsRef.current?.files
    if (salaryFiles) Array.from(salaryFiles).forEach((f) => fd.append('salarySlips', f))
    const additionalFiles = additionalDocsRef.current?.files
    if (additionalFiles) Array.from(additionalFiles).forEach((f) => fd.append('additionalDocuments', f))
    try {
      await saveOnboardingProfile(fd)
      setMessage({ type: 'success', text: 'Onboarding profile saved.' })
      if (expLetterRefs.current) Object.values(expLetterRefs.current).forEach((r) => { if (r) r.value = '' })
      if (salarySlipsRef.current) salarySlipsRef.current.value = ''
      if (additionalDocsRef.current) additionalDocsRef.current.value = ''
      const res = await getOnboardingProfile(currentUser?.employeeId)
      const profile = res.profile || {}
      setOnboardingForm({
        panNumber: profile.panNumber || '',
        aadhaarNumber: profile.aadhaarNumber || '',
        hasPriorExperience: profile.hasPriorExperience !== false,
        experiences: profile.experiences?.length ? profile.experiences.map((e) => ({ ...e, yearsOfExperience: e.yearsOfExperience === null || e.yearsOfExperience === undefined ? '' : String(e.yearsOfExperience) })) : [{ id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }],
        documents: res.documents || []
      })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save onboarding profile.' })
    }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Employee onboarding - part 2</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Capture employee-supplied identity details, prior-experience proofs, and onboarding paperwork.</p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Profile owner</div>
            <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{employee?.fullName || 'Signed-in employee'}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {['employeeCode', 'department', 'designation', 'jobRole'].filter((f) => employee?.[f]).map((f) => (
                <span key={f} className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{employee[f]}</span>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">PAN number</label>
            <input value={onboardingForm.panNumber} onChange={(e) => updateForm('onboardingForm', 'panNumber', e.target.value.toUpperCase())} placeholder="ABCDE1234F" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Aadhaar number</label>
            <input value={onboardingForm.aadhaarNumber} onChange={(e) => updateForm('onboardingForm', 'aadhaarNumber', e.target.value)} placeholder="123412341234" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Previous experience</label>
            <label className="mt-1.5 inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer">
              <input type="checkbox" checked={!onboardingForm.hasPriorExperience} onChange={(e) => {
                const hasPrior = !e.target.checked
                setOnboardingForm({ hasPriorExperience: hasPrior, experiences: hasPrior ? onboardingForm.experiences : [{ id: '', companyName: '', jobTitle: '', yearsOfExperience: '', relievingEmailForwarded: false }] })
              }} className="w-5 h-5 rounded border-navy/20 text-gold-1" />
              <span className="text-sm font-semibold text-navy dark:text-white">No previous experience</span>
            </label>
          </div>
        </div>
        {onboardingForm.hasPriorExperience && (
          <>
            <hr className="border-navy/10" />
            <div className="space-y-4">
              {onboardingForm.experiences.map((exp, i) => (
                <div key={exp.id || i} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <strong className="font-bold text-navy dark:text-white">Previous company {i + 1}</strong>
                    {onboardingForm.experiences.length > 1 && (
                      <button type="button" onClick={() => removeExperience(i)} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-red-50 hover:text-red-600">Remove</button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Company name</label>
                      <input value={exp.companyName} onChange={(e) => updateExperience(i, 'companyName', e.target.value)} placeholder="Previous company name" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Job title</label>
                      <input value={exp.jobTitle} onChange={(e) => updateExperience(i, 'jobTitle', e.target.value)} placeholder="Software Engineer" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Years of experience</label>
                      <input type="number" min="0" step="0.1" value={exp.yearsOfExperience} onChange={(e) => updateExperience(i, 'yearsOfExperience', e.target.value)} placeholder="3.5" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                    </div>
                    <div>
                      <label className="mt-5 inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer">
                        <input type="checkbox" checked={exp.relievingEmailForwarded} onChange={(e) => updateExperience(i, 'relievingEmailForwarded', e.target.checked)} className="w-5 h-5 rounded border-navy/20 text-gold-1" />
                        <span className="text-sm font-semibold text-navy dark:text-white">Relieving email forwarded</span>
                      </label>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Experience letter</label>
                      <input ref={(el) => { if (el) expLetterRefs.current[i] = el }} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="mt-1.5 w-full text-sm text-navy/70 dark:text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold-1 file:text-navy-dark hover:file:bg-gold-2" />
                    </div>
                  </div>
                  {onboardingForm.documents.filter((d) => d.documentType === 'Experience Letter' && String(d.employeeOnboardingExperienceId || '') === String(exp.id || '')).map((doc) => (
                    <a key={doc.id} href={`/api/onboarding/documents/${doc.id}`} target="_blank" rel="noreferrer" className="block p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 hover:bg-amber-50">
                      <strong className="text-sm text-navy dark:text-white">Experience letter</strong>
                      <span className="block text-xs text-navy/50 dark:text-white/50 mt-0.5">{doc.originalFileName}</span>
                    </a>
                  ))}
                </div>
              ))}
              <button type="button" onClick={addExperience} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Add another company</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Previous salary slips</label>
                <input ref={salarySlipsRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="mt-1.5 w-full text-sm text-navy/70 dark:text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold-1 file:text-navy-dark hover:file:bg-gold-2" />
              </div>
            </div>
          </>
        )}
        {!onboardingForm.hasPriorExperience && (
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-sm text-navy/50 dark:text-white/50">This employee is marked as a fresher, so prior-experience documents are not required.</div>
          </div>
        )}
        <hr className="border-navy/10" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Additional documents</label>
            <input ref={additionalDocsRef} type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.doc,.docx" className="mt-1.5 w-full text-sm text-navy/70 dark:text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold-1 file:text-navy-dark hover:file:bg-gold-2" />
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Document vault</div>
            <div className="space-y-2 mt-2">
              {onboardingForm.documents.length > 0 ? onboardingForm.documents.map((doc) => (
                <a key={doc.id} href={`/api/onboarding/documents/${doc.id}`} target="_blank" rel="noreferrer" className="block p-2.5 rounded-lg border border-navy/10 dark:border-white/10 bg-amber-50/30 hover:bg-amber-50">
                  <strong className="text-xs text-navy dark:text-white">{doc.experienceCompanyName ? `${doc.documentType} - ${doc.experienceCompanyName}` : doc.documentType}</strong>
                  <span className="block text-[10px] text-navy/50 dark:text-white/50 mt-0.5">{doc.originalFileName}</span>
                </a>
              )) : <div className="text-xs text-navy/50 dark:text-white/50">No onboarding documents uploaded yet.</div>}
            </div>
          </div>
        </div>
        <button type="submit" className="gold-button px-6 py-3 rounded-xl font-bold text-sm">Save onboarding profile</button>
      </form>
    </div>
  )
}
