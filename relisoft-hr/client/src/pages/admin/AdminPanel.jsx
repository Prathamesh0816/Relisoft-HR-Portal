import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, Server, Settings, Shield, Download, Activity } from 'lucide-react';
import { roleAPI, settingsAPI } from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

const modules = ['Employees', 'Leave', 'Attendance', 'Payroll', 'Recruitment', 'Assets', 'Tickets', 'Travel', 'Compliance', 'Performance'];
const actions = ['create', 'read', 'update', 'delete', 'approve'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([]);
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({ name: '', permissions: {} });
  const [settingsForm, setSettingsForm] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const tabs = [
    { key: 'roles', label: 'Roles', icon: Shield },
    { key: 'settings', label: 'Settings', icon: Settings },
    { key: 'system', label: 'System', icon: Server },
  ];

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await roleAPI.getAll();
      const rolesData = Array.isArray(data) ? data : data.data || [];
      setRoles(rolesData);
    } catch (err) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.getAll();
      const settingsData = Array.isArray(data) ? data : data.data || [];
      setSettings(settingsData);
      const form = {};
      settingsData.forEach((s) => { form[s.key] = s.value; });
      setSettingsForm(form);
      const maint = settingsData.find((s) => s.key === 'maintenance_mode');
      if (maint) setMaintenanceMode(maint.value === 'true');
    } catch (err) {
      toast.error('Failed to fetch settings');
    }
  };

  useEffect(() => {
    if (activeTab === 'roles') fetchRoles();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        await roleAPI.update(editingRole._id, roleForm);
        toast.success('Role updated');
      } else {
        await roleAPI.create(roleForm);
        toast.success('Role created');
      }
      setShowRoleModal(false);
      setEditingRole(null);
      setRoleForm({ name: '', permissions: {} });
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (id) => {
    if (!window.confirm('Delete this role?')) return;
    try {
      await roleAPI.delete(id);
      toast.success('Role deleted');
      fetchRoles();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const togglePermission = (role, module, action) => {
    const updated = { ...roleForm };
    if (!updated.permissions[module]) updated.permissions[module] = {};
    updated.permissions[module][action] = !updated.permissions[module]?.[action];
    setRoleForm(updated);
  };

  const togglePermissionExisting = async (role, module, action) => {
    try {
      const permissions = { ...(role.permissions || {}) };
      if (!permissions[module]) permissions[module] = {};
      permissions[module][action] = !permissions[module]?.[action];
      await roleAPI.update(role._id, { permissions });
      toast.success('Permission updated');
      fetchRoles();
    } catch (err) {
      toast.error('Failed to update permission');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await settingsAPI.bulkUpdate(settingsForm);
      toast.success('Settings saved');
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const toggleMaintenance = async () => {
    try {
      await settingsAPI.update('maintenance_mode', { value: String(!maintenanceMode) });
      setMaintenanceMode(!maintenanceMode);
      toast.success(`Maintenance mode ${!maintenanceMode ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to toggle maintenance');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
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

      {activeTab === 'roles' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => { setEditingRole(null); setRoleForm({ name: '', permissions: {} }); setShowRoleModal(true); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Role</button>
          </div>
          <div className="table-container">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header">Role</th>
                    {modules.map((m) => <th key={m} className="table-header text-center">{m}</th>)}
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-20" /></td>
                        {modules.map((_, j) => <td key={j} className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto" /></td>)}
                        <td className="table-cell"><div className="h-4 bg-gray-200 rounded animate-pulse w-16" /></td>
                      </tr>
                    ))
                  ) : roles.length === 0 ? (
                    <tr><td colSpan={modules.length + 2} className="table-cell text-center text-gray-500 py-8">No roles found</td></tr>
                  ) : (
                    roles.map((role, i) => (
                      <tr key={role._id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell font-medium">{role.name}</td>
                        {modules.map((m) => {
                          const perms = role.permissions?.[m] || {};
                          const count = Object.values(perms).filter(Boolean).length;
                          return (
                            <td key={m} className="table-cell text-center">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${count === 0 ? 'bg-gray-100 text-gray-500' : count >= 3 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {count}/{actions.length}
                              </span>
                            </td>
                          );
                        })}
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button onClick={() => { setEditingRole(role); setRoleForm({ name: role.name, permissions: role.permissions || {} }); setShowRoleModal(true); }} className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg"><Edit2 size={16} /></button>
                            <button onClick={() => handleDeleteRole(role._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="card">
          <h2 className="card-header">Application Settings</h2>
          <div className="space-y-3">
            {settings.map((s, i) => (
              <div key={s._id || i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-700 w-1/3">{s.key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</label>
                <input
                  type="text"
                  className="input-field flex-1"
                  value={settingsForm[s.key] || ''}
                  onChange={(e) => setSettingsForm({ ...settingsForm, [s.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSaveSettings} className="btn-primary flex items-center gap-2"><Save size={18} /> Save Settings</button>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="card-header">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Application Version</p>
                <p className="text-lg font-semibold text-gray-900">v1.0.0</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Node Environment</p>
                <p className="text-lg font-semibold text-gray-900">{import.meta.env?.MODE || 'production'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">API Status</p>
                <p className="text-lg font-semibold text-green-600">Connected</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="card-header mb-0">Maintenance Mode</h2>
              <button
                onClick={toggleMaintenance}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            <p className="text-sm text-gray-500">When enabled, only administrators can access the system.</p>
          </div>

          <div className="card">
            <h2 className="card-header">System Logs</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto font-mono text-xs bg-gray-50 rounded-lg p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <p key={i} className="text-gray-600">
                  [{new Date(Date.now() - i * 60000).toISOString()}] System running normally — {i === 0 ? 'last check passed' : 'heartbeat ok'}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} title={editingRole ? 'Edit Role' : 'Add Role'} size="lg">
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <input type="text" className="input-field" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {modules.map((module) => (
                <div key={module} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">{module}</p>
                  <div className="flex gap-2 flex-wrap">
                    {actions.map((action) => {
                      const isChecked = roleForm.permissions?.[module]?.[action] || false;
                      return (
                        <label key={action} className="flex items-center gap-1.5 text-xs cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => editingRole ? togglePermissionExisting(editingRole, module, action) : togglePermission(editingRole, module, action)}
                            className="rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-500"
                          />
                          {action.charAt(0).toUpperCase() + action.slice(1)}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowRoleModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingRole ? 'Update' : 'Create'} Role</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminPanel;
