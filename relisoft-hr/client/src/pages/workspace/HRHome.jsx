import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, UserPlus, ClipboardCheck, Building2, Shield, Upload, CalendarClock, FileText, Users } from 'lucide-react'
import { workspaceAPI } from '../../services/api'

const actions = [
  { label: 'New Employee', path: '/employees', icon: UserPlus, desc: 'Register a new employee' },
  { label: 'Leave Review', path: '/leaves', icon: ClipboardCheck, desc: 'Approve/reject requests' },
  { label: 'Projects & Teams', path: '/workspace/projects', icon: Building2, desc: 'Manage org structure' },
  { label: 'HR Policies', path: '/hr/policy', icon: Shield, desc: 'Configure settings' },
  { label: 'Bulk Upload', path: '/excel/upload', icon: Upload, desc: 'Excel import' },
  { label: 'Directory', path: '/workspace/directory', icon: Users, desc: 'Employee directory' },
]

export default function HRHome() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try { const r = await workspaceAPI.getDirectory(); setData(r.data) }
    catch { /* silent */ }
    finally { setLoading(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">HR Home</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{data?.employees?.length || 0} employees &middot; {data?.projects?.length || 0} projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <Link key={a.label} to={a.path}
              className="card flex items-start gap-4 py-5 px-5 transition-all hover:-translate-y-0.5 group">
              <div className="p-3 rounded-lg icon-gradient flex-shrink-0">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--ink)' }}>{a.label}</h3>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{a.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--ink)' }}>
            <CalendarClock className="h-4 w-4 mr-2" style={{ color: 'var(--moss)' }} /> My Quick Links
          </h3>
          <div className="space-y-2">
            {[{ label: 'My Leave', path: '/leaves' }, { label: 'My Onboarding', path: '/onboarding/my' }, { label: 'Directory', path: '/workspace/directory' }].map(link => (
              <Link key={link.path} to={link.path} className="block text-sm py-1 transition-colors" style={{ color: 'var(--moss)' }}>{link.label}</Link>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--ink)' }}>
            <FileText className="h-4 w-4 mr-2" style={{ color: 'var(--moss)' }} /> Quick Stats
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--muted)' }}>
            <p>Employees: <strong style={{ color: 'var(--ink)' }}>{data?.employees?.length || 0}</strong></p>
            <p>Projects: <strong style={{ color: 'var(--ink)' }}>{data?.projects?.length || 0}</strong></p>
            <p>Teams: <strong style={{ color: 'var(--ink)' }}>{data?.projects?.reduce((a, p) => a + (p.teams?.length || 0), 0) || 0}</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
