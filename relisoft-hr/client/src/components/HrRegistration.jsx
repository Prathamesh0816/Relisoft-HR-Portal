import { useEffect } from 'react'
import useStore from '../store'
import { createEmployee, loadWorkspace } from '../api'

export default function HrRegistration() {
  const { data, employeeForm, setData, updateForm, toggleTeam, resetForm, setSubmitting, setMessage } = useStore()
  const teams = data.projects.flatMap((p) => p.teams.map((t) => ({ ...t, projectName: p.name })))
  const allRoles = data.roles || []
  const selectedRole = allRoles.find((r) => String(r.id) === String(employeeForm.role))
  const selectedProjects = [...new Set(teams.filter((t) => employeeForm.teamIds.includes(String(t.id))).map((t) => t.projectName))]

  useEffect(() => {
    if (!employeeForm.primaryTeamId && teams.length > 0) {
      updateForm('employeeForm', 'primaryTeamId', String(teams[0].id))
    }
  }, [data.projects])

  const approverName = () => {
    const role = selectedRole
    if (!role) return 'Choose a role'
    if (role.name === 'OrganizationHead') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
    if (role.name === 'HR' || role.name === 'HRL2') return data.employees.find((e) => e.role === 'OrganizationHead')?.fullName || 'No org head found'
    if (role.name === 'Manager' || role.name === 'ManagerL2') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
    const team = teams.find((t) => String(t.id) === String(employeeForm.primaryTeamId))
    if (!team) return 'Choose a primary team'
    if (team.approvalRoute === 'TeamLead') return team.leadName
    if (team.approvalRoute === 'Delegate') return team.approvalDelegateName || team.projectManagerName || team.leadName
    return team.projectManagerName || team.leadName
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (employeeForm.submitting) return
    setSubmitting('employeeForm', true)
    try {
      const baseRoleId = selectedRole?.baseRoleId || employeeForm.role
      const ss = employeeForm.salaryStructure
      const res = await createEmployee({
        employeeCode: employeeForm.employeeCode,
        fullName: employeeForm.fullName,
        email: employeeForm.email,
        department: employeeForm.department,
        designation: employeeForm.designation,
        jobRole: employeeForm.jobRole,
        employmentType: employeeForm.employmentType,
        location: employeeForm.location,
        salaryStructure: ss?.fixedPay ? {
          fixedPay: Number(ss.fixedPay), variablePay: Number(ss.variablePay || 0),
          pf: Number(ss.pf || 0), gratuity: Number(ss.gratuity || 0),
          insurance: Number(ss.insurance || 0), otherDeductions: Number(ss.otherDeductions || 0)
        } : null,
        joinDate: employeeForm.joinDate,
        role: Number(baseRoleId),
        primaryTeamId: Number(employeeForm.primaryTeamId),
        teamIds: employeeForm.teamIds.map(Number)
      })
      const defaults = { employeeCode: '', fullName: '', email: '', department: '', designation: '', jobRole: '', employmentType: 'Full-time', location: '', salaryStructure: { fixedPay: '', variablePay: '', pf: '', gratuity: '', insurance: '', otherDeductions: '' }, joinDate: new Date().toISOString().slice(0, 10), role: 1, primaryTeamId: String(teams[0]?.id || ''), teamIds: [String(teams[0]?.id || '')].filter(Boolean), submitting: false }
      resetForm('employeeForm', defaults)
      setMessage({ type: 'success', text: `${res.message} Username: ${res.loginUsername} | Temporary password: ${res.temporaryPassword}` })
      const fresh = await loadWorkspace()
      setData(fresh)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to register employee.' })
    } finally {
      setSubmitting('employeeForm', false)
    }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">New employee onboarding - part 1</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">This is the HR-owned onboarding stage for official company details, allocations, and system setup.</p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { field: 'employeeCode', label: 'Empcode', placeholder: 'EMP010' },
            { field: 'fullName', label: 'Full name', placeholder: 'Ananya Mehta' },
            { field: 'email', label: 'Official email', placeholder: 'ananya@company.com', type: 'email' },
            { field: 'department', label: 'Department', placeholder: 'Engineering' },
            { field: 'designation', label: 'Designation', placeholder: 'Senior Analyst' },
            { field: 'jobRole', label: 'Job role', placeholder: '.NET Developer' }
          ].map(({ field, label, placeholder, type }) => (
            <div key={field}>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">{label}</label>
              <input type={type || 'text'} value={employeeForm[field]} disabled={employeeForm.submitting} onChange={(e) => updateForm('employeeForm', field, e.target.value)} placeholder={placeholder} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
            </div>
          ))}
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Join date</label>
            <input type="date" value={employeeForm.joinDate} disabled={employeeForm.submitting} onChange={(e) => updateForm('employeeForm', 'joinDate', e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Employment type</label>
            <select value={employeeForm.employmentType} disabled={employeeForm.submitting} onChange={(e) => updateForm('employeeForm', 'employmentType', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
              {['Full-time', 'Contract', 'Intern', 'Consultant'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Location</label>
            <input value={employeeForm.location} disabled={employeeForm.submitting} onChange={(e) => updateForm('employeeForm', 'location', e.target.value)} placeholder="Bengaluru" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">System access</label>
            <select value={employeeForm.role} disabled={employeeForm.submitting} onChange={(e) => updateForm('employeeForm', 'role', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
              {allRoles.map((r) => <option key={r.id} value={r.id}>{r.label || r.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider mb-2 block">Salary structure (₹/annum)</label>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                { field: 'fixedPay', label: 'Fixed pay' },
                { field: 'variablePay', label: 'Variable pay' },
                { field: 'pf', label: 'PF' },
                { field: 'gratuity', label: 'Gratuity' },
                { field: 'insurance', label: 'Insurance' },
                { field: 'otherDeductions', label: 'Other deductions' }
              ].map(({ field, label }) => (
                <div key={field}>
                  <label className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">{label}</label>
                  <input type="number" value={employeeForm.salaryStructure[field]} disabled={employeeForm.submitting} onChange={(e) => updateNestedForm('employeeForm', 'salaryStructure', field, e.target.value)} placeholder="0" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Primary team</label>
            <select value={employeeForm.primaryTeamId} disabled={employeeForm.submitting} onChange={(e) => {
              const teamId = e.target.value
              updateForm('employeeForm', 'primaryTeamId', teamId)
              if (!employeeForm.teamIds.includes(teamId)) toggleTeam(teamId)
            }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
              {teams.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.projectName}</option>)}
            </select>
          </div>
        </div>
        <hr className="border-navy/10 dark:border-white/10" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Projects assignment</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedProjects.length > 0 ? selectedProjects.map((p) => (
                <span key={p} className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">{p}</span>
              )) : <span className="text-xs text-navy/50 dark:text-white/50">Project assignment will appear from selected teams.</span>}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50 dark:bg-amber-900/30/30 dark:bg-amber-900/30">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Default approver</div>
            <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{approverName()}</h3>
            <div className="text-xs text-navy/50 dark:text-white/50 mt-1">After this step, the employee receives part 2 onboarding access.</div>
          </div>
        </div>
        <hr className="border-navy/10 dark:border-white/10" />
        <div className="grid md:grid-cols-2 gap-3">
          {teams.map((team) => (
            <label key={team.id} className={`p-4 rounded-xl border cursor-pointer transition-all ${employeeForm.teamIds.includes(String(team.id)) ? 'border-gold-1 bg-amber-50 dark:bg-amber-900/30/30 dark:bg-amber-900/30' : 'border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]'} ${employeeForm.submitting ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="checkbox" checked={employeeForm.teamIds.includes(String(team.id))} disabled={employeeForm.submitting} onChange={() => toggleTeam(String(team.id))} className="w-4 h-4 rounded border-navy/20 text-gold-1" />
              <strong className="block text-sm text-navy dark:text-white mt-2">{team.name}</strong>
              <span className="text-xs text-navy/50 dark:text-white/50">{team.projectName} - Lead: {team.leadName}</span>
            </label>
          ))}
        </div>
        {employeeForm.submitting && (
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-navy/5 dark:bg-white dark:bg-[var(--bg-secondary)]/5 overflow-hidden relative">
              <div className="absolute inset-0 w-2/4 rounded-full bg-gradient-to-r from-gold-1 to-teal-400 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-navy/50 dark:text-white/50">Completing onboarding and sending invite email...</span>
          </div>
        )}
        <button type="submit" disabled={employeeForm.submitting} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">
          {employeeForm.submitting ? 'Sending invite...' : 'Complete HR onboarding'}
        </button>
      </form>
    </div>
  )
}
