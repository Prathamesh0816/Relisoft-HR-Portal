import { useState, useEffect } from 'react';
import { Grid3X3, Users, TrendingUp, GitBranch, BarChart3, Plus, X, Loader2, Search, AlertTriangle, Star, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { talentAnalyticsAPI } from '../../services/api';

const tabs = [
  { key: 'matrix', label: '9-Box Matrix', icon: Grid3X3 },
  { key: 'segments', label: 'Segments', icon: Users },
  { key: 'flightRisk', label: 'Flight Risk', icon: TrendingUp },
  { key: 'succession', label: 'Succession', icon: GitBranch },
  { key: 'benchStrength', label: 'Bench Strength', icon: BarChart3 },
];

const segmentColors = {
  HighPotential: 'bg-purple-100 text-purple-800',
  Core: 'bg-blue-100 text-blue-800',
  Underperformer: 'bg-red-100 text-red-800',
  Emerging: 'bg-green-100 text-green-800',
  Specialist: 'bg-amber-100 text-amber-800',
};

const quadrantLabels = [
  ['Underperformers', '', 'High Potentials'],
  ['', 'Core', ''],
  ['', '', 'Stars'],
];

const flightRiskColor = (score) => {
  if (score <= 30) return 'text-green-600 bg-green-50';
  if (score <= 60) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
};

const readinessColors = {
  ReadyNow: 'bg-green-100 text-green-800',
  ReadyFuture: 'bg-blue-100 text-blue-800',
  NotReady: 'bg-gray-100 text-gray-800',
};

const performanceLabels = ['Low', 'Medium', 'High'];
const potentialLabels = ['Low', 'Medium', 'High'];

export default function TalentAnalyticsList() {
  const [activeTab, setActiveTab] = useState('matrix');
  const [loading, setLoading] = useState(false);
  const [matrixData, setMatrixData] = useState([]);
  const [segments, setSegments] = useState([]);
  const [flightRisk, setFlightRisk] = useState([]);
  const [succession, setSuccession] = useState([]);
  const [benchStrength, setBenchStrength] = useState([]);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [modalEmployees, setModalEmployees] = useState([]);
  const [modalTitle, setModalTitle] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ reviewCycle: '', facilitator: '', status: 'Draft' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeTab === 'matrix') loadMatrix();
    else if (activeTab === 'segments') loadSegments();
    else if (activeTab === 'flightRisk') loadFlightRisk();
    else if (activeTab === 'succession') loadSuccession();
    else if (activeTab === 'benchStrength') loadBenchStrength();
  }, [activeTab]);

  const loadMatrix = async () => {
    setLoading(true);
    try {
      const { data } = await talentAnalyticsAPI.getMatrix();
      setMatrixData(data?.matrix || data?.data || data || []);
    } catch {
      toast.error('Failed to load matrix');
    } finally {
      setLoading(false);
    }
  };

  const loadSegments = async () => {
    setLoading(true);
    try {
      const { data } = await talentAnalyticsAPI.getSegments();
      setSegments(data?.segments || data?.data || data || []);
    } catch {
      toast.error('Failed to load segments');
    } finally {
      setLoading(false);
    }
  };

  const loadFlightRisk = async () => {
    setLoading(true);
    try {
      const { data } = await talentAnalyticsAPI.getFlightRisk({ minScore });
      const items = data?.employees || data?.data || data || [];
      setFlightRisk(items.sort((a, b) => (b.flightRiskScore || 0) - (a.flightRiskScore || 0)));
    } catch {
      toast.error('Failed to load flight risk');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'flightRisk') loadFlightRisk();
  }, [minScore]);

  const loadSuccession = async () => {
    setLoading(true);
    try {
      const { data } = await talentAnalyticsAPI.getSuccession();
      setSuccession(data?.employees || data?.data || data || []);
    } catch {
      toast.error('Failed to load succession');
    } finally {
      setLoading(false);
    }
  };

  const loadBenchStrength = async () => {
    setLoading(true);
    try {
      const { data } = await talentAnalyticsAPI.getBenchStrength();
      setBenchStrength(data?.departments || data?.data || data || []);
    } catch {
      toast.error('Failed to load bench strength');
    } finally {
      setLoading(false);
    }
  };

  const openCellEmployees = (employees, pi, pj) => {
    if (!employees || employees.length === 0) return;
    setModalEmployees(employees);
    setModalTitle(`${performanceLabels[pi]} Performance / ${potentialLabels[pj]} Potential`);
    setShowEmployeesModal(true);
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await talentAnalyticsAPI.createReview(reviewForm);
      toast.success('Review created');
      setShowReviewModal(false);
      setReviewForm({ reviewCycle: '', facilitator: '', status: 'Draft' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create review');
    } finally {
      setSaving(false);
    }
  };

  const buildMatrix = () => {
    const grid = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => []));
    matrixData.forEach((emp) => {
      const pi = ['Low', 'Medium', 'High'].indexOf(emp.performanceRating) >= 0 ? ['Low', 'Medium', 'High'].indexOf(emp.performanceRating) : 1;
      const pj = ['Low', 'Medium', 'High'].indexOf(emp.potentialRating) >= 0 ? ['Low', 'Medium', 'High'].indexOf(emp.potentialRating) : 1;
      grid[pi][pj].push(emp);
    });
    return grid;
  };

  const grid = buildMatrix();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Talent Analytics</h1>
        <button onClick={() => setShowReviewModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> New Review
        </button>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeTab === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon size={16} /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'matrix' && (
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Potential</p>
                  <div className="flex gap-2">
                    {potentialLabels.map((l) => (
                      <span key={l} className="text-xs font-medium text-gray-500 w-32 text-center">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[80px_repeat(3,1fr)] gap-2">
                <div className="flex items-center justify-center">
                  <span className="text-xs text-gray-400 -rotate-90">Performance</span>
                </div>
                {performanceLabels.map((pl, pi) => (
                  <div key={pi} className="col-start-2 grid grid-cols-subgrid gap-2" style={{ display: 'contents' }}>
                    {potentialLabels.map((_, pj) => {
                      const cell = grid[pi][pj] || [];
                      const isEdge = (pi === 0 && pj === 0) || (pi === 0 && pj === 2) || (pi === 2 && pj === 0) || (pi === 2 && pj === 2);
                      return (
                        <div key={`${pi}-${pj}`}
                          onClick={() => openCellEmployees(cell, pi, pj)}
                          className={`p-4 rounded-xl border-2 text-center cursor-pointer transition-all hover:shadow-md ${
                            isEdge ? 'border-relisoft-200 bg-relisoft-50' : 'border-gray-200 bg-white'
                          } ${cell.length === 0 ? 'opacity-50' : ''}`}>
                          {quadrantLabels[pi][pj] && (
                            <p className="text-xs font-semibold text-gray-600 mb-2">{quadrantLabels[pi][pj]}</p>
                          )}
                          <p className="text-3xl font-bold text-gray-900">{cell.length}</p>
                          <p className="text-xs text-gray-400 mt-1">{cell.length === 1 ? 'employee' : 'employees'}</p>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'segments' && (
        <div className="card">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : segments.length === 0 ? (
            <p className="text-center py-12 text-gray-400">No segment data</p>
          ) : (
            <div className="space-y-4">
              {segments.map((seg, i) => {
                const maxCount = Math.max(...segments.map(s => s.count || 0), 1);
                const pct = ((seg.count || 0) / maxCount) * 100;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700 w-32 text-right">{seg.segment || seg.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                      <div className="h-full rounded-full flex items-center justify-end pr-3 text-sm font-medium text-white transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: segmentColors[seg.segment || seg.name]?.split(' ')[0].replace('bg-', '#') || '#6b7280' }}>
                        {seg.count}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="flex flex-wrap gap-3 pt-4">
                {Object.entries(segmentColors).map(([key, cls]) => (
                  <div key={key} className="flex items-center gap-1.5 text-xs">
                    <span className={`w-3 h-3 rounded-full ${cls.split(' ')[0]}`} />
                    <span className="text-gray-600">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flightRisk' && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Min Score:</label>
              <input type="number" className="input-field w-24" value={minScore} onChange={(e) => setMinScore(parseInt(e.target.value) || 0)} min={0} max={100} />
            </div>
          </div>
          <div className="table-container">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Employee</th>
                      <th className="table-header">Department</th>
                      <th className="table-header">Flight Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {flightRisk.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-12 text-gray-400">No data</td></tr>
                    ) : flightRisk.map((emp, i) => (
                      <tr key={emp._id || i} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">{emp.employeeName || emp.name || '--'}</td>
                        <td className="table-cell">{emp.department || '--'}</td>
                        <td className="table-cell">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${flightRiskColor(emp.flightRiskScore)}`}>
                            {emp.flightRiskScore || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'succession' && (
        <div className="table-container">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Employee</th>
                    <th className="table-header">Readiness</th>
                    <th className="table-header">Critical Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {succession.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-12 text-gray-400">No succession data</td></tr>
                  ) : succession.map((emp, i) => (
                    <tr key={emp._id || i} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{emp.employeeName || emp.name || '--'}</td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${readinessColors[emp.successionReadiness] || 'bg-gray-100'}`}>
                          {emp.successionReadiness || 'Not Set'}
                        </span>
                      </td>
                      <td className="table-cell">
                        {emp.criticalRoleFlag ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Star size={12} /> Critical
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'benchStrength' && (
        <div className="table-container">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-header">Department</th>
                    <th className="table-header">High Potential</th>
                    <th className="table-header">Core</th>
                    <th className="table-header">Emerging</th>
                    <th className="table-header">Underperformer</th>
                    <th className="table-header">Specialist</th>
                    <th className="table-header">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {benchStrength.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">No data</td></tr>
                  ) : benchStrength.map((dept, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="table-cell font-medium">{dept.department || dept.name || '--'}</td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">{dept.HighPotential || dept.highPotential || 0}</span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{dept.Core || dept.core || 0}</span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{dept.Emerging || dept.emerging || 0}</span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">{dept.Underperformer || dept.underperformer || 0}</span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{dept.Specialist || dept.specialist || 0}</span>
                      </td>
                      <td className="table-cell font-medium">{dept.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showEmployeesModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEmployeesModal(false); }}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{modalTitle}</h2>
              <button onClick={() => setShowEmployeesModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <div className="space-y-2">
              {modalEmployees.map((emp, i) => (
                <div key={emp._id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-relisoft-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-relisoft-600">{emp.name?.[0] || emp.firstName?.[0] || '?'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`}</p>
                    <p className="text-xs text-gray-500">{emp.department || emp.position || '--'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowReviewModal(false); }}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">New Review</h2>
              <button onClick={() => setShowReviewModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Cycle</label>
                <input type="text" className="input-field" value={reviewForm.reviewCycle} onChange={(e) => setReviewForm({ ...reviewForm, reviewCycle: e.target.value })} placeholder="e.g. Q1 2026" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator</label>
                <select className="input-field" value={reviewForm.facilitator} onChange={(e) => setReviewForm({ ...reviewForm, facilitator: e.target.value })} required>
                  <option value="">Select Facilitator</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Talent Lead">Talent Lead</option>
                  <option value="Department Head">Department Head</option>
                  <option value="CEO">CEO</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className="input-field" value={reviewForm.status} onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}>
                  <option value="Draft">Draft</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />} Create Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
