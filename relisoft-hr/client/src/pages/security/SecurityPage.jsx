import { useState } from 'react';
import { Shield, Users, Key, FileText, Eye, EyeOff, History, RefreshCw, Monitor, Smartphone } from 'lucide-react';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const MOCK_AUDIT_LOGS = Array.from({ length: 15 }).map((_, i) => ({
  id: i + 1,
  user: ['Admin', 'Manager', 'Employee'][i % 3] + ' ' + (100 + i),
  action: ['Login', 'Update', 'Create', 'Delete', 'Export'][i % 5],
  module: ['Employees', 'Leave', 'Payroll', 'Settings', 'Reports'][i % 5],
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  ip: `192.168.1.${i + 10}`,
}));

const SecurityPage = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [showPasswordPolicy, setShowPasswordPolicy] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [mfaUsers, setMfaUsers] = useState([
    { id: 1, name: 'Admin', email: 'admin@relisofttechnologies.com', mfa: true },
    { id: 2, name: 'Manager 1', email: 'manager1@relisofttechnologies.com', mfa: false },
    { id: 3, name: 'Employee 1', email: 'emp1@relisofttechnologies.com', mfa: false },
  ]);
  const [passwordPolicy, setPasswordPolicy] = useState({
    minLength: '8', requireUppercase: true, requireNumbers: true, requireSpecial: true, expiryDays: '90',
  });
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome / Windows', ip: '192.168.1.100', lastActive: '5 min ago', current: true },
    { id: 2, device: 'Safari / macOS', ip: '192.168.1.101', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Mobile App / iOS', ip: '192.168.1.102', lastActive: '1 day ago', current: false },
  ]);

  const tabs = [
    { key: 'rbac', label: 'RBAC Summary', icon: Shield },
    { key: 'mfa', label: 'MFA Settings', icon: Key },
    { key: 'audit', label: 'Audit Logs', icon: FileText },
    { key: 'sessions', label: 'Sessions', icon: Monitor },
  ];

  const handleToggleMfa = (id) => {
    setMfaUsers((prev) => prev.map((u) => u.id === id ? { ...u, mfa: !u.mfa } : u));
    toast.success('MFA setting updated');
  };

  const handleSavePasswordPolicy = (e) => {
    e.preventDefault();
    toast.success('Password policy saved');
    setShowPasswordPolicy(false);
  };

  const handleTerminateSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast.success('Session terminated');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Security Settings</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'rbac' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-header mb-0">Role-Based Access Control Summary</h2>
            <button onClick={() => setShowPasswordPolicy(true)} className="btn-secondary flex items-center gap-1 text-xs"><Key size={14} /> Password Policy</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">Role</th>
                  <th className="table-header">Users</th>
                  <th className="table-header">Modules</th>
                  <th className="table-header">Access Level</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'Super Admin', users: 2, modules: 'All', level: 'Full Access' },
                  { role: 'HR Manager', users: 5, modules: 'Employees, Leave, Payroll, Attendance', level: 'Read/Write' },
                  { role: 'Department Head', users: 8, modules: 'Leave, Performance', level: 'Read/Approve' },
                  { role: 'Employee', users: 120, modules: 'My Profile, Leave, Attendance', level: 'Self-Service' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{row.role}</td>
                    <td className="table-cell">{row.users}</td>
                    <td className="table-cell text-xs">{row.modules}</td>
                    <td className="table-cell"><span className="badge badge-info">{row.level}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mfa' && (
        <div className="card">
          <h2 className="card-header">Multi-Factor Authentication</h2>
          <p className="text-sm text-gray-500 mb-4">Manage MFA settings for users</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">User</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">MFA Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mfaUsers.map((u, i) => (
                  <tr key={u.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{u.name}</td>
                    <td className="table-cell">{u.email}</td>
                    <td className="table-cell">
                      <span className={`badge ${u.mfa ? 'badge-success' : 'badge-gray'}`}>{u.mfa ? 'Enabled' : 'Disabled'}</span>
                    </td>
                    <td className="table-cell">
                      <button onClick={() => handleToggleMfa(u.id)} className={`btn-${u.mfa ? 'danger' : 'success'} text-xs px-2 py-1`}>
                        {u.mfa ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="card-header mb-0">Audit Logs</h2>
            <button onClick={() => toast.success('Refreshing logs...')} className="btn-secondary text-xs flex items-center gap-1"><RefreshCw size={14} /> Refresh</button>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">User</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Module</th>
                  <th className="table-header">Timestamp</th>
                  <th className="table-header">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_AUDIT_LOGS.map((log, i) => (
                  <tr key={log.id || i} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell font-medium">{log.user}</td>
                    <td className="table-cell">
                      <span className={`badge ${log.action === 'Login' ? 'badge-info' : log.action === 'Delete' ? 'badge-danger' : log.action === 'Create' ? 'badge-success' : 'badge-warning'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">{log.module}</td>
                    <td className="table-cell text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="table-cell text-xs font-mono">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="card">
          <h2 className="card-header">Session Management</h2>
          <p className="text-sm text-gray-500 mb-4">Active user sessions</p>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={s.id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border">
                    {s.current ? <Smartphone size={18} className="text-relisoft-600" /> : <Monitor size={18} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.device} {s.current && <span className="badge badge-success text-[10px]">Current</span>}</p>
                    <p className="text-xs text-gray-500">IP: {s.ip} · Last active: {s.lastActive}</p>
                  </div>
                </div>
                {!s.current && (
                  <button onClick={() => handleTerminateSession(s.id)} className="btn-danger text-xs px-2 py-1">Terminate</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={showPasswordPolicy} onClose={() => setShowPasswordPolicy(false)} title="Password Policy" size="lg">
        <form onSubmit={handleSavePasswordPolicy} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Length</label>
            <input type="number" className="input-field" value={passwordPolicy.minLength} onChange={(e) => setPasswordPolicy({ ...passwordPolicy, minLength: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Expiry (days)</label>
            <input type="number" className="input-field" value={passwordPolicy.expiryDays} onChange={(e) => setPasswordPolicy({ ...passwordPolicy, expiryDays: e.target.value })} />
          </div>
          <div className="space-y-2">
            {[
              { key: 'requireUppercase', label: 'Require uppercase letters' },
              { key: 'requireNumbers', label: 'Require numbers' },
              { key: 'requireSpecial', label: 'Require special characters' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={passwordPolicy[opt.key]} onChange={(e) => setPasswordPolicy({ ...passwordPolicy, [opt.key]: e.target.checked })} className="rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-500" />
                {opt.label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowPasswordPolicy(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Policy</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SecurityPage;
