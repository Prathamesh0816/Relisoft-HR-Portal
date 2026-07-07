import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Users, DollarSign, Briefcase, TrendingUp, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { workforceAPI } from '../../services/api';

const tabs = ['Plans', 'Forecasts', 'Dashboard', 'Gap Analysis'];
const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design', 'Legal'];

const emptyPlan = { fiscalYear: new Date().getFullYear(), department: '', budgetedHeadcount: 0, actualHeadcount: 0, budgetedCost: 0, actualCost: 0, openPositions: 0, quarter: 'Q1' };
const emptyForecast = { department: '', role: '', priority: 'Medium', estimatedCount: 1, timeline: '', status: 'Open' };

export default function WorkforcePlanningList() {
  const [activeTab, setActiveTab] = useState('Plans');
  const [plans, setPlans] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [forecastForm, setForecastForm] = useState(emptyForecast);
  const [showForecastModal, setShowForecastModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'Plans' || activeTab === 'Dashboard' || activeTab === 'Gap Analysis') {
        const { data } = await workforceAPI.listPlans();
        setPlans(data.plans || data.data || data || []);
      }
      if (activeTab === 'Forecasts') {
        const { data } = await workforceAPI.listForecasts();
        setForecasts(data.forecasts || data.data || data || []);
      }
    } catch (err) {
      if (activeTab === 'Plans' || activeTab === 'Dashboard' || activeTab === 'Gap Analysis') setPlans([]);
      if (activeTab === 'Forecasts') setForecasts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await workforceAPI.updatePlan(editing, form);
        toast.success('Plan updated');
      } else {
        await workforceAPI.createPlan(form);
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

  const handleAddForecast = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await workforceAPI.createForecast(forecastForm);
      toast.success('Forecast created');
      setShowForecastModal(false);
      setForecastForm(emptyForecast);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save forecast');
    } finally {
      setSaving(false);
    }
  };

  const openEditPlan = (plan) => {
    setEditing(plan._id);
    setForm({ fiscalYear: plan.fiscalYear, department: plan.department, budgetedHeadcount: plan.budgetedHeadcount, actualHeadcount: plan.actualHeadcount, budgetedCost: plan.budgetedCost, actualCost: plan.actualCost, openPositions: plan.openPositions, quarter: plan.quarter });
    setShowModal(true);
  };

  const totalBudgetedHC = plans.reduce((s, p) => s + (p.budgetedHeadcount || 0), 0);
  const totalActualHC = plans.reduce((s, p) => s + (p.actualHeadcount || 0), 0);
  const totalBudgetedCost = plans.reduce((s, p) => s + (p.budgetedCost || 0), 0);
  const totalActualCost = plans.reduce((s, p) => s + (p.actualCost || 0), 0);
  const totalOpenPositions = plans.reduce((s, p) => s + (p.openPositions || 0), 0);

  const gapDepartments = plans.filter((p) => (p.budgetedHeadcount || 0) !== (p.actualHeadcount || 0));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Plans':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Manpower Plans</h2>
              <button onClick={() => { setEditing(null); setForm(emptyPlan); setShowModal(true); }}
                className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
                <Plus className="h-5 w-5 mr-2" /> Add Plan
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fiscal Year</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quarter</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budgeted HC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actual HC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budgeted Cost</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actual Cost</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Open Pos.</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-12 text-gray-400">No plans found</td></tr>
                  ) : plans.map((p, i) => (
                    <tr key={p._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{p.fiscalYear}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{p.quarter}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.budgetedHeadcount || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{p.actualHeadcount || 0}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(p.budgetedCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">${(p.actualCost || 0).toLocaleString()}</td>
                      <td className="px-6 py-4"><span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{p.openPositions || 0}</span></td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => openEditPlan(p)} className="text-relisoft-600 hover:text-relisoft-800 text-sm font-medium">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Forecasts':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Hiring Forecasts</h2>
              <button onClick={() => { setForecastForm(emptyForecast); setShowForecastModal(true); }}
                className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
                <Plus className="h-5 w-5 mr-2" /> Add Forecast
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Est. Count</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timeline</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forecasts.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400">No forecasts found</td></tr>
                  ) : forecasts.map((f, i) => (
                    <tr key={f._id || i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{f.department}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${f.priority === 'High' ? 'bg-red-100 text-red-800' : f.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{f.priority}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{f.estimatedCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{f.timeline ? new Date(f.timeline).toLocaleDateString() : '--'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${f.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{f.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-lg"><Users className="h-6 w-6 text-blue-600" /></div>
                <div><p className="text-sm text-gray-500">Budgeted HC</p><p className="text-2xl font-bold text-gray-900">{totalBudgetedHC}</p></div>
              </div>
              <div className="text-sm text-gray-400">Across all departments</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-lg"><Users className="h-6 w-6 text-green-600" /></div>
                <div><p className="text-sm text-gray-500">Actual HC</p><p className="text-2xl font-bold text-gray-900">{totalActualHC}</p></div>
              </div>
              <div className="text-sm text-gray-400">Current headcount</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg"><DollarSign className="h-6 w-6 text-purple-600" /></div>
                <div><p className="text-sm text-gray-500">Total Budgeted Cost</p><p className="text-2xl font-bold text-gray-900">${totalBudgetedCost.toLocaleString()}</p></div>
              </div>
              <div className="text-sm text-gray-400">Planned budget</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-lg"><Briefcase className="h-6 w-6 text-orange-600" /></div>
                <div><p className="text-sm text-gray-500">Open Positions</p><p className="text-2xl font-bold text-gray-900">{totalOpenPositions}</p></div>
              </div>
              <div className="text-sm text-gray-400">Positions to fill</div>
            </div>
          </div>
        );

      case 'Gap Analysis':
        return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Headcount Gap Analysis</h2>
              <p className="text-sm text-gray-500 mt-1">Departments where budgeted headcount differs from actual</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Budgeted HC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actual HC</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Gap</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gapDepartments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-12 text-gray-400">No gaps found — all departments match budget</td></tr>
                  ) : gapDepartments.map((p, i) => {
                    const gap = (p.budgetedHeadcount || 0) - (p.actualHeadcount || 0);
                    return (
                      <tr key={p._id || i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{p.budgetedHeadcount || 0}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{p.actualHeadcount || 0}</td>
                        <td className={`px-6 py-4 text-sm font-semibold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>{gap > 0 ? `+${gap}` : gap}</td>
                        <td className="px-6 py-4">
                          {gap > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3" /> Understaffed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3" /> Overstaffed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Workforce Planning</h1>
            <p className="text-gray-500 mt-1">Manpower planning, hiring forecasts, and gap analysis</p>
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
        ) : renderTabContent()}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Year</label>
                  <input type="number" value={form.fiscalYear} onChange={(e) => setForm({ ...form, fiscalYear: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quarter</label>
                  <select value={form.quarter} onChange={(e) => setForm({ ...form, quarter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                    {quarters.map((q) => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budgeted HC</label>
                  <input type="number" value={form.budgetedHeadcount} onChange={(e) => setForm({ ...form, budgetedHeadcount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual HC</label>
                  <input type="number" value={form.actualHeadcount} onChange={(e) => setForm({ ...form, actualHeadcount: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budgeted Cost ($)</label>
                  <input type="number" value={form.budgetedCost} onChange={(e) => setForm({ ...form, budgetedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual Cost ($)</label>
                  <input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Open Positions</label>
                <input type="number" value={form.openPositions} onChange={(e) => setForm({ ...form, openPositions: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
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

      {showForecastModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Hiring Forecast</h3>
              <button onClick={() => setShowForecastModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddForecast} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select value={forecastForm.department} onChange={(e) => setForecastForm({ ...forecastForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                  <option value="">Select department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input type="text" value={forecastForm.role} onChange={(e) => setForecastForm({ ...forecastForm, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={forecastForm.priority} onChange={(e) => setForecastForm({ ...forecastForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Count</label>
                <input type="number" value={forecastForm.estimatedCount} onChange={(e) => setForecastForm({ ...forecastForm, estimatedCount: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <input type="date" value={forecastForm.timeline} onChange={(e) => setForecastForm({ ...forecastForm, timeline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={forecastForm.status} onChange={(e) => setForecastForm({ ...forecastForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
                  <option value="Open">Open</option>
                  <option value="Filled">Filled</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowForecastModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
