import { useState, useEffect } from 'react';
import { Users, CheckCircle, Circle, Loader2, Search, ChevronRight, FileText, Monitor, Package, Compass } from 'lucide-react';
import toast from 'react-hot-toast';
import { onboardingAPI, employeeAPI } from '../../services/api';

const stages = [
  { id: 'documents', label: 'Documents', icon: FileText, color: 'bg-relisoft-500' },
  { id: 'itSetup', label: 'IT Setup', icon: Monitor, color: 'bg-relisoft-500' },
  { id: 'assets', label: 'Assets', icon: Package, color: 'bg-amber-500' },
  { id: 'orientation', label: 'Orientation', icon: Compass, color: 'bg-green-500' },
];

const checklistTemplates = {
  documents: [
    'ID Proof submitted',
    'Address Proof submitted',
    'Educational certificates verified',
    'Previous employment documents',
    'Bank details provided',
    'PAN card copy',
  ],
  itSetup: [
    'Email account created',
    'System access granted',
    'Software installed',
    'VPN access configured',
    'Slack/Teams account created',
    'Jira access granted',
  ],
  assets: [
    'Laptop allocated',
    'Monitor allocated',
    'Keyboard & Mouse',
    'Access card issued',
    'SIM card issued',
    'Stationery kit',
  ],
  orientation: [
    'Company policy review',
    'HR induction completed',
    'Team introduction done',
    'Project overview given',
    'Safety training completed',
    'Welcome kit distributed',
  ],
};

export default function OnboardingList() {
  const [employees, setEmployees] = useState([]);
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [search, setSearch] = useState('');
  const [activeStage, setActiveStage] = useState('documents');
  const [checkedItems, setCheckedItems] = useState({});

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const { data } = await employeeAPI.list({ status: 'Active' });
      const emps = data.employees || data.data || data || [];
      setEmployees(emps);

      const onboardingMap = {};
      for (const emp of emps) {
        try {
          const { data: ob } = await onboardingAPI.getByEmployee(emp._id);
          onboardingMap[emp._id] = ob;
        } catch {
          onboardingMap[emp._id] = null;
        }
      }
      setOnboardingData(onboardingMap);
    } catch (err) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const selectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setActiveStage('documents');
    const ob = onboardingData[emp._id];
    const completed = {};
    if (ob?.stages) {
      stages.forEach((s) => {
        (checklistTemplates[s.id] || []).forEach((item, idx) => {
          if (ob.stages[s.id]?.completedItems?.includes(idx)) {
            completed[`${s.id}-${idx}`] = true;
          }
        });
      });
    }
    setCheckedItems(completed);
  };

  const toggleCheck = (stageId, idx) => {
    const key = `${stageId}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleMarkStageComplete = async () => {
    if (!selectedEmployee) return;
    try {
      const completedItems = Object.entries(checkedItems)
        .filter(([, v]) => v)
        .map(([k]) => parseInt(k.split('-')[1]));
      await onboardingAPI.updateStage(selectedEmployee._id, activeStage, { completedItems });
      toast.success(`${activeStage} stage updated`);
      loadEmployees();
    } catch (err) {
      toast.error('Failed to update stage');
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedEmployee) return;
    if (!window.confirm('Mark onboarding as complete for this employee?')) return;
    try {
      await onboardingAPI.markComplete(selectedEmployee._id);
      toast.success('Onboarding completed');
      loadEmployees();
    } catch (err) {
      toast.error('Failed to complete onboarding');
    }
  };

  const filteredEmployees = employees.filter((e) =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStageStatus = (empId, stageId) => {
    const ob = onboardingData[empId];
    if (!ob?.stages?.[stageId]) return 'pending';
    return ob.stages[stageId].completed ? 'completed' : 'in-progress';
  };

  const stageStatusIcon = (status) => {
    if (status === 'completed') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'in-progress') return <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />;
    return <Circle className="h-5 w-5 text-gray-300" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Employee Onboarding</h1>
          <p className="text-gray-500 mt-1">Manage new employee onboarding process</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input type="text" placeholder="Search employee..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" />
              </div>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-relisoft-600" /></div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredEmployees.map((emp) => (
                    <button key={emp._id} onClick={() => selectEmployee(emp)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                        selectedEmployee?._id === emp._id ? 'bg-relisoft-50 border border-relisoft-200' : 'hover:bg-gray-50 border border-transparent'
                      }`}>
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-gray-600">
                          {emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department}</p>
                      </div>
                      <div className="flex -space-x-1">
                        {stages.map((s) => {
                          const status = getStageStatus(emp._id, s.id);
                          return (
                            <div key={s.id} className={`w-2 h-2 rounded-full ${
                              status === 'completed' ? 'bg-green-500' :
                              status === 'in-progress' ? 'bg-amber-500' : 'bg-gray-300'
                            }`} title={s.label} />
                          );
                        })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedEmployee ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-relisoft-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-relisoft-700">
                        {selectedEmployee.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedEmployee.name}</h3>
                      <p className="text-sm text-gray-500">{selectedEmployee.department} - {selectedEmployee.designation}</p>
                    </div>
                  </div>
                  <button onClick={handleMarkComplete}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    Mark Complete
                  </button>
                </div>

                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                  {stages.map((stage) => {
                    const status = getStageStatus(selectedEmployee._id, stage.id);
                    return (
                      <button key={stage.id} onClick={() => setActiveStage(stage.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeStage === stage.id ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'
                        }`}>
                        <stage.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{stage.label}</span>
                        {stageStatusIcon(status)}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3">
                  {(checklistTemplates[activeStage] || []).map((item, idx) => (
                    <label key={idx} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={!!checkedItems[`${activeStage}-${idx}`]}
                        onChange={() => toggleCheck(activeStage, idx)}
                        className="h-5 w-5 rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-600" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </label>
                  ))}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <button onClick={handleMarkStageComplete}
                    className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 text-sm">
                    Update & Save <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                <Users className="h-20 w-20 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Select an employee to manage onboarding</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
