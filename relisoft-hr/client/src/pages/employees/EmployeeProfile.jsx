import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Camera, Edit2, Save, X, User, CreditCard,
  FileText, GitBranch, Mail, Phone, MapPin, Calendar,
  Briefcase, Building2, Loader2, Upload, Download, Check,
  ChevronRight, ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { employeeAPI } from '../../services/api';

const tabs = [
  { id: 'personal', label: 'Personal Information', icon: User },
  { id: 'bank', label: 'Bank Details', icon: CreditCard },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'hierarchy', label: 'Reporting Hierarchy', icon: GitBranch },
];

const initialForm = {
  name: '', email: '', phone: '', department: '', designation: '',
  status: 'Active', joinDate: '', address: '', employeeId: '',
  dateOfBirth: '', emergencyContact: '', bloodGroup: '',
  bankName: '', accountNumber: '', ifscCode: '', panNumber: '',
};

function HierarchyNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div style={{ marginLeft: level * 30 }}>
      <div className={`flex items-center py-2 px-3 rounded-lg ${level === 0 ? 'bg-relisoft-50 border border-relisoft-200' : 'hover:bg-gray-50'}`}>
        {hasChildren && (
          <button onClick={() => setExpanded(!expanded)} className="mr-2">
            {expanded ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">
            {node.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-900">{node.name}</p>
          <p className="text-xs text-gray-500">{node.designation || node.position}</p>
        </div>
        {level === 0 && (
          <span className="ml-auto text-xs bg-relisoft-100 text-relisoft-700 px-2 py-0.5 rounded-full">Self</span>
        )}
      </div>
      {expanded && hasChildren && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4 mt-1 space-y-1">
          {node.children.map((child, i) => (
            <HierarchyNode key={i} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    try {
      const { data } = await employeeAPI.getById(id);
      setEmployee(data);
      populateForm(data);
    } catch (err) {
      toast.error('Failed to load employee profile');
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (emp) => {
    setForm({
      name: emp.name || '', email: emp.email || '', phone: emp.phone || '',
      department: emp.department || '', designation: emp.designation || '',
      status: emp.status || 'Active', joinDate: emp.joinDate ? emp.joinDate.split('T')[0] : '',
      address: emp.address || '', employeeId: emp.employeeId || '',
      dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
      emergencyContact: emp.emergencyContact || '', bloodGroup: emp.bloodGroup || '',
      bankName: emp.bankName || '', accountNumber: emp.accountNumber || '',
      ifscCode: emp.ifscCode || '', panNumber: emp.panNumber || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await employeeAPI.update(id, form);
      setEmployee(data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-relisoft-600" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        <p>Employee not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/employees')} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" /> Back to Employees
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-relisoft-100 rounded-full flex items-center justify-center">
                {employee.profileImage ? (
                  <img src={employee.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-relisoft-700">
                    {employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              {editing && (
                <button className="absolute bottom-0 right-0 p-1.5 bg-relisoft-600 text-white rounded-full hover:bg-relisoft-700">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
                  <p className="text-gray-500">{employee.designation} - {employee.department}</p>
                </div>
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    editing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-relisoft-600 text-white hover:bg-relisoft-700'
                  }`}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : editing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                  {editing ? 'Save Changes' : 'Edit Profile'}
                </button>
              </div>
              {editing && (
                <button onClick={() => { setEditing(false); populateForm(employee); }} className="text-sm text-gray-500 hover:text-gray-700 mt-1 flex items-center">
                  <X className="h-3 w-3 mr-1" /> Cancel editing
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
            {employee.email && <span className="flex items-center"><Mail className="h-4 w-4 mr-1" /> {employee.email}</span>}
            {employee.phone && <span className="flex items-center"><Phone className="h-4 w-4 mr-1" /> {employee.phone}</span>}
            {employee.employeeId && <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1" /> ID: {employee.employeeId}</span>}
          </div>
        </div>

        <div className="flex space-x-1 mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-relisoft-50 text-relisoft-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Full Name', key: 'name', type: 'text' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'Phone', key: 'phone', type: 'text' },
                  { label: 'Department', key: 'department', type: 'text' },
                  { label: 'Designation', key: 'designation', type: 'text' },
                  { label: 'Employee ID', key: 'employeeId', type: 'text' },
                  { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
                  { label: 'Join Date', key: 'joinDate', type: 'date' },
                  { label: 'Blood Group', key: 'bloodGroup', type: 'text' },
                  { label: 'Emergency Contact', key: 'emergencyContact', type: 'text' },
                  { label: 'Status', key: 'status', type: 'text' },
                  { label: 'PAN Number', key: 'panNumber', type: 'text' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-gray-500 mb-1">{field.label}</label>
                    {editing ? (
                      field.key === 'status' ? (
                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm">
                          <option>Active</option><option>Inactive</option><option>On Leave</option>
                        </select>
                      ) : (
                        <input type={field.type} value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" />
                      )
                    ) : (
                      <p className="text-gray-900">{employee[field.key] || '--'}</p>
                    )}
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Address</label>
                {editing ? (
                  <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" rows={2} />
                ) : (
                  <p className="text-gray-900">{employee.address || '--'}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'bank' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Bank Name', key: 'bankName' },
                  { label: 'Account Number', key: 'accountNumber' },
                  { label: 'IFSC Code', key: 'ifscCode' },
                  { label: 'PAN Number', key: 'panNumber' },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-gray-500 mb-1">{field.label}</label>
                    {editing ? (
                      <input type="text" value={form[field.key]} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" />
                    ) : (
                      <p className="text-gray-900">{employee[field.key] || '--'}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
              {editing && (
                <button className="flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-relisoft-400 hover:text-relisoft-600 mb-4 w-full justify-center">
                  <Upload className="h-5 w-5 mr-2" /> Upload Document
                </button>
              )}
              <div className="space-y-2">
                {(employee.documents && employee.documents.length > 0 ? employee.documents : []).map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <button className="flex items-center text-relisoft-600 hover:text-relisoft-700 text-sm">
                      <Download className="h-4 w-4 mr-1" /> Download
                    </button>
                  </div>
                ))}
                {(!employee.documents || employee.documents.length === 0) && (
                  <p className="text-gray-400 text-sm text-center py-8">No documents uploaded yet</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reporting Hierarchy</h3>
              {employee.hierarchy ? (
                <HierarchyNode node={employee.hierarchy} />
              ) : (
                <div className="space-y-2">
                  <HierarchyNode node={{ name: employee.name, designation: employee.designation, children: [] }} />
                  <p className="text-xs text-gray-400 mt-4">No reporting hierarchy configured</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
