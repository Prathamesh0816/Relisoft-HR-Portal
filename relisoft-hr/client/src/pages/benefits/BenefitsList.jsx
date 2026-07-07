import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Shield, Activity, Heart, Sun, Leaf, CheckCircle, XCircle, Users, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { benefitsAPI } from '../../services/api';

const tabs = ['Plans Catalog', 'My Benefits', 'Dependents'];

const typeColors = {
  HealthInsurance: 'bg-blue-100 text-blue-800 border-blue-200',
  Dental: 'bg-teal-100 text-teal-800 border-teal-200',
  Life: 'bg-purple-100 text-purple-800 border-purple-200',
  Accidental: 'bg-orange-100 text-orange-800 border-orange-200',
  Wellness: 'bg-green-100 text-green-800 border-green-200',
};

const typeIcons = {
  HealthInsurance: Shield,
  Dental: Activity,
  Life: Heart,
  Accidental: Shield,
  Wellness: Sun,
};

const emptyPlan = { name: '', type: 'HealthInsurance', provider: '', description: '', coverageAmount: 0, premium: 0, isActive: true };
const emptyDependent = { name: '', relation: '', dateOfBirth: '' };

export default function BenefitsList() {
  const [activeTab, setActiveTab] = useState('Plans Catalog');
  const [plans, setPlans] = useState([]);
  const [myBenefits, setMyBenefits] = useState([]);
  const [dependents, setDependents] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showDependentModal, setShowDependentModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [enrollForm, setEnrollForm] = useState({ planId: '', coverageStartDate: '', coverageEndDate: '' });
  const [dependentForm, setDependentForm] = useState(emptyDependent);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Plans Catalog') {
        const { data } = await benefitsAPI.listPlans();
        setPlans(data.plans || data.data || data || []);
      } else if (activeTab === 'My Benefits') {
        const [benefitsRes, plansRes] = await Promise.all([
          benefitsAPI.listMyBenefits(),
          benefitsAPI.listPlans(),
        ]);
        setMyBenefits(benefitsRes.data.benefits || benefitsRes.data.data || benefitsRes.data || []);
        setAvailablePlans(plansRes.data.plans || plansRes.data.data || plansRes.data || []);
      } else {
        const { data } = await benefitsAPI.listDependents();
        setDependents(data.dependents || data.data || data || []);
      }
    } catch (err) {
      if (activeTab === 'Plans Catalog') setPlans([]);
      else if (activeTab === 'My Benefits') { setMyBenefits([]); setAvailablePlans([]); }
      else setDependents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await benefitsAPI.updatePlan(editing, form);
        toast.success('Plan updated');
      } else {
        await benefitsAPI.createPlan(form);
        toast.success('Plan created');
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyPlan);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await benefitsAPI.enrollInPlan(enrollForm);
      toast.success('Enrolled in plan');
      setShowEnrollModal(false);
      setEnrollForm({ planId: '', coverageStartDate: '', coverageEndDate: '' });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to enroll');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDependent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await benefitsAPI.addDependent(dependentForm);
      toast.success('Dependent added');
      setShowDependentModal(false);
      setDependentForm(emptyDependent);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add dependent');
    } finally {
      setSaving(false);
    }
  };

  const openEditPlan = (plan) => {
    setEditing(plan._id);
    setForm({ name: plan.name, type: plan.type, provider: plan.provider, description: plan.description || '', coverageAmount: plan.coverageAmount, premium: plan.premium, isActive: plan.isActive !== undefined ? plan.isActive : true });
    setShowModal(true);
  };

  const relationColors = {
    Spouse: 'bg-pink-100 text-pink-800',
    Child: 'bg-blue-100 text-blue-800',
    Parent: 'bg-green-100 text-green-800',
    Sibling: 'bg-purple-100 text-purple-800',
    Other: 'bg-gray-100 text-gray-800',
  };

  const renderPlansCatalog = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Benefit Plans Catalog</h2>
        <button onClick={() => { setEditing(null); setForm(emptyPlan); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
          <Plus className="h-5 w-5 mr-2" /> Add Plan
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">No plans found</div>
        ) : plans.map((p, i) => {
          const IconComponent = typeIcons[p.type] || Shield;
          const colorClass = typeColors[p.type] || 'bg-gray-100 text-gray-800 border-gray-200';
          return (
            <div key={p._id || i} className={`bg-white rounded-xl shadow-sm border-2 ${colorClass.split(' ')[2] || 'border-gray-100'} p-6 hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                {p.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="h-3 w-3" /> Inactive
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-1">{p.type.replace(/([A-Z])/g, ' $1').trim()}</p>
              <p className="text-sm text-gray-600 mb-3">{p.provider}</p>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{p.description}</p>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-400">Coverage</p>
                  <p className="font-semibold text-gray-900">${(p.coverageAmount || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Premium</p>
                  <p className="font-semibold text-gray-900">${(p.premium || 0).toLocaleString()}/mo</p>
                </div>
              </div>
              <button onClick={() => openEditPlan(p)} className="mt-4 w-full text-center text-sm text-relisoft-600 hover:text-relisoft-800 font-medium">Edit</button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderMyBenefits = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Enrolled Benefits</h2>
        <button onClick={() => { setEnrollForm({ planId: '', coverageStartDate: '', coverageEndDate: '' }); setShowEnrollModal(true); }}
          className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
          <Plus className="h-5 w-5 mr-2" /> Enroll in Plan
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Plan Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Enrolled Date</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Coverage Start</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Coverage End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myBenefits.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-gray-400">No benefits enrolled</td></tr>
              ) : myBenefits.map((b, i) => {
                const planName = b.plan?.name || b.planName || '--';
                const badgeColor = b.status === 'Active' ? 'bg-green-100 text-green-800' : b.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800';
                return (
                  <tr key={b._id || i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{planName}</td>
                    <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>{b.status}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.enrolledDate ? new Date(b.enrolledDate).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.coverageStartDate ? new Date(b.coverageStartDate).toLocaleDateString() : '--'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.coverageEndDate ? new Date(b.coverageEndDate).toLocaleDateString() : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDependents = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">My Dependents</h2>
        <button onClick={() => { setDependentForm(emptyDependent); setShowDependentModal(true); }}
          className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
          <UserPlus className="h-5 w-5 mr-2" /> Add Dependent
        </button>
      </div>
      {dependents.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-white rounded-xl shadow-sm border border-gray-100">No dependents added</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dependents.map((d, i) => (
            <div key={d._id || i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
              <div className="p-3 bg-relisoft-50 rounded-full">
                <Users className="h-6 w-6 text-relisoft-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{d.name}</h3>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${relationColors[d.relation] || 'bg-gray-100 text-gray-800'}`}>{d.relation}</span>
                <p className="text-sm text-gray-500 mt-1">DOB: {d.dateOfBirth ? new Date(d.dateOfBirth).toLocaleDateString() : '--'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Benefits Administration</h1>
            <p className="text-gray-500 mt-1">Manage benefit plans, enrollments, and dependents</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 inline-flex">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-relisoft-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}>
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
        ) : activeTab === 'Plans Catalog' ? renderPlansCatalog() : activeTab === 'My Benefits' ? renderMyBenefits() : renderDependents()}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">{editing ? 'Edit Plan' : 'Add Plan'}</h3>
              <button onClick={() => { setShowModal(false); setEditing(null); }} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddPlan} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    <option value="HealthInsurance">Health Insurance</option>
                    <option value="Dental">Dental</option>
                    <option value="Life">Life</option>
                    <option value="Accidental">Accidental</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input type="text" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Amount ($)</label>
                  <input type="number" value={form.coverageAmount} onChange={(e) => setForm({ ...form, coverageAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Premium ($/mo)</label>
                  <input type="number" step="0.01" value={form.premium} onChange={(e) => setForm({ ...form, premium: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 text-relisoft-600 focus:ring-relisoft-500 border-gray-300 rounded" />
                <label htmlFor="isActive" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} {editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Enroll in Benefit Plan</h3>
              <button onClick={() => setShowEnrollModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleEnroll} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Plan</label>
                <select value={enrollForm.planId} onChange={(e) => setEnrollForm({ ...enrollForm, planId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                  <option value="">Choose a plan</option>
                  {availablePlans.filter((p) => p.isActive !== false).map((p) => (
                    <option key={p._id} value={p._id}>{p.name} - {p.type.replace(/([A-Z])/g, ' $1').trim()} (${p.premium}/mo)</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Start</label>
                  <input type="date" value={enrollForm.coverageStartDate} onChange={(e) => setEnrollForm({ ...enrollForm, coverageStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coverage End</label>
                  <input type="date" value={enrollForm.coverageEndDate} onChange={(e) => setEnrollForm({ ...enrollForm, coverageEndDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowEnrollModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDependentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Dependent</h3>
              <button onClick={() => setShowDependentModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddDependent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={dependentForm.name} onChange={(e) => setDependentForm({ ...dependentForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <select value={dependentForm.relation} onChange={(e) => setDependentForm({ ...dependentForm, relation: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                  <option value="">Select relation</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={dependentForm.dateOfBirth} onChange={(e) => setDependentForm({ ...dependentForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowDependentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Add Dependent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
