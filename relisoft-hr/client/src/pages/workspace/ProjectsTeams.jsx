import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Building2, Users, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'
import { workspaceAPI } from '../../services/api'

export default function ProjectsTeams() {
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(null)
  const [editItem, setEditItem] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', projectId: '', leadEmployeeCode: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await workspaceAPI.getDirectory()
      setProjects(res.data.projects || [])
      setEmployees(res.data.employees || [])
    } catch (err) {
      toast.error('Failed to load workspace data')
    } finally {
      setLoading(false)
    }
  }

  const openCreateProject = () => {
    setEditItem(null)
    setForm({ name: '', projectId: '', leadEmployeeCode: '' })
    setShowModal('project')
  }

  const openEditProject = (p) => {
    setEditItem(p)
    setForm({ name: p.name, projectId: '', leadEmployeeCode: '' })
    setShowModal('project')
  }

  const openCreateTeam = () => {
    setEditItem(null)
    setForm({ name: '', projectId: projects[0]?.id || '', leadEmployeeCode: '' })
    setShowModal('team')
  }

  const openEditTeam = (team) => {
    setEditItem(team)
    setForm({ name: team.name, projectId: team.projectId, leadEmployeeCode: '' })
    setShowModal('team')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (showModal === 'project' && !form.name) return toast.error('Project name is required')
    if (showModal === 'team') {
      if (!form.name) return toast.error('Team name is required')
      if (!form.projectId) return toast.error('Project is required')
    }

    setSaving(true)
    try {
      if (editItem) {
        await workspaceAPI.updateProject(editItem.id, { name: form.name })
        toast.success('Updated successfully')
      } else if (showModal === 'project') {
        await workspaceAPI.createProject({ name: form.name })
        toast.success('Project created')
      } else {
        await workspaceAPI.createTeam({ name: form.name, projectId: form.projectId, leadEmployeeCode: form.leadEmployeeCode })
        toast.success('Team created')
      }
      setShowModal(null)
      setEditItem(null)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} /></div>
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects & Teams</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{projects.length} projects, {(projects || []).reduce((a, p) => a + (p.teams?.length || 0), 0)} teams</p>
        </div>
        <div className="flex gap-3">
          <button onClick={openCreateTeam} className="btn-secondary">
            <Plus className="h-4 w-4" /> New Team
          </button>
          <button onClick={openCreateProject} className="btn-primary">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="card overflow-hidden p-0">
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)' }}>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5" style={{ color: 'var(--moss)' }} />
                <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>{project.name}</h3>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>({project.teams?.length || 0} teams)</span>
              </div>
              <button onClick={() => openEditProject(project)} className="btn-ghost p-1.5">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div>
              {(project.teams || []).length === 0 ? (
                <p className="px-6 py-4 text-sm" style={{ color: 'var(--muted)' }}>No teams in this project</p>
              ) : (
                project.teams.map((team) => (
                  <div key={team.id} className="px-6 py-3 flex items-center justify-between table-row-hover" style={{ borderBottom: '1px solid var(--line)' }}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" style={{ color: 'var(--muted)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{team.name}</span>
                      {team.leadName && <span className="text-xs ml-2" style={{ color: 'var(--muted)' }}>Lead: {team.leadName}</span>}
                    </div>
                    <button onClick={() => openEditTeam(team)} className="btn-ghost p-1.5">
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {(showModal === 'project' || showModal === 'team') && (
        <div className="modal-overlay" onClick={() => { setShowModal(null); setEditItem(null) }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <h3 className="font-extrabold" style={{ color: 'var(--ink)' }}>
                {editItem ? 'Edit' : 'New'} {showModal === 'project' ? 'Project' : 'Team'}
              </h3>
              <button onClick={() => { setShowModal(null); setEditItem(null) }} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="input-field" required />
              </div>

              {showModal === 'team' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Project</label>
                    <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                      className="input-field" required>
                      <option value="">Select project</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Team Lead (Employee Code)</label>
                    <input value={form.leadEmployeeCode} onChange={e => setForm(f => ({ ...f, leadEmployeeCode: e.target.value }))}
                      placeholder="Optional" className="input-field" />
                    <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Enter employee code of the team lead</p>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <button type="button" onClick={() => { setShowModal(null); setEditItem(null) }} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editItem ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
