import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import {
  Activity, AlertTriangle, Users, BarChart3, BrainCircuit,
  GitBranch, Brain, TrendingUp, FileText, Bot, Upload,
  Shield, Eye, UserCircle
} from 'lucide-react'

const roleLabels = {
  superadmin: { title: 'Full Access', color: 'bg-purple-100 text-purple-800' },
  admin: { title: 'Full Access', color: 'bg-red-100 text-red-800' },
  hr: { title: 'HR Administrator', color: 'bg-blue-100 text-blue-800' },
  manager: { title: 'Team Manager', color: 'bg-green-100 text-green-800' },
  employee: { title: 'Team Member', color: 'bg-gray-100 text-gray-800' },
  finance: { title: 'Finance', color: 'bg-yellow-100 text-yellow-800' },
  it: { title: 'IT Support', color: 'bg-indigo-100 text-indigo-800' },
}

const modulesByRole = {
  admin: [
    { path: '/resilience/dashboard', label: 'Org Health Dashboard', icon: Activity, desc: 'View organizational health metrics and KPI scores', roles: ['admin', 'hr', 'manager'] },
    { path: '/resilience/whatif', label: 'What-If Simulator', icon: BrainCircuit, desc: 'Run attrition, workload, and restructuring scenarios', roles: ['admin', 'hr'] },
    { path: '/resilience/spof', label: 'SPOF Ranking', icon: AlertTriangle, desc: 'Identify single points of failure', roles: ['admin', 'hr'] },
    { path: '/resilience/employees', label: 'Employee Directory', icon: Users, desc: 'Browse all employees', roles: ['admin', 'hr', 'manager'] },
    { path: '/resilience/skill-gaps', label: 'Skill Gap Analysis', icon: BarChart3, desc: 'Team-level knowledge coverage', roles: ['admin', 'hr', 'manager'] },
    { path: '/resilience/succession', label: 'Succession Planning', icon: GitBranch, desc: 'Backfill readiness for critical roles', roles: ['admin', 'hr'] },
    { path: '/resilience/knowledge-concentration', label: 'Knowledge Risk', icon: Brain, desc: 'Bus-factor analysis', roles: ['admin', 'hr', 'manager'] },
    { path: '/resilience/workforce-readiness', label: 'Workforce Readiness', icon: TrendingUp, desc: 'Project pipeline vs capacity', roles: ['admin', 'hr'] },
    { path: '/resilience/report', label: 'Resilience Report', icon: FileText, desc: 'Download printable HTML report', roles: ['admin', 'hr', 'manager'] },
    { path: '/resilience/assistant', label: 'AI Assistant', icon: Bot, desc: 'Natural language workforce Q&A', roles: ['admin', 'hr', 'manager', 'employee'] },
    { path: '/resilience/upload', label: 'Upload Data', icon: Upload, desc: 'Upload CSV/XLSX datasets', roles: ['admin'] },
  ],
}

export default function ResilienceLanding() {
  const { user } = useAuthStore()
  const role = user?.role || 'employee'
  const roleInfo = roleLabels[role] || roleLabels.employee
  
  // Filter modules by user role
  const allModules = modulesByRole.admin
  const accessibleModules = allModules.filter(m => m.roles.includes(role))

  // Determine role-based restrictions
  const isViewOnly = !['admin', 'hr', 'superadmin'].includes(role)
  const isEmployeeOnly = role === 'employee'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ReliSoft Workforce Resilience</h1>
          <p className="text-gray-500 mt-1">Predict. Simulate. Strengthen.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
            <Shield className="h-3 w-3 inline mr-1" />
            {roleInfo.title}
          </div>
        </div>
      </div>

      {/* Role-based welcome */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-full bg-relisoft-100 flex items-center justify-center">
            <UserCircle className="h-8 w-8 text-relisoft-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {user?.name || 'User'}
            </h2>
            <p className="text-gray-500 mt-1">
              {role === 'admin' && 'You have full access to all workforce resilience features including simulations, AI analysis, data upload, and configuration.'}
              {role === 'hr' && 'You can view analytics, run simulations, manage feedback, and generate reports.'}
              {role === 'manager' && 'You can view team health metrics, identify skill gaps, and track workforce readiness.'}
              {role === 'employee' && 'You can view your own profile, upskilling recommendations, and use the AI assistant for Q&A.'}
              {!['admin', 'hr', 'manager', 'employee'].includes(role) && 'You have limited access to workforce resilience features.'}
            </p>
          </div>
        </div>
        {isViewOnly && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
            <Eye className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700">
              {isEmployeeOnly
                ? 'You are in view-only mode. Contact your HR administrator for simulation and analysis access.'
                : 'Some advanced features are restricted. Contact your administrator for full access.'}
            </p>
          </div>
        )}
      </div>

      {/* Module navigation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accessibleModules.map((mod) => (
          <Link
            key={mod.path}
            to={mod.path}
            className="bg-white rounded-xl border border-gray-200 p-5 hover:border-relisoft-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-relisoft-50 flex items-center justify-center group-hover:bg-relisoft-100 transition-colors">
                <mod.icon className="h-5 w-5 text-relisoft-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-relisoost-700 transition-colors">
                  {mod.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{mod.desc}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center text-xs text-relisoft-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Access module →
            </div>
          </Link>
        ))}
      </div>

      {/* Role-based info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-relisoft-50 to-white rounded-xl border border-relisoft-200 p-5">
          <Activity className="h-6 w-6 text-relisoft-600 mb-2" />
          <h3 className="font-semibold text-gray-900">4-Pillar Health Model</h3>
          <p className="text-sm text-gray-500 mt-1">Resilience · Trust · Burnout · Retention — comprehensive org health scoring.</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 p-5">
          <BrainCircuit className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">AI-Powered Insights</h3>
          <p className="text-sm text-gray-500 mt-1">Intelligent risk detection, what-if simulations, and actionable recommendations.</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 p-5">
          <Shield className="h-6 w-6 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Human-in-the-Loop</h3>
          <p className="text-sm text-gray-500 mt-1">Review AI suggestions, apply decisions, and track organizational improvements.</p>
        </div>
      </div>
    </div>
  )
}
