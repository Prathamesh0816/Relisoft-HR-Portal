import { useState, useEffect } from 'react';
import {
  Users, CalendarCheck, Briefcase, Ticket, Bell,
  UserPlus, DollarSign, BarChart3,
  Loader2, ArrowRight, AlertCircle, CheckCircle, XCircle,
  TrendingUp, Sparkles, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import { getTheme } from '../../config/themes';

const statCards = [
  { label: 'Total Employees', value: '--', icon: Users, color: '#2563eb', change: '+12 this month' },
  { label: 'Active Leaves', value: '--', icon: CalendarCheck, color: '#f59e0b', change: '3 pending approval' },
  { label: 'Open Positions', value: '--', icon: Briefcase, color: '#118c83', change: '5 new this week' },
  { label: 'Pending Tickets', value: '--', icon: Ticket, color: '#bb3b67', change: '8 unresolved' },
];

const quickActions = [
  { label: 'Add Employee', icon: UserPlus },
  { label: 'Apply Leave', icon: CalendarCheck },
  { label: 'Process Payroll', icon: DollarSign },
  { label: 'View Reports', icon: BarChart3 },
];

const recentActivities = [
  { text: 'John Doe submitted leave request', time: '2 min ago', type: 'leave' },
  { text: 'New application for Senior Developer', time: '15 min ago', type: 'recruitment' },
  { text: 'Sarah Smith marked attendance', time: '1 hour ago', type: 'attendance' },
  { text: 'Payroll for March processed', time: '2 hours ago', type: 'payroll' },
  { text: 'New employee onboarded', time: '3 hours ago', type: 'onboarding' },
];

const notifications = [
  { text: 'Leave requests pending approval', count: 3, type: 'warning' },
  { text: 'Employees yet to mark attendance', count: 12, type: 'danger' },
  { text: 'Upcoming performance reviews', count: 5, type: 'info' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const theme = useAuthStore((s) => s.theme);
  const themeConfig = getTheme(theme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: result } = await dashboardAPI.getHR();
      setData(result.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: 'var(--moss)' }} />
          <p style={{ color: 'var(--muted)' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--ink)' }}>
            Welcome back, {user?.name || 'User'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {user?.role === 'admin' ? 'System Administrator' :
             user?.role === 'manager' ? 'Department Manager' :
             'Employee'} Dashboard
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
          <Clock className="h-3.5 w-3.5" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden h-40 lg:h-48 border" style={{ borderColor: 'var(--line)' }}>
        <img src={themeConfig.banner} alt={themeConfig.label} className="w-full h-full object-contain" />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(90deg, color-mix(in srgb, var(--panel) 70%, transparent), transparent)',
        }} />
        <div className="absolute bottom-0 left-0 p-5 lg:p-6">
          <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ background: 'var(--panel)', color: 'var(--moss)' }}>
            <Sparkles className="h-3 w-3" />
            {themeConfig.label}
          </div>
          <p className="text-base lg:text-lg font-bold" style={{ color: 'var(--ink)' }}>{themeConfig.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => {
          const finalValue = data?.[
            ['totalEmployees', 'activeLeaves', 'openPositions', 'pendingTickets'][index]
          ] ?? stat.value;
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card group">
              <div className="p-3 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: `${stat.color}14` }}>
                <Icon className="h-6 w-6" style={{ color: stat.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted)' }}>{stat.label}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>{finalValue}</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{
                    background: `${stat.color}10`,
                    color: stat.color
                  }}>{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card card-accent">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5" style={{ color: 'var(--moss)' }} />
              <h3 className="font-extrabold" style={{ color: 'var(--ink)' }}>Overview</h3>
            </div>
            <div className="h-64 rounded-lg flex items-center justify-center" style={{ background: 'var(--paper)' }}>
              <div className="text-center">
                <BarChart3 className="h-16 w-16 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.3 }} />
                <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Chart visualization area</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>HR metrics overview will render here</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-3" style={{ color: 'var(--muted)' }}>
              <Sparkles className="h-3.5 w-3.5 inline mr-1" style={{ color: 'var(--moss)' }} />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    className="card flex items-center gap-3 py-4 px-5 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg icon-gradient">
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: 'var(--ink)' }}>{action.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto" style={{ color: 'var(--muted)' }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4" style={{ color: 'var(--moss)' }} />
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--ink)' }}>Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 pb-3" style={{ borderBottom: i < recentActivities.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div className="w-2 h-2 mt-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--moss)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--ink)' }}>{activity.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" style={{ color: 'var(--moss)' }} />
              <h3 className="font-extrabold text-sm" style={{ color: 'var(--ink)' }}>Notifications</h3>
            </div>
            <div className="space-y-2">
              {notifications.map((notif, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--paper)' }}>
                  <div className="flex items-center gap-2 min-w-0">
                    {notif.type === 'warning' && <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--copper)' }} />}
                    {notif.type === 'danger' && <XCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />}
                    {notif.type === 'info' && <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--teal)' }} />}
                    <span className="text-sm truncate" style={{ color: 'var(--ink)' }}>{notif.text}</span>
                  </div>
                  <span className="badge-danger text-xs font-bold px-2 py-0.5 flex-shrink-0 ml-2">{notif.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
