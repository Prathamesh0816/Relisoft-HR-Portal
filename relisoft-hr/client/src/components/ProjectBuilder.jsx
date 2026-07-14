import { useState, useEffect } from 'react'
import useStore from '../store'
import { createProject, updateProject, createTeam, updateTeam, loadWorkspace } from '../api'

export default function ProjectBuilder() {
  const { data, projectForm, teamForm, updateForm, resetForm, setData, setMessage } = useStore()
  const teams = data.projects.flatMap((p) => p.teams.map((t) => ({ ...t, projectName: p.name })))
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [updProjectName, setUpdProjectName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [updTeamName, setUpdTeamName] = useState('')
  const [updTeamProjectId, setUpdTeamProjectId] = useState('')
  const [updTeamLeadId, setUpdTeamLeadId] = useState('')

  const selProject = data.projects.find((p) => String(p.id) === String(selectedProjectId))
  const selTeam = teams.find((t) => String(t.id) === String(selectedTeamId))

  useEffect(() => {
    if (!selectedProjectId && data.projects[0]) {
      setSelectedProjectId(String(data.projects[0].id))
      setUpdProjectName(data.projects[0].name)
    }
    if (!selectedTeamId && teams[0]) {
      setSelectedTeamId(String(teams[0].id))
      setUpdTeamName(teams[0].name)
      setUpdTeamProjectId(String(teams[0].projectId))
      setUpdTeamLeadId(String(teams[0].leadId))
    }
  }, [data.projects])

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      await createProject(projectForm.name)
      resetForm('projectForm', { name: '' })
      setMessage({ type: 'success', text: 'Project created.' })
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleUpdateProject = async (e) => {
    e.preventDefault()
    if (!selProject) return
    try {
      await updateProject(selProject.id, updProjectName)
      setMessage({ type: 'success', text: 'Project updated.' })
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleCreateTeam = async (e) => {
    e.preventDefault()
    try {
      await createTeam({ name: teamForm.name, projectId: Number(teamForm.projectId), leadId: Number(teamForm.leadId) })
      resetForm('teamForm', { name: '', projectId: String(data.projects[0]?.id || ''), leadId: String(data.employees[0]?.id || '') })
      setMessage({ type: 'success', text: 'Team created.' })
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }
  const handleUpdateTeam = async (e) => {
    e.preventDefault()
    if (!selTeam) return
    try {
      await updateTeam(selTeam.id, { name: updTeamName, projectId: Number(updTeamProjectId), leadId: Number(updTeamLeadId) })
      setMessage({ type: 'success', text: 'Team updated.' })
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }) }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Projects and teams</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Keep the project structure ready before HR attaches teams to employees.</p>
      </div>
      <div className="px-5 pb-5 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">New project</label>
              <input value={projectForm.name} onChange={(e) => updateForm('projectForm', 'name', e.target.value)} placeholder="Client Portal Modernization" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Add project</button>
          </form>
          <form onSubmit={handleCreateTeam} className="space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team name</label>
                <input value={teamForm.name} onChange={(e) => updateForm('teamForm', 'name', e.target.value)} placeholder="Experience Team" required className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project</label>
                <select value={teamForm.projectId} onChange={(e) => updateForm('teamForm', 'projectId', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                  {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                <select value={teamForm.leadId} onChange={(e) => updateForm('teamForm', 'leadId', e.target.value)} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                  {data.employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} - {data.roles.find((r) => r.id === e.roleId)?.label || e.role}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Add team</button>
          </form>
        </div>
        <hr className="border-navy/10 dark:border-white/10" />
        <div className="space-y-4">
          <form onSubmit={handleUpdateProject} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-4">
            <div className="pb-3 border-b border-navy/10 dark:border-white/10">
              <strong className="text-navy dark:text-white">Update project</strong>
              <span className="block text-xs font-bold text-navy/50 dark:text-white/50 uppercase mt-1">Rename a project everywhere it is shown.</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-900/30 border border-navy/5 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Current</span>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Select project</label>
                  <select value={selectedProjectId} onChange={(e) => { setSelectedProjectId(e.target.value); setUpdProjectName(data.projects.find((p) => String(p.id) === e.target.value)?.name || '') }} disabled={!data.projects.length} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div><span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Project name</span><strong className="block text-navy dark:text-white mt-1">{selProject?.name || 'No project selected'}</strong></div>
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">New</span>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Updated project name</label>
                  <input value={updProjectName} onChange={(e) => setUpdProjectName(e.target.value)} placeholder={selProject?.name || 'Choose a project first'} required disabled={!selProject} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={!selProject} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Save project</button>
            </div>
          </form>
          <form onSubmit={handleUpdateTeam} className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-4">
            <div className="pb-3 border-b border-navy/10 dark:border-white/10">
              <strong className="text-navy dark:text-white">Update team</strong>
              <span className="block text-xs font-bold text-navy/50 dark:text-white/50 uppercase mt-1">Rename a team, move it to another project, or change its lead.</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/30 dark:bg-amber-900/30 border border-navy/5 dark:border-white/5 space-y-3">
                <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Current</span>
                <div>
                  <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Select team</label>
                  <select value={selectedTeamId} onChange={(e) => { const t = teams.find((x) => String(x.id) === e.target.value); setSelectedTeamId(e.target.value); if (t) { setUpdTeamName(t.name); setUpdTeamProjectId(String(t.projectId)); setUpdTeamLeadId(String(t.leadId)) } }} disabled={!teams.length} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-navy dark:text-white">
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name} - {t.projectName}</option>)}
                  </select>
                </div>
                {selTeam && (
                  <div className="space-y-2">
                    <div><span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Team</span><strong className="block text-navy dark:text-white text-sm">{selTeam.name}</strong></div>
                    <div><span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Project</span><strong className="block text-navy dark:text-white text-sm">{selTeam.projectName}</strong></div>
                    <div><span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">Lead</span><strong className="block text-navy dark:text-white text-sm">{selTeam.leadName}</strong></div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-navy/50 dark:text-white/50 uppercase">New</span>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Updated team name</label>
                    <input value={updTeamName} onChange={(e) => setUpdTeamName(e.target.value)} placeholder={selTeam?.name || 'Choose a team first'} required disabled={!selTeam} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Project</label>
                    <select value={updTeamProjectId} onChange={(e) => setUpdTeamProjectId(e.target.value)} disabled={!selTeam} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Team lead</label>
                    <select value={updTeamLeadId} onChange={(e) => setUpdTeamLeadId(e.target.value)} disabled={!selTeam} className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy dark:text-white">
                      {data.employees.map((e) => <option key={e.id} value={e.id}>{e.fullName} - {data.roles.find((r) => r.id === e.roleId)?.label || e.role}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={!selTeam} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Save team</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
