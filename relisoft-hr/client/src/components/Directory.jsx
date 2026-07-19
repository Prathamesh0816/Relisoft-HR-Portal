import { useState, useMemo } from 'react'
import useStore from '../store'
import { updateEmployee, loadWorkspace } from '../api'

function roleLabel(role, fallback) {
  const labels = { Employee: 'Software Engineer', TeamLead: 'Team Lead', HR: 'HR L1', HRL2: 'HR L2', SeniorSoftwareEngineer: 'Senior Software Engineer', Manager: 'Technical Manager L1', ManagerL2: 'Technical Manager L2', OrganizationHead: 'Organization Head' }
  return labels[role] || fallback || role
}

function roleImportance(employee) {
  const rank = { OrganizationHead: 800, HRL2: 700, HR: 650, ManagerL2: 600, Manager: 550, TeamLead: 500, SeniorSoftwareEngineer: 400, Employee: 300 }
  return rank[employee.role] || 100
}

function approverForEmployee(employee, data) {
  if (!employee) return 'Select an employee'
  if (employee.approverName) return employee.approverName
  if (employee.role === 'OrganizationHead') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
  if (employee.role === 'HR' || employee.role === 'HRL2') return data.employees.find((e) => e.role === 'OrganizationHead')?.fullName || 'No org head found'
  if (employee.role === 'Manager' || employee.role === 'ManagerL2') return data.employees.find((e) => e.role === 'HR' || e.role === 'HRL2')?.fullName || 'No HR found'
  const project = employee.primaryProject
  if (project?.approvalRoute === 'Delegate') return project.approvalDelegateName || project.managerName || 'No delegate assigned'
  if (project?.approvalRoute === 'TeamLead') return employee.primaryTeam?.leadName || project.managerName || 'No primary team lead assigned'
  return project?.managerName || employee.primaryTeam?.projectManagerName || 'No project manager assigned'
}

export default function Directory() {
  const { data, currentUser, setData, setMessage } = useStore()
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const canEdit = currentUser && ['HR', 'HRL2', 'OrganizationHead', 'Admin', 'SuperAdmin'].includes(currentUser.role)
  const allTeams = data.projects.flatMap((p) => p.teams.map((t) => ({ ...t, projectName: p.name })))

  const rows = useMemo(() => {
    return data.employees.map((e) => ({
      id: e.id, roleRank: roleImportance(e), employee: e.fullName, employeeCode: e.employeeCode,
      email: e.email, role: roleLabel(e.role, data.roles.find((r) => r.id === e.roleId)?.label),
      department: e.department, designation: e.designation, jobRole: e.jobRole,
      employmentType: e.employmentType, location: e.location,
      primaryProject: e.primaryProject?.name || 'Not assigned',
      primaryTeam: e.primaryTeam?.name || 'Not assigned',
      projectsAndTeams: e.teams?.map((t) => `${t.projectName} / ${t.name}`).join(', ') || 'No project teams assigned',
      approver: approverForEmployee(e, data), joiningDate: e.joinDate ? new Date(e.joinDate).toLocaleDateString() : ''
    })).sort((a, b) => b.roleRank !== a.roleRank ? b.roleRank - a.roleRank : a.employee.localeCompare(b.employee))
  }, [data])

  const filtered = search.trim() ? rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(search.toLowerCase()))) : rows

  const editingEmployee = data.employees.find((e) => String(e.id) === String(editingId))
  const [editForm, setEditForm] = useState(null)

  const startEdit = (emp) => {
    const projectIds = emp.projects?.length
      ? emp.projects.map((project) => String(project.id))
      : [...new Set((emp.teams || []).map((team) => String(team.projectId)))]
    const inferredProjectId = emp.primaryTeam?.projectId || emp.teams?.[0]?.projectId
    const primaryProjectId = String(emp.primaryProjectId || emp.primaryProject?.id || inferredProjectId || data.projects[0]?.id || '')
    const primaryProjectTeam = emp.teams?.find((team) => String(team.projectId) === primaryProjectId) ||
      allTeams.find((team) => String(team.projectId) === primaryProjectId)
    const primaryTeamId = emp.primaryTeamId || emp.primaryTeam?.id || primaryProjectTeam?.id || ''
    const teamIds = emp.teams?.map((t) => String(t.id)) || []
    const pt = primaryTeamId ? String(primaryTeamId) : ''
    const ss = emp.salaryStructure || {}
    setEditForm({
      employeeCode: emp.employeeCode || '', fullName: emp.fullName || '', email: emp.email || '',
      department: emp.department || '', designation: emp.designation || '', jobRole: emp.jobRole || '',
      employmentType: emp.employmentType || 'Full-time', location: emp.location || '',
      salaryStructure: {
        fixedPay: ss.fixedPay ?? '', variablePay: ss.variablePay ?? '',
        pf: ss.pf ?? '', gratuity: ss.gratuity ?? '',
        insurance: ss.insurance ?? '', otherDeductions: ss.otherDeductions ?? ''
      },
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().slice(0, 10) : '',
      role: emp.roleSelection || emp.roleId || 1,
      primaryProjectId,
      projectIds: primaryProjectId && !projectIds.includes(primaryProjectId) ? [...projectIds, primaryProjectId] : projectIds,
      primaryTeamId: pt,
      teamIds: pt && !teamIds.includes(pt) ? [...teamIds, pt] : teamIds
    })
    setEditingId(emp.id)
  }

  const updateEdit = (field, value) => setEditForm((f) => ({ ...f, [field]: value }))
  const setPrimaryProject = (projectId) => setEditForm((form) => {
    const projectTeams = allTeams.filter((team) => String(team.projectId) === projectId)
    const selectedPrimaryTeam = projectTeams.find((team) => form.teamIds.includes(String(team.id))) || projectTeams[0]
    const primaryTeamId = selectedPrimaryTeam ? String(selectedPrimaryTeam.id) : ''
    return {
      ...form,
      primaryProjectId: projectId,
      projectIds: form.projectIds.includes(projectId) ? form.projectIds : [...form.projectIds, projectId],
      primaryTeamId,
      teamIds: primaryTeamId && !form.teamIds.includes(primaryTeamId) ? [...form.teamIds, primaryTeamId] : form.teamIds
    }
  })

  const toggleEditProject = (projectId) => setEditForm((form) => {
    if (projectId === form.primaryProjectId) return form
    const isSelected = form.projectIds.includes(projectId)
    const projectTeamIds = new Set(allTeams.filter((team) => String(team.projectId) === projectId).map((team) => String(team.id)))
    return {
      ...form,
      projectIds: isSelected ? form.projectIds.filter((id) => id !== projectId) : [...form.projectIds, projectId],
      teamIds: isSelected ? form.teamIds.filter((id) => !projectTeamIds.has(id)) : form.teamIds
    }
  })

  const toggleEditTeam = (team) => setEditForm((form) => {
    const teamId = String(team.id)
    if (teamId === form.primaryTeamId) return form
    const isSelected = form.teamIds.includes(teamId)
    const projectId = String(team.projectId)
    return {
      ...form,
      projectIds: !isSelected && !form.projectIds.includes(projectId) ? [...form.projectIds, projectId] : form.projectIds,
      teamIds: isSelected ? form.teamIds.filter((id) => id !== teamId) : [...form.teamIds, teamId]
    }
  })

  const saveEdit = async (e) => {
    e.preventDefault()
    if (!editForm) return
    const selRole = data.roles.find((r) => String(r.id) === String(editForm.role))
    try {
      const ss = editForm.salaryStructure
      await updateEmployee(editingId, {
        employeeCode: editForm.employeeCode, fullName: editForm.fullName, email: editForm.email,
        department: editForm.department, designation: editForm.designation, jobRole: editForm.jobRole,
        employmentType: editForm.employmentType, location: editForm.location,
        salaryStructure: ss?.fixedPay ? { fixedPay: Number(ss.fixedPay), variablePay: Number(ss.variablePay || 0), pf: Number(ss.pf || 0), gratuity: Number(ss.gratuity || 0), insurance: Number(ss.insurance || 0), otherDeductions: Number(ss.otherDeductions || 0) } : null, joinDate: editForm.joinDate,
        role: Number(selRole?.baseRoleId || editForm.role),
        primaryProjectId: Number(editForm.primaryProjectId), projectIds: editForm.projectIds.map(Number),
        primaryTeamId: Number(editForm.primaryTeamId), teamIds: editForm.teamIds.map(Number)
      })
      setMessage({ type: 'success', text: 'Employee updated.' })
      setEditingId(null)
      setEditForm(null)
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Organization hierarchy</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Search across the hierarchy, filter by column, and scan reporting ownership in one grid.</p>
      </div>
      <div className="px-5 pb-5 space-y-4">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search across the full hierarchy" className="w-full max-w-sm h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
        <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
          <table className="w-full min-w-[1120px]">
            <thead>
              <tr className="bg-amber-50/50 border-b border-navy/10">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider sticky left-0 bg-amber-50/50">Employee</th>
                {canEdit && <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Action</th>}
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Department</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Designation</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">System Access</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Primary Project</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Primary Team</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Memberships</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Approver</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Joining Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-navy/5 dark:border-white/5 hover:bg-amber-50/20">
                  <td className="px-4 py-3 sticky left-0 bg-white dark:bg-[var(--bg-secondary)]">
                    {canEdit ? (
                      <button type="button" onClick={() => startEdit(data.employees.find((e) => e.id === row.id))} className="block text-left text-sm font-bold text-navy dark:text-white hover:underline">{row.employee}</button>
                    ) : <strong className="text-sm text-navy dark:text-white">{row.employee}</strong>}
                    <div className="text-xs text-navy/50 dark:text-white/50">{row.email}</div>
                  </td>
                  {canEdit && (
                    <td className="px-4 py-3">
                      <button onClick={() => startEdit(data.employees.find((e) => e.id === row.id))} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Edit</button>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.employeeCode}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.department}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.designation}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.jobRole}</td>
                  <td className="px-4 py-3"><span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold">{row.role}</span></td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.primaryProject}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.primaryTeam}</td>
                  <td className="px-4 py-3 text-xs text-navy/70 dark:text-white/70 max-w-xs">{row.projectsAndTeams}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.approver}</td>
                  <td className="px-4 py-3 text-sm text-navy dark:text-white">{row.joiningDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingEmployee && editForm && (
          <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-navy/40 backdrop-blur-sm">
            <div className="card-surface w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="flex items-start justify-between gap-4 p-5 border-b border-navy/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div>
                  <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Edit employee</h2>
                  <p className="text-muted dark:text-white/60 text-sm mt-1">{editingEmployee.fullName} - {editingEmployee.employeeCode}</p>
                </div>
                <button onClick={() => { setEditingId(null); setEditForm(null) }} className="px-4 py-2 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs">Close</button>
              </div>
              <form onSubmit={saveEdit} className="p-5 overflow-auto max-h-[calc(90vh-100px)] space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { field: 'employeeCode', label: 'Empcode' }, { field: 'fullName', label: 'Full name' },
                    { field: 'email', label: 'Official email', type: 'email' }, { field: 'department', label: 'Department' },
                    { field: 'designation', label: 'Designation' }, { field: 'jobRole', label: 'Job role' }
                  ].map(({ field, label, type }) => (
                    <div key={field}>
                      <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">{label}</label>
                      <input type={type || 'text'} value={editForm[field]} onChange={(e) => updateEdit(field, e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Join date</label>
                    <input type="date" value={editForm.joinDate} onChange={(e) => updateEdit('joinDate', e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Employment type</label>
                    <select value={editForm.employmentType} onChange={(e) => updateEdit('employmentType', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {['Full-time', 'Contract', 'Intern', 'Consultant'].map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Location</label>
                    <input value={editForm.location} onChange={(e) => updateEdit('location', e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">System access</label>
                    <select value={editForm.role} onChange={(e) => updateEdit('role', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {data.roles.map((r) => <option key={r.id} value={r.id}>{r.label || r.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase mb-2 block">Salary structure (₹/annum)</label>
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
                          <input type="number" value={editForm.salaryStructure?.[field] ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, salaryStructure: { ...f.salaryStructure, [field]: e.target.value } }))} placeholder="0" className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Primary project</label>
                    <select value={editForm.primaryProjectId} onChange={(e) => setPrimaryProject(e.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                    <p className="mt-1.5 text-xs text-navy/50 dark:text-white/50">Leave approval and reporting ownership follow this project.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Primary team</label>
                    <select value={editForm.primaryTeamId} onChange={(e) => {
                      const tid = e.target.value
                      updateEdit('primaryTeamId', tid)
                      if (!editForm.teamIds.includes(tid)) {
                        const team = allTeams.find((item) => String(item.id) === tid)
                        if (team) toggleEditTeam(team)
                      }
                    }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {allTeams.filter((team) => String(team.projectId) === editForm.primaryProjectId).map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                  </div>
                </div>
                <hr className="border-navy/10" />
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Project memberships</div>
                    <div className="mt-2 border-y border-navy/10 dark:border-white/10 divide-y divide-navy/10 dark:divide-white/10">
                      {data.projects.map((project) => {
                        const projectId = String(project.id)
                        const isPrimary = projectId === editForm.primaryProjectId
                        return (
                          <label key={project.id} className="flex items-center gap-3 py-3 cursor-pointer">
                            <input type="checkbox" checked={editForm.projectIds.includes(projectId)} disabled={isPrimary} onChange={() => toggleEditProject(projectId)} className="w-4 h-4 rounded border-navy/20 text-gold-1" />
                            <span className="min-w-0 text-sm font-bold text-navy dark:text-white break-words">{project.name}</span>
                            {isPrimary && <span className="ml-auto text-[10px] font-bold uppercase text-amber-700">Primary</span>}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-navy/10 dark:border-white/10 bg-amber-50/30 self-start">
                    <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Default approver</div>
                    <h3 className="font-heading font-bold text-navy dark:text-white mt-1">
                      {(() => {
                        const role = data.roles.find((r) => String(r.id) === String(editForm.role))
                        const project = data.projects.find((item) => String(item.id) === editForm.primaryProjectId)
                        const emp = { role: data.roles.find((r) => !r.isCustom && Number(r.baseRoleId) === Number(role?.baseRoleId))?.name || role?.name, primaryProject: project, primaryTeam: allTeams.find((t) => String(t.id) === String(editForm.primaryTeamId)) }
                        return approverForEmployee(emp, data)
                      })()}
                    </h3>
                  </div>
                </div>
                <hr className="border-navy/10" />
                <div>
                  <h3 className="text-sm font-bold text-navy dark:text-white">Team memberships</h3>
                  <p className="mt-1 text-xs text-navy/50 dark:text-white/50">Teams are available only within selected projects. The primary team cannot be removed.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {allTeams.filter((team) => editForm.projectIds.includes(String(team.projectId))).map((team) => {
                    const isPrimary = String(team.id) === editForm.primaryTeamId
                    return (
                    <label key={team.id} className={`p-4 rounded-lg border cursor-pointer transition-all ${editForm.teamIds.includes(String(team.id)) ? 'border-gold-1 bg-amber-50/30' : 'border-navy/10 bg-white dark:bg-[var(--bg-secondary)]'}`}>
                      <input type="checkbox" checked={editForm.teamIds.includes(String(team.id))} disabled={isPrimary} onChange={() => toggleEditTeam(team)} className="w-4 h-4 rounded border-navy/20 text-gold-1" />
                      <strong className="block text-sm text-navy dark:text-white mt-2">{team.name}</strong>
                      <span className="text-xs text-navy/50 dark:text-white/50">{team.projectName} - Lead: {team.leadName}</span>
                      {isPrimary && <span className="block mt-1 text-[10px] font-bold uppercase text-amber-700">Primary team</span>}
                    </label>
                  )})}
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => { setEditingId(null); setEditForm(null) }} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Cancel</button>
                  <button type="submit" className="gold-button px-5 py-2.5 rounded-xl font-bold text-sm">Save changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
