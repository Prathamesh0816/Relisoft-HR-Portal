import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import useStore from '../store'
import { createProject, updateProject, createTeam, updateTeam, loadWorkspace, getDelegates } from '../api'

const APPROVAL_ROUTES = [
  { value: 'ProjectManager', label: 'Project manager' },
  { value: 'TeamLead', label: 'Team lead' },
  { value: 'Delegate', label: 'Delegate' }
]

function projectApprover(project) {
  if (project.approvalRoute === 'TeamLead') return 'Employee primary team lead'
  if (project.approvalRoute === 'Delegate') return project.approvalDelegateName || 'Delegate not assigned'
  return project.managerName || 'Project manager not assigned'
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
  const [managementView, setManagementView] = useState(canAdministerProjects ? 'projects' : 'teams')
  const [expandedProjectIds, setExpandedProjectIds] = useState([])
  const initializedProjectTree = useRef(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [updProjectName, setUpdProjectName] = useState('')
  const [updProjectManagerId, setUpdProjectManagerId] = useState('')
  const [updApprovalRoute, setUpdApprovalRoute] = useState('ProjectManager')
  const [updApprovalDelegateId, setUpdApprovalDelegateId] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [updTeamName, setUpdTeamName] = useState('')
  const [updTeamProjectId, setUpdTeamProjectId] = useState('')
  const [updTeamLeadId, setUpdTeamLeadId] = useState('')

  const selProject = projects.find((project) => String(project.id) === String(selectedProjectId))
  const selTeam = teams.find((team) => String(team.id) === String(selectedTeamId))

  const selectProject = useCallback((project) => {
    setSelectedProjectId(String(project.id))
    setUpdProjectName(project.name)
    setUpdProjectManagerId(project.managerId ? String(project.managerId) : '')
    setUpdApprovalRoute(project.approvalRoute || 'ProjectManager')
    setUpdApprovalDelegateId(project.approvalDelegateId ? String(project.approvalDelegateId) : '')
  }, [])

  const selectTeam = useCallback((team) => {
    setSelectedTeamId(String(team.id))
    setUpdTeamName(team.name)
    setUpdTeamProjectId(String(team.projectId))
    setUpdTeamLeadId(String(team.leadId))
  }, [])

  const delegatesForProject = (projectId, managerId) => {
    const project = projects.find((item) => String(item.id) === String(projectId))
    const ownerId = managerId || project?.managerId
    return delegates.filter((delegate) => String(delegate.managerId) === String(ownerId) &&
      (delegate.projectId == null || (project && String(delegate.projectId) === String(project.id))))
  }

  useEffect(() => {
    const managerIds = [...new Set([
      ...projects.map((project) => project.managerId),
      ...managerOptions.map((manager) => manager.id)
    ].filter(Boolean))]
    Promise.all(managerIds.map((managerId) => getDelegates(managerId)))
      .then((groups) => setDelegates(groups.flat()))
      .catch(() => setDelegates([]))
  }, [managerOptions, projects])

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
      selectProject(projects[0])
    }
    if (!selectedTeamId && teams[0]) selectTeam(teams[0])
  }, [data.employees, managerOptions, projectForm.managerId, projects, selectProject, selectTeam, selectedProjectId, selectedTeamId, teamForm.leadId, teamForm.projectId, teams, updateForm])

  useEffect(() => {
    if (selProject) selectProject(selProject)
  }, [selProject, selectProject])

  useEffect(() => {
    if (selTeam) selectTeam(selTeam)
  }, [selTeam, selectTeam])

  const handleCreateProject = async (event) => {
    event.preventDefault()
    try {
      const created = await createProject({
        name: projectForm.name,
        managerId: Number(projectForm.managerId),
        approvalRoute: projectForm.approvalRoute,
        approvalDelegateId: projectForm.approvalRoute === 'Delegate' ? Number(projectForm.approvalDelegateId) : null
      })
      const refreshed = await loadWorkspace()
      setData(refreshed)
      const createdProject = refreshed.projects.find((project) => project.id === created.id)
      if (createdProject) {
        selectProject(createdProject)
        setExpandedProjectIds((current) => [...new Set([...current, createdProject.id])])
      }
      resetForm('projectForm', { name: '', managerId: String(managerOptions[0]?.id || ''), approvalRoute: 'ProjectManager', approvalDelegateId: '' })
      setMessage({ type: 'success', text: 'Project created.' })
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleUpdateProject = async (event) => {
    event.preventDefault()
    if (!selProject) return
    try {
      await updateProject(selProject.id, {
        name: updProjectName,
        managerId: Number(updProjectManagerId),
        approvalRoute: updApprovalRoute,
        approvalDelegateId: updApprovalRoute === 'Delegate' ? Number(updApprovalDelegateId) : null
      })
      const managerName = managerOptions.find((manager) => String(manager.id) === String(updProjectManagerId))?.fullName
      const approvalDelegateName = delegates.find((delegate) => String(delegate.id) === String(updApprovalDelegateId))?.delegateName
      setData({
        ...data,
        projects: data.projects.map((project) => project.id === selProject.id
          ? { ...project, name: updProjectName, managerId: Number(updProjectManagerId), managerName, approvalRoute: updApprovalRoute, approvalDelegateId: updApprovalRoute === 'Delegate' ? Number(updApprovalDelegateId) : null, approvalDelegateName: updApprovalRoute === 'Delegate' ? approvalDelegateName : null }
          : project)
      })
      setExpandedProjectIds((current) => [...new Set([...current, selProject.id])])

      const refreshed = await loadWorkspace()
      setData(refreshed)
      const updatedProject = refreshed.projects.find((project) => project.id === selProject.id)
      if (updatedProject) selectProject(updatedProject)
      setMessage({ type: 'success', text: 'Project updated.' })
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleCreateTeam = async (event) => {
    event.preventDefault()
    try {
      const created = await createTeam({
        name: teamForm.name,
        projectId: Number(teamForm.projectId),
        leadId: Number(teamForm.leadId)
      })
      const refreshed = await loadWorkspace()
      setData(refreshed)
      const createdTeam = refreshed.projects
        .flatMap((project) => project.teams)
        .find((team) => team.id === created.id)
      if (createdTeam) {
        selectTeam(createdTeam)
        setExpandedProjectIds((current) => [...new Set([...current, createdTeam.projectId])])
      }
      resetForm('teamForm', {
        name: '', projectId: String(projects[0]?.id || ''), leadId: String(data.employees[0]?.id || '')
      })
      setMessage({ type: 'success', text: 'Team created.' })
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const handleUpdateTeam = async (event) => {
    event.preventDefault()
    if (!selTeam) return
    try {
      await updateTeam(selTeam.id, {
        name: updTeamName,
        projectId: Number(updTeamProjectId),
        leadId: Number(updTeamLeadId)
      })
      const destinationProject = data.projects.find((project) => String(project.id) === String(updTeamProjectId))
      const leadName = data.employees.find((employee) => String(employee.id) === String(updTeamLeadId))?.fullName
      const updatedTeam = {
        ...selTeam,
        name: updTeamName,
        projectId: Number(updTeamProjectId),
        projectName: destinationProject?.name || selTeam.projectName,
        projectManagerId: destinationProject?.managerId,
        projectManagerName: destinationProject?.managerName,
        leadId: Number(updTeamLeadId),
        leadName
      }
      setData({
        ...data,
        projects: data.projects.map((project) => {
          const remainingTeams = project.teams.filter((team) => team.id !== selTeam.id)
          return project.id === updatedTeam.projectId
            ? { ...project, teams: [...remainingTeams, updatedTeam] }
            : { ...project, teams: remainingTeams }
        })
      })
      setExpandedProjectIds((current) => [...new Set([...current, updatedTeam.projectId])])

      const refreshed = await loadWorkspace()
      setData(refreshed)
      const refreshedTeam = refreshed.projects
        .flatMap((project) => project.teams)
        .find((team) => team.id === selTeam.id)
      if (refreshedTeam) selectTeam(refreshedTeam)
      setMessage({ type: 'success', text: 'Team updated.' })
    } catch (error) { setMessage({ type: 'error', text: error.response?.data?.message || 'Failed.' }) }
  }

  const renderApprovalFields = (route, setRoute, delegateId, setDelegateId, projectId, managerId) => (
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
            {delegatesForProject(projectId, managerId).map((delegate) => <option key={delegate.id} value={delegate.id}>{delegate.delegateName}</option>)}
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
                      <span className="block text-xs text-navy/50 dark:text-white/50 mt-1 break-words">
                        Approver: {projectApprover(project)}
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
                            <div key={team.id} className="grid gap-2 px-4 py-3 border-b border-navy/5 dark:border-white/5 last:border-b-0 sm:grid-cols-2">
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-navy/50 dark:text-white/50">Team</span>
                                <strong className="block text-sm text-navy dark:text-white break-words mt-1">{team.name}</strong>
                              </div>
                              <div className="min-w-0">
                                <span className="block text-[10px] font-bold uppercase text-navy/50 dark:text-white/50">Team lead</span>
                                <span className="block text-sm text-navy dark:text-white break-words mt-1">{team.leadName || 'Not assigned'}</span>
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

        <section className="pt-2" aria-labelledby="management-heading">
          <div className="flex flex-col gap-3 pb-5 border-b border-navy/10 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 id="management-heading" className="font-bold text-navy dark:text-white">Manage structure</h3>
              <p className="text-sm text-muted dark:text-white/60 mt-1">Choose one area and complete its changes without mixing workflows.</p>
            </div>
            {canAdministerProjects && (
              <div role="tablist" aria-label="Structure management" className="inline-flex self-start border border-navy/10 dark:border-white/10 rounded-lg p-1 bg-navy/[0.02] dark:bg-white/[0.03]">
                <button type="button" role="tab" aria-selected={managementView === 'projects'} onClick={() => setManagementView('projects')} className={`h-9 px-4 rounded-md text-sm font-bold ${managementView === 'projects' ? 'bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white shadow-sm' : 'text-navy/50 dark:text-white/50'}`}>Projects</button>
                <button type="button" role="tab" aria-selected={managementView === 'teams'} onClick={() => setManagementView('teams')} className={`h-9 px-4 rounded-md text-sm font-bold ${managementView === 'teams' ? 'bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white shadow-sm' : 'text-navy/50 dark:text-white/50'}`}>Teams</button>
              </div>
            )}
          </div>

          {managementView === 'projects' && canAdministerProjects && (
            <div role="tabpanel" className="space-y-8 pt-5">
              <form onSubmit={handleCreateProject} className="max-w-2xl space-y-4">
                <div>
                  <h4 className="font-bold text-navy dark:text-white">Create project</h4>
                  <p className="text-sm text-muted dark:text-white/60 mt-1">Set the project name and its responsible manager.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project name</label>
                  <input value={projectForm.name} onChange={(event) => updateForm('projectForm', 'name', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project manager</label>
                  <select value={projectForm.managerId} onChange={(event) => { updateForm('projectForm', 'managerId', event.target.value); updateForm('projectForm', 'approvalDelegateId', '') }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    {managerOptions.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                  </select>
                </div>
                {renderApprovalFields(projectForm.approvalRoute, (value) => updateForm('projectForm', 'approvalRoute', value), projectForm.approvalDelegateId, (value) => updateForm('projectForm', 'approvalDelegateId', value), null, projectForm.managerId)}
                <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Add project</button>
              </form>

              {selProject && (
                <form onSubmit={handleUpdateProject} className="max-w-2xl pt-6 border-t border-navy/10 dark:border-white/10 space-y-4">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">Update project</h4>
                    <p className="text-sm text-muted dark:text-white/60 mt-1">Select an existing project, then edit its saved values.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Existing project</label>
                    <select value={selectedProjectId} onChange={(event) => { const project = projects.find((item) => String(item.id) === event.target.value); if (project) selectProject(project) }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project name</label>
                    <input value={updProjectName} onChange={(event) => setUpdProjectName(event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project manager</label>
                    <select value={updProjectManagerId} onChange={(event) => { setUpdProjectManagerId(event.target.value); setUpdApprovalDelegateId('') }} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                      {managerOptions.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                    </select>
                  </div>
                  {renderApprovalFields(updApprovalRoute, setUpdApprovalRoute, updApprovalDelegateId, setUpdApprovalDelegateId, selProject.id, updProjectManagerId)}
                  <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Save project</button>
                </form>
              )}
            </div>
          )}

          {managementView === 'teams' && (
            <div role="tabpanel" className="space-y-8 pt-5">
              <form onSubmit={handleCreateTeam} className="max-w-2xl space-y-4">
                <div>
                  <h4 className="font-bold text-navy dark:text-white">Create team</h4>
                  <p className="text-sm text-muted dark:text-white/60 mt-1">Choose the parent project before assigning leadership and approval ownership.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project</label>
                  <select value={teamForm.projectId} onChange={(event) => updateForm('teamForm', 'projectId', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team name</label>
                  <input value={teamForm.name} onChange={(event) => updateForm('teamForm', 'name', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                  <select value={teamForm.leadId} onChange={(event) => updateForm('teamForm', 'leadId', event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                  </select>
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Add team</button>
              </form>

              {selTeam && (
                <form onSubmit={handleUpdateTeam} className="max-w-2xl pt-6 border-t border-navy/10 dark:border-white/10 space-y-4">
                  <div>
                    <h4 className="font-bold text-navy dark:text-white">Update team</h4>
                    <p className="text-sm text-muted dark:text-white/60 mt-1">Select an existing team, then edit its saved values.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Existing team</label>
                    <select value={selectedTeamId} onChange={(event) => { const team = teams.find((item) => String(item.id) === event.target.value); if (team) selectTeam(team) }} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                      {teams.map((team) => <option key={team.id} value={team.id}>{team.name} - {team.projectName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Parent project</label>
                    <select value={updTeamProjectId} onChange={(event) => setUpdTeamProjectId(event.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team name</label>
                    <input value={updTeamName} onChange={(event) => setUpdTeamName(event.target.value)} required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                    <select value={updTeamLeadId} onChange={(event) => setUpdTeamLeadId(event.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                      {data.employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
                    </select>
                  </div>
                  <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm">Save team</button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
