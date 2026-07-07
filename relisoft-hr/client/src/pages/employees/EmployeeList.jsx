import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Plus, Edit2, Trash2, Filter, X, Loader2,
  ChevronLeft, ChevronRight, Users, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeAPI } from '../../services/api';

const departments = ['Engineering', 'HR', 'Marketing', 'Finance', 'Operations', 'Sales', 'Design'];
const statuses = ['Active', 'Inactive', 'On Leave'];

const initialForm = {
  name: '', email: '', phone: '', department: '', designation: '',
  status: 'Active', joinDate: '', address: '', employeeId: '',
};

const demoEmployees = [
  { _id: 'e1', employeeId: 'EMP001', name: 'Priya Sharma', email: 'priya.sharma@relisofttechnologies.com', phone: '+91 98765 43210', department: 'Engineering', designation: 'Senior Developer', status: 'Active', joinDate: '2024-01-15', address: 'Mumbai' },
  { _id: 'e2', employeeId: 'EMP002', name: 'Arun Kumar', email: 'arun.kumar@relisofttechnologies.com', phone: '+91 98765 43211', department: 'Finance', designation: 'Accountant', status: 'Active', joinDate: '2024-02-01', address: 'Pune' },
  { _id: 'e3', employeeId: 'EMP003', name: 'Neha Patel', email: 'neha.patel@relisofttechnologies.com', phone: '+91 98765 43212', department: 'Marketing', designation: 'Marketing Lead', status: 'Active', joinDate: '2024-03-10', address: 'Mumbai' },
  { _id: 'e4', employeeId: 'EMP004', name: 'Rahul Verma', email: 'rahul.verma@relisofttechnologies.com', phone: '+91 98765 43213', department: 'Engineering', designation: 'Product Manager', status: 'Active', joinDate: '2024-01-20', address: 'Delhi' },
  { _id: 'e5', employeeId: 'EMP005', name: 'Sneha Gupta', email: 'sneha.gupta@relisofttechnologies.com', phone: '+91 98765 43214', department: 'HR', designation: 'HR Executive', status: 'Active', joinDate: '2024-04-01', address: 'Bangalore' },
  { _id: 'e6', employeeId: 'EMP006', name: 'Vikram Joshi', email: 'vikram.joshi@relisofttechnologies.com', phone: '+91 98765 43215', department: 'Engineering', designation: 'DevOps Engineer', status: 'Active', joinDate: '2024-05-15', address: 'Pune' },
  { _id: 'e7', employeeId: 'EMP007', name: 'Ananya Reddy', email: 'ananya.reddy@relisofttechnologies.com', phone: '+91 98765 43216', department: 'Design', designation: 'UI/UX Designer', status: 'Active', joinDate: '2024-06-01', address: 'Hyderabad' },
  { _id: 'e8', employeeId: 'EMP008', name: 'Karthik Nair', email: 'karthik.nair@relisofttechnologies.com', phone: '+91 98765 43217', department: 'Operations', designation: 'Operations Manager', status: 'On Leave', joinDate: '2024-02-15', address: 'Mumbai' },
  { _id: 'e9', employeeId: 'EMP009', name: 'Divya Singh', email: 'divya.singh@relisofttechnologies.com', phone: '+91 98765 43218', department: 'Sales', designation: 'Sales Executive', status: 'Active', joinDate: '2024-07-01', address: 'Delhi' },
  { _id: 'e10', employeeId: 'EMP010', name: 'Rohan Desai', email: 'rohan.desai@relisofttechnologies.com', phone: '+91 98765 43219', department: 'Engineering', designation: 'Junior Developer', status: 'Active', joinDate: '2025-01-10', address: 'Mumbai' },
];

export default function EmployeeList() {
  const [employees, setEmployees] = useState(demoEmployees);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ department: '', status: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [page, filters]);

  const loadEmployees = async () => {
    try {
      const params = { page, limit: 10, ...filters };
      if (search) params.search = search;
      const { data } = await employeeAPI.list(params);
      if (data?.employees?.length || data?.data?.length) {
        setEmployees(data.employees || data.data || []);
        setTotalPages(data.totalPages || data.pages || 1);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadEmployees();
  };

  const openAdd = () => {
    setEditing(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setForm({
      name: emp.name || '',
      email: emp.email || '',
      phone: emp.phone || '',
      department: emp.department || '',
      designation: emp.designation || '',
      status: emp.status || 'Active',
      joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
      address: emp.address || '',
      employeeId: emp.employeeId || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await employeeAPI.update(editing._id, form);
        toast.success('Employee updated successfully');
      } else {
        await employeeAPI.create(form);
        toast.success('Employee added successfully');
      }
      setShowModal(false);
      loadEmployees();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeAPI.delete(id);
      toast.success('Employee deleted successfully');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to delete employee');
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'Active': return { background: 'rgba(34,197,94,0.12)', color: '#166534' };
      case 'Inactive': return { background: 'rgba(239,68,68,0.12)', color: '#991b1b' };
      default: return { background: 'rgba(245,158,11,0.12)', color: '#92400e' };
    }
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Manage your workforce</p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="input-field pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-ghost inline-flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
            <select
              value={filters.department}
              onChange={(e) => { setFilters({ ...filters, department: e.target.value }); setPage(1); }}
              className="input-field"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={filters.status}
              onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
              className="input-field"
            >
              <option value="">All Status</option>
              {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--moss)' }} />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--muted)' }}>
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" style={{ color: 'var(--muted)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--ink)' }}>No employees found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'var(--paper)' }}>
                  <th className="table-header px-6">Name</th>
                  <th className="table-header px-6">Employee ID</th>
                  <th className="table-header px-6">Department</th>
                  <th className="table-header px-6">Designation</th>
                  <th className="table-header px-6">Status</th>
                  <th className="table-header px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id} className="table-row-hover">
                    <td className="table-cell px-6">
                      <Link to={`/employees/${emp._id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white icon-gradient flex-shrink-0">
                          {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: 'var(--ink)' }}>{emp.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>{emp.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="table-cell px-6" style={{ color: 'var(--muted)' }}>{emp.employeeId}</td>
                    <td className="table-cell px-6" style={{ color: 'var(--muted)' }}>{emp.department}</td>
                    <td className="table-cell px-6" style={{ color: 'var(--muted)' }}>{emp.designation}</td>
                    <td className="table-cell px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={statusStyle(emp.status)}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="table-cell px-6 text-right">
                      <button onClick={() => openEdit(emp)} className="btn-ghost p-1.5 inline-flex">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(emp._id)} className="btn-ghost p-1.5 inline-flex ml-1" style={{ color: 'var(--danger)' }}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: '1px solid var(--line)', background: 'var(--paper)' }}>
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="btn-ghost inline-flex items-center text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </button>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="btn-ghost inline-flex items-center text-sm"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <h3 className="text-lg font-extrabold" style={{ color: 'var(--ink)' }}>{editing ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowModal(false)} className="btn-ghost p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Employee ID</label>
                  <input type="text" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Phone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Department</label>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="input-field" required>
                    <option value="">Select</option>
                    {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Designation</label>
                  <input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                    className="input-field" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field">
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Join Date</label>
                  <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field" rows={2} />
              </div>
              <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editing ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
