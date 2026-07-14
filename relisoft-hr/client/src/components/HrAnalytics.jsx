import { useState, useEffect } from 'react'
import { getDashboardStats } from '../api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, Users, Briefcase, ClipboardCheck, AlertTriangle } from 'lucide-react'
import useStore from '../store'

const COLORS = ['#f5a623', '#002349', '#0d9488', '#e11d48', '#16a34a', '#ea580c']

export default function HrAnalytics() {
  const [stats, setStats] = useState(null)
  const { dashboard, setDashboard } = useStore()

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-gold-1/30 border-t-gold-1 rounded-full animate-spin" />
      </div>
    )
  }

  const departmentData = stats.departmentCounts?.map(d => ({ name: d.department, value: d.count })) || []
  const pieData = departmentData

  const kpiCards = [
    { label: 'Total Employees', value: stats.totalEmployees, icon: Users, change: '+12%', positive: true },
    { label: 'Open Probations', value: stats.openProbations, icon: Briefcase, change: `${stats.openProbations} active`, positive: null },
    { label: 'Open Appraisals', value: stats.openAppraisals, icon: ClipboardCheck, change: `${stats.openAppraisals} pending`, positive: null },
    { label: 'Open Tickets', value: stats.activeTickets, icon: AlertTriangle, change: stats.activeTickets > 5 ? 'High' : 'Low', positive: stats.activeTickets <= 5 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="card-surface p-4">
            <div className="flex items-center justify-between mb-3">
              <kpi.icon size={20} className="text-gold-1" />
              {kpi.change && (
                <span className={`flex items-center gap-1 text-xs font-bold ${kpi.positive === null ? 'text-muted' : kpi.positive ? 'text-green-600' : 'text-danger'}`}>
                  {kpi.positive === true && <TrendingUp size={12} />}
                  {kpi.positive === false && <TrendingDown size={12} />}
                  {kpi.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-navy dark:text-white">{kpi.value}</div>
            <div className="text-xs font-semibold text-muted dark:text-white/60">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">Department Headcount</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Bar dataKey="value" fill="#f5a623" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">Department Distribution</h3>
          <div className="h-72 flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted dark:text-white/60 text-sm">No department data</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-surface p-5">
        <h3 className="font-heading font-bold text-navy dark:text-white text-lg mb-4">HR Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Teams', value: stats.totalTeams },
            { label: 'Active Probations', value: stats.openProbations },
            { label: 'Open Appraisals', value: stats.openAppraisals },
            { label: "Today's Attendance", value: stats.todayAttendances },
          ].map((item) => (
            <div key={item.label} className="px-4 py-3 rounded-xl bg-sage dark:bg-white/5 text-center">
              <div className="text-xl font-bold text-navy dark:text-white">{item.value}</div>
              <div className="text-xs font-semibold text-muted dark:text-white/60">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
