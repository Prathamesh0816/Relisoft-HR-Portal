import { useEffect } from 'react'
import useStore from '../store'
import { createEmployee, loadWorkspace } from '../api'

export default function HrRegistration() {
  const { data, employeeForm, setData, updateForm, updateNestedForm, toggleTeam, toggleProjectMembership, resetForm, setSubmitting, setMessage } = useStore()
  const teams = data.projects.flatMap((p) => p.teams.map((t) => ({ ...t, projectName: p.name })))
  const allRoles = data.roles || []
  const selectedRole = allRoles.find((r) => String(r.id) === String(employeeForm.role))
  useEffect(() => {
    const firstProject = data.projects[0]
    if (!employeeForm.primaryProjectId && firstProject) {
      updateForm('employeeForm', 'primaryProjectId', String(firstProject.id))
      if (!employeeForm.projectIds.includes(String(firstProject.id))) toggleProjectMembership(String(firstProject.id))
    }
    const primaryProjectId = employeeForm.primaryProjectId || String(firstProject?.id || '')
    const firstTeam = teams.find((team) => String(team.projectId) === String(primaryProjectId))
    if (!employeeForm.primaryTeamId && firstTeam) {
      updateForm('employeeForm', 'primaryTeamId', String(firstTeam.id))
      if (!employeeForm.teamIds.includes(String(firstTeam.id))) toggleTeam(String(firstTeam.id))
    }
  }, [data.projects, employeeForm.primaryProjectId, employeeForm.primaryTeamId, employeeForm.projectIds, employeeForm.teamIds, teams, toggleProjectMembership, toggleTeam, updateForm])

  const setPrimaryProject = (projectId) => {
    updateForm('employeeForm', 'primaryProjectId', projectId)
    if (!employeeForm.projectIds.includes(projectId)) toggleProjectMembership(projectId)
    const projectTeams = teams.filter((team) => String(team.projectId) === projectId)
    const primaryTeam = projectTeams.find((team) => employeeForm.teamIds.includes(String(team.id))) || projectTeams[0]
    const primaryTeamId = String(primaryTeam?.id || '')
    updateForm('employeeForm', 'primaryTeamId', primaryTeamId)
    if (primaryTeamId && !employeeForm.teamIds.includes(primaryTeamId)) toggleTeam(primaryTeamId)
  }

  const toggleProject = (project) => {
    const projectId = String(project.id)
    if (projectId === employeeForm.primaryProjectId) return
    const selected = employeeForm.projectIds.includes(projectId)
    toggleProjectMembership(projectId)
    if (selected) {
      const teamIds = new Set(project.teams.map((team) => String(team.id)))
      updateForm('employeeForm', 'teamIds', employeeForm.teamIds.filter((teamId) => !teamIds.has(teamId)))
    }
  }

  const toggleTeamMembership = (team) => {
    const teamId = String(team.id)
    if (teamId === employeeForm.primaryTeamId) return
    if (!employeeForm.teamIds.includes(teamId) && !employeeForm.projectIds.includes(String(team.projectId))) {
      toggleProjectMembership(String(team.projectId))
    }
    toggleTeam(teamId)
  }

  const approverName = () => {
    const role = selectedRole
    if (!role) return 'Choose a role'
    if (role.name === 'OrganizationHead') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
    if (role.name === 'HR' || role.name === 'HRL2') return data.employees.find((e) => e.role === 'OrganizationHead')?.fullName || 'No org head found'
    if (role.name === 'Manager' || role.name === 'ManagerL2') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
    const project = data.projects.find((item) => String(item.id) === String(employeeForm.primaryProjectId))
    const team = teams.find((item) => String(item.id) === String(employeeForm.primaryTeamId))
    if (!project) return 'Choose a primary project'
    if (project.approvalRoute === 'TeamLead') return team?.leadName || project.managerName || 'Choose a primary team'
    if (project.approvalRoute === 'Delegate') return project.approvalDelegateName || project.managerName || 'No delegate assigned'
    return project.managerName || team?.leadName || 'No project manager assigned'
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
        primaryProjectId: Number(employeeForm.primaryProjectId),
        projectIds: employeeForm.projectIds.map(Number),
        primaryTeamId: Number(employeeForm.primaryTeamId),
        teamIds: employeeForm.teamIds.map(Number)
      })
      const primaryProject = data.projects[0]
      const primaryTeam = primaryProject?.teams[0]
      const defaults = { employeeCode: '', fullName: '', email: '', department: '', designation: '', jobRole: '', employmentType: 'Full-time', location: '', salaryStructure: { fixedPay: '', variablePay: '', pf: '', gratuity: '', insurance: '', otherDeductions: '' }, joinDate: new Date().toISOString().slice(0, 10), role: 1, primaryProjectId: String(primaryProject?.id || ''), projectIds: [String(primaryProject?.id || '')].filter(Boolean), primaryTeamId: String(primaryTeam?.id || ''), teamIds: [String(primaryTeam?.id || '')].filter(Boolean), submitting: false }
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
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Primary project</label>
            <select value={employeeForm.primaryProjectId} disabled={employeeForm.submitting} onChange={(e) => setPrimaryProject(e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
              {data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-navy/50 dark:text-white/50">Leave approval and reporting ownership follow this project.</p>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Primary team</label>
            <select value={employeeForm.primaryTeamId} disabled={employeeForm.submitting} onChange={(e) => {
              const teamId = e.target.value
              updateForm('employeeForm', 'primaryTeamId', teamId)
              if (!employeeForm.teamIds.includes(teamId)) toggleTeam(teamId)
            }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
              {teams.filter((team) => String(team.projectId) === String(employeeForm.primaryProjectId)).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
        </div>
        <hr className="border-navy/10 dark:border-white/10" />
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Project memberships</div>
            <div className="mt-2 border-y border-navy/10 dark:border-white/10 divide-y divide-navy/10 dark:divide-white/10">
              {data.projects.map((project) => {
                const projectId = String(project.id)
                const isPrimary = projectId === employeeForm.primaryProjectId
                return (
                  <label key={project.id} className={`flex items-center gap-3 py-3 cursor-pointer ${employeeForm.submitting ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input type="checkbox" checked={employeeForm.projectIds.includes(projectId)} disabled={employeeForm.submitting || isPrimary} onChange={() => toggleProject(project)} className="w-4 h-4 rounded border-navy/20 text-gold-1" />
                    <span className="min-w-0 text-sm font-bold text-navy dark:text-white break-words">{project.name}</span>
                    {isPrimary && <span className="ml-auto text-[10px] font-bold uppercase text-amber-700">Primary</span>}
                  </label>
                )
              })}
            </div>
          </div>
          <div className="p-4 rounded-lg border border-navy/10 dark:border-white/10 bg-amber-50 dark:bg-amber-900/30 self-start">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Default approver</div>
            <h3 className="font-heading font-bold text-navy dark:text-white mt-1">{approverName()}</h3>
            <div className="text-xs text-navy/50 dark:text-white/50 mt-1">After this step, the employee receives part 2 onboarding access.</div>
          </div>
        </div>
        <hr className="border-navy/10 dark:border-white/10" />
        <div>
          <h3 className="text-sm font-bold text-navy dark:text-white">Team memberships</h3>
          <p className="mt-1 text-xs text-navy/50 dark:text-white/50">Choose teams within the selected projects. The primary team remains selected.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {teams.filter((team) => employeeForm.projectIds.includes(String(team.projectId))).map((team) => {
            const isPrimary = String(team.id) === String(employeeForm.primaryTeamId)
            return (
            <label key={team.id} className={`p-4 rounded-lg border cursor-pointer transition-all ${employeeForm.teamIds.includes(String(team.id)) ? 'border-gold-1 bg-amber-50 dark:bg-amber-900/30' : 'border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]'} ${employeeForm.submitting ? 'opacity-50 pointer-events-none' : ''}`}>
              <input type="checkbox" checked={employeeForm.teamIds.includes(String(team.id))} disabled={employeeForm.submitting || isPrimary} onChange={() => toggleTeamMembership(team)} className="w-4 h-4 rounded border-navy/20 text-gold-1" />
              <strong className="block text-sm text-navy dark:text-white mt-2">{team.name}</strong>
              <span className="text-xs text-navy/50 dark:text-white/50">{team.projectName} - Lead: {team.leadName}</span>
              {isPrimary && <span className="block mt-1 text-[10px] font-bold uppercase text-amber-700">Primary team</span>}
            </label>
          )})}
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
