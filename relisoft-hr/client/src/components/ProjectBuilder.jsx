import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import useStore from '../store'
import { createProject, updateProject, createTeam, updateTeam, loadWorkspace, getDelegates } from '../api'

const APPROVAL_ROUTES = [
  { value: 'ProjectManager', label: 'Project manager' },
  { value: 'TeamLead', label: 'Team lead' },
  { value: 'Delegate', label: 'Delegate' }
]

function teamApprover(team) {
  if (team.approvalRoute === 'TeamLead') return team.leadName || 'Team lead not assigned'
  if (team.approvalRoute === 'Delegate') return team.approvalDelegateName || 'Delegate not assigned'
  return team.projectManagerName || 'Project manager not assigned'
}

export default function ProjectBuilder() {
  const { currentUser, data, projectForm, teamForm, updateForm, resetForm, setData, setMessage } = useStore()
  const canAdministerProjects = ['HR', 'HRL2', 'OrganizationHead', 'Admin', 'SuperAdmin'].includes(currentUser?.role)
  const projects = useMemo(() => canAdministerProjects
    ? data.projects
    : data.projects.filter((project) => project.managerId === currentUser?.employeeId),
  [canAdministerProjects, currentUser?.employeeId, data.projects])
  const teams = useMemo(() => projects.flatMap((project) =>
    project.teams.map((team) => ({ ...team, projectName: project.name }))), [projects])
  const managerOptions = useMemo(() => data.employees.filter((employee) =>
    ['Manager', 'ManagerL2', 'OrganizationHead'].includes(employee.role)), [data.employees])

  const [delegates, setDelegates] = useState([])
  const [expandedProjectIds, setExpandedProjectIds] = useState([])
  const initializedProjectTree = useRef(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [updProjectName, setUpdProjectName] = useState('')
  const [updProjectManagerId, setUpdProjectManagerId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [updTeamName, setUpdTeamName] = useState('')
  const [updTeamProjectId, setUpdTeamProjectId] = useState('')
  const [updTeamLeadId, setUpdTeamLeadId] = useState('')
  const [updApprovalRoute, setUpdApprovalRoute] = useState('ProjectManager')
  const [updApprovalDelegateId, setUpdApprovalDelegateId] = useState('')

  const selProject = projects.find((project) => String(project.id) === String(selectedProjectId))
  const selTeam = teams.find((team) => String(team.id) === String(selectedTeamId))

  const selectTeam = useCallback((team) => {
    setSelectedTeamId(String(team.id))
    setUpdTeamName(team.name)
    setUpdTeamProjectId(String(team.projectId))
    setUpdTeamLeadId(String(team.leadId))
    setUpdApprovalRoute(team.approvalRoute || 'ProjectManager')
    setUpdApprovalDelegateId(team.approvalDelegateId ? String(team.approvalDelegateId) : '')
  }, [])

  const delegatesForProject = (projectId) => {
    const project = projects.find((item) => String(item.id) === String(projectId))
    if (!project) return []
    return delegates.filter((delegate) => delegate.managerId === project.managerId &&
      (delegate.projectId == null || String(delegate.projectId) === String(project.id)))
  }

  useEffect(() => {
    const managerIds = [...new Set(projects.map((project) => project.managerId).filter(Boolean))]
    Promise.all(managerIds.map((managerId) => getDelegates(managerId)))
      .then((groups) => setDelegates(groups.flat()))
      .catch(() => setDelegates([]))
  }, [projects])

  useEffect(() => {
    if (projects[0] && !initializedProjectTree.current) {
      initializedProjectTree.current = true
      setExpandedProjectIds([projects[0].id])
    }
  }, [projects])

  useEffect(() => {
    if (!projectForm.managerId && managerOptions[0]) updateForm('projectForm', 'managerId', String(managerOptions[0].id))
    if (!teamForm.projectId && projects[0]) updateForm('teamForm', 'projectId', String(projects[0].id))
    if (!teamForm.leadId && data.employees[0]) updateForm('teamForm', 'leadId', String(data.employees[0].id))

    if (!selectedProjectId && projects[0]) {
      setSelectedProjectId(String(projects[0].id))
      setUpdProjectName(projects[0].name)
      setUpdProjectManagerId(String(projects[0].managerId || ''))
    }
    if (!selectedTeamId && teams[0]) selectTeam(teams[0])
  }, [data.employees, managerOptions, projectForm.managerId, projects, selectTeam, selectedProjectId, selectedTeamId, teamForm.leadId, teamForm.projectId, teams, updateForm])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    try {
      await createProject({ name: projectForm.name, managerId: Number(projectForm.managerId) })
      resetForm('projectForm', { name: '', managerId: String(managerOptions[0]?.id || '') })
      setMessage({ type: 'success', text: 'Project created.' })
      setData(await loadWorkspace())
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleUpdateProject = async (event) => {
    event.preventDefault()
    if (!selProject) return
    try {
      await updateProject(selProject.id, { name: updProjectName, managerId: Number(updProjectManagerId) })
      setMessage({ type: 'success', text: 'Project updated.' })
      setData(await loadWorkspace())
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleCreateTeam = async (event) => {
    event.preventDefault()
    try {
      await createTeam({
        name: teamForm.name,
        projectId: Number(teamForm.projectId),
        leadId: Number(teamForm.leadId),
        approvalRoute: teamForm.approvalRoute,
        approvalDelegateId: teamForm.approvalRoute === 'Delegate' ? Number(teamForm.approvalDelegateId) : null
      })
      resetForm('teamForm', {
        name: '', projectId: String(projects[0]?.id || ''), leadId: String(data.employees[0]?.id || ''),
        approvalRoute: 'ProjectManager', approvalDelegateId: ''
      })
      setMessage({ type: 'success', text: 'Team created.' })
      setData(await loadWorkspace())
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleUpdateTeam = async (event) => {
    event.preventDefault()
    if (!selTeam) return
    try {
      await updateTeam(selTeam.id, {
        name: updTeamName,
        projectId: Number(updTeamProjectId),
        leadId: Number(updTeamLeadId),
        approvalRoute: updApprovalRoute,
        approvalDelegateId: updApprovalRoute === 'Delegate' ? Number(updApprovalDelegateId) : null
      })
      setMessage({ type: 'success', text: 'Team updated.' })
      setData(await loadWorkspace())
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const renderApprovalFields = (route, setRoute, delegateId, setDelegateId, projectId) => (
    <>
      <div>
        <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Approver</label>
        <select value={route} onChange={(event) => { setRoute(event.target.value); if (event.target.value !== 'Delegate') setDelegateId('') }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
          {APPROVAL_ROUTES.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
      {route === 'Delegate' && (
        <div>
          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Approval delegate</label>
          <select value={delegateId} onChange={(event) => setDelegateId(event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
            <option value="">Select delegate</option>
            {delegatesForProject(projectId).map((delegate) => <option key={delegate.id} value={delegate.id}>{delegate.delegateName}</option>)}
          </select>
        </div>
      )}
    </>
  )

  const toggleProject = (projectId) => {
    setExpandedProjectIds((current) => current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId])
  }

  if (!projects.length && !canAdministerProjects) {
    return <div className="card-surface p-5 text-sm text-muted dark:text-white/60">No projects are assigned to you.</div>
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Projects and teams</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Manage project ownership, team leads, and approval routing.</p>
      </div>
      <div className="px-5 pb-5 space-y-6">
        <section aria-labelledby="existing-projects-heading">
          <div className="flex items-center justify-between gap-4 pb-3">
            <div>
              <h3 id="existing-projects-heading" className="font-bold text-navy dark:text-white">Existing projects</h3>
              <p className="text-sm text-muted dark:text-white/60 mt-1">Expand a project to view its teams and approval ownership.</p>
            </div>
            <span className="text-xs font-bold text-navy/50 dark:text-white/50">{projects.length} project{projects.length === 1 ? '' : 's'}</span>
          </div>

          <div className="border-y border-navy/10 dark:border-white/10 divide-y divide-navy/10 dark:divide-white/10">
            {projects.length === 0 ? (
              <p className="py-5 text-sm text-muted dark:text-white/60">No projects have been created.</p>
            ) : projects.map((project) => {
              const isExpanded = expandedProjectIds.includes(project.id)
              return (
                <div key={project.id}>
                  <button
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    aria-expanded={isExpanded}
                    className="w-full min-h-16 py-3 flex items-center gap-3 text-left text-navy dark:text-white hover:bg-navy/[0.03] dark:hover:bg-white/[0.03]"
                  >
                    {isExpanded ? <ChevronDown size={18} aria-hidden="true" /> : <ChevronRight size={18} aria-hidden="true" />}
                    <span className="min-w-0 flex-1">
                      <strong className="block text-sm break-words">{project.name}</strong>
                      <span className="block text-xs text-navy/50 dark:text-white/50 mt-1 break-words">
                        Manager: {project.managerName || 'Not assigned'}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-bold text-navy/50 dark:text-white/50">
                      {project.teams.length} team{project.teams.length === 1 ? '' : 's'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="pb-4 pl-8 sm:pl-10">
                      {project.teams.length === 0 ? (
                        <p className="py-3 text-sm text-muted dark:text-white/60">No teams in this project.</p>
                      ) : (
                        <div className="border-l-2 border-gold-1/50">
                          {project.teams.map((team) => (
                            <div key={team.id} className="grid gap-2 px-4 py-3 border-b border-navy/5 dark:border-white/5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-navy/50 dark:text-white/50">Team</span>
                                <strong className="block text-sm text-navy dark:text-white break-words mt-1">{team.name}</strong>
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-navy/50 dark:text-white/50">Team lead</span>
                                <span className="block text-sm text-navy dark:text-white break-words mt-1">{team.leadName || 'Not assigned'}</span>
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-navy/50 dark:text-white/50">Approver</span>
                                <span className="block text-sm text-navy dark:text-white break-words mt-1">{teamApprover(team)}</span>
                                <span className="block text-xs text-navy/50 dark:text-white/50 mt-1">{APPROVAL_ROUTES.find((route) => route.value === team.approvalRoute)?.label || 'Project manager'}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <div className={`grid gap-6 ${canAdministerProjects ? 'md:grid-cols-2' : ''}`}>
          {canAdministerProjects && (
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">New project</label>
                <input value={projectForm.name} onChange={(event) => updateForm('projectForm', 'name', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project manager</label>
                <select value={projectForm.managerId} onChange={(event) => updateForm('projectForm', 'managerId', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {managerOptions.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                </select>
              </div>
              <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Add project</button>
            </form>
          )}

          <form onSubmit={handleCreateTeam} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team name</label>
                <input value={teamForm.name} onChange={(event) => updateForm('teamForm', 'name', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project</label>
                <select value={teamForm.projectId} onChange={(event) => { updateForm('teamForm', 'projectId', event.target.value); updateForm('teamForm', 'approvalDelegateId', '') }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                <select value={teamForm.leadId} onChange={(event) => updateForm('teamForm', 'leadId', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                </select>
              </div>
              {renderApprovalFields(teamForm.approvalRoute, (value) => updateForm('teamForm', 'approvalRoute', value), teamForm.approvalDelegateId, (value) => updateForm('teamForm', 'approvalDelegateId', value), teamForm.projectId)}
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Add team</button>
          </form>
        </div>

        {canAdministerProjects && selProject && (
          <form onSubmit={handleUpdateProject} className="pt-5 border-t border-navy/10 dark:border-white/10 space-y-3">
            <h3 className="font-bold text-navy dark:text-white">Update project</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <select value={selectedProjectId} onChange={(event) => { const project = projects.find((item) => String(item.id) === event.target.value); setSelectedProjectId(event.target.value); setUpdProjectName(project?.name || ''); setUpdProjectManagerId(String(project?.managerId || '')) }} className="h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
              <input value={updProjectName} onChange={(event) => setUpdProjectName(event.target.value)} required className="h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
              <select value={updProjectManagerId} onChange={(event) => setUpdProjectManagerId(event.target.value)} required className="h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                {managerOptions.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
              </select>
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Save project</button>
          </form>
        )}

        {selTeam && (
          <form onSubmit={handleUpdateTeam} className="pt-5 border-t border-navy/10 dark:border-white/10 space-y-3">
            <h3 className="font-bold text-navy dark:text-white">Update team</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team</label>
                <select value={selectedTeamId} onChange={(event) => { const team = teams.find((item) => String(item.id) === event.target.value); if (team) selectTeam(team) }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {teams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.projectName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team name</label>
                <input value={updTeamName} onChange={(event) => setUpdTeamName(event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project</label>
                <select value={updTeamProjectId} onChange={(event) => { setUpdTeamProjectId(event.target.value); setUpdApprovalDelegateId('') }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                <select value={updTeamLeadId} onChange={(event) => setUpdTeamLeadId(event.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                  {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                </select>
              </div>
              {renderApprovalFields(updApprovalRoute, setUpdApprovalRoute, updApprovalDelegateId, setUpdApprovalDelegateId, updTeamProjectId)}
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Save team</button>
          </form>
        )}
      </div>
    </div>
  )
}
