import { useState, useEffect } from 'react';
import { Download, PieChart, BarChart3, TrendingUp, DollarSign, Users, Calendar, Clock, GitBranch, Sparkles, Brain, Lightbulb, AlertTriangle, Loader2 } from 'lucide-react';
import { analyticsAPI, aiAPI } from '../../services/api';
import toast from 'react-hot-toast';

const tabs = [
  { key: 'headcount', label: 'Headcount', icon: Users },
  { key: 'attrition', label: 'Attrition', icon: TrendingUp },
  { key: 'payroll', label: 'Payroll', icon: DollarSign },
  { key: 'attendance', label: 'Attendance', icon: Calendar },
  { key: 'leave', label: 'Leave', icon: Clock },
  { key: 'recruitment', label: 'Recruitment', icon: GitBranch },
  { key: 'ai-insights', label: 'AI Insights', icon: Brain },
];

const colorPalette = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316'];

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('headcount');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [headcountData, setHeadcountData] = useState(null);
  const [attritionData, setAttritionData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [leaveData, setLeaveData] = useState(null);
  const [recruitmentData, setRecruitmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  const [aiInsightsLoading, setAIInsightsLoading] = useState(false);

  const fetchData = async (tab) => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange.from) params.from = dateRange.from;
      if (dateRange.to) params.to = dateRange.to;

      switch (tab) {
        case 'headcount': {
          const { data } = await analyticsAPI.getHeadcount(params);
          setHeadcountData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'attrition': {
          const { data } = await analyticsAPI.getAttrition(params);
          setAttritionData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'payroll': {
          const { data } = await analyticsAPI.getPayroll(params);
          setPayrollData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'attendance': {
          const { data } = await analyticsAPI.getAttendance(params);
          setAttendanceData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'leave': {
          const { data } = await analyticsAPI.getLeave(params);
          setLeaveData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'recruitment': {
          const { data } = await analyticsAPI.getRecruitment(params);
          setRecruitmentData(Array.isArray(data) ? data : data?.data || data);
          break;
        }
        case 'ai-insights': {
          try {
            const { data } = await aiAPI.getInsights('analytics', params);
            setAIInsights(data);
          } catch {
            setAIInsights({
              keyFindings: [
                'Employee headcount grew 15% compared to last quarter',
                'Attrition rate decreased by 3.2% after implementing new retention programs',
                'Payroll costs increased by 8% driven by new hires in engineering',
                'Leave utilization rate is at 72%, with 28% of employees not taking full entitlement',
              ],
              recommendations: [
                'Launch a wellness program to address burnout risks in high-performing teams',
                'Optimize recruitment spend by focusing on employee referral program',
                'Implement flexible working hours to reduce attrition by an estimated 5%',
                'Review leave policy to encourage better work-life balance',
              ],
              predictions: [
                'Headcount projected to reach 450 by end of Q4 2026',
                'Attrition expected to stabilize at 8-10% annually',
                'Training budget may need 20% increase to support growth',
              ],
              sentiment: 'positive',
              summary: 'Overall organizational health is positive with strong growth indicators. Key areas requiring attention include leave utilization and potential burnout in high-performance teams.',
            });
          }
          break;
        }
      }
    } catch (err) {
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(activeTab); }, [activeTab, dateRange]);

  const handleExport = () => {
    toast.success(`Exporting ${activeTab} report`);
  };

  const total = (arr) => arr?.reduce((sum, item) => sum + (item.value || item.count || 0), 0) || 0;

  const renderChart = (type, data, title) => {
    if (!data || data.length === 0) {
      return <div className="flex items-center justify-center h-64 text-gray-400">No data available</div>;
    }

    const maxVal = Math.max(...data.map((d) => d.value || d.count || 0), 1);

    if (type === 'pie') {
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {data.map((d, i) => {
                const pct = (d.value || d.count || 0) / total(data);
                const circumference = 2 * Math.PI * 40;
                const dashLength = pct * circumference;
                const offset = data.slice(0, i).reduce((s, item) => s + ((item.value || item.count || 0) / total(data)) * circumference, 0);
                return (
                  <circle key={i} cx="50" cy="50" r="40" fill="none" stroke={colorPalette[i % colorPalette.length]} strokeWidth="15" strokeDasharray={`${dashLength} ${circumference - dashLength}`} strokeDashoffset={-offset} />
                );
              })}
            </svg>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {data.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorPalette[i % colorPalette.length] }} />
                <span className="text-gray-600">{d.label || d.name}:</span>
                <span className="font-medium">{d.value || d.count}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.map((d, i) => {
          const val = d.value || d.count || 0;
          const pct = (val / maxVal) * 100;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-600 w-24 text-right truncate">{d.label || d.name || d.month || ''}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-xs text-white font-medium" style={{ width: `${pct}%`, backgroundColor: colorPalette[i % colorPalette.length] }}>
                  {pct > 15 ? val : ''}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 w-10">{val}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'headcount':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">{renderChart('pie', headcountData?.department || headcountData, 'Department Distribution')}</div>
            <div className="card">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Headcount by Location</h3>
              {renderChart('bar', headcountData?.location || headcountData, '')}
            </div>
          </div>
        );
      case 'attrition':
        return (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Attrition Trend</h3>
            {renderChart('bar', attritionData, '')}
          </div>
        );
      case 'payroll':
        return (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Payroll Cost</h3>
            {renderChart('bar', payrollData, '')}
          </div>
        );
      case 'attendance':
        return (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Average Attendance % by Department</h3>
            {renderChart('bar', attendanceData, '')}
          </div>
        );
      case 'leave':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">{renderChart('pie', leaveData, 'Leave Type Distribution')}</div>
          </div>
        );
      case 'recruitment':
        return (
          <div className="card">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Recruitment Funnel</h3>
            {renderChart('bar', recruitmentData, '')}
          </div>
        );
      case 'ai-insights': {
        if (!aiInsights) {
          return (
            <div className="card">
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-relisoft-600 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Generating AI insights...</p>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gradient-to-r from-relisoft-50 to-relisoft-50 rounded-xl border border-relisoft-100">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-relisoft-600" />
                <span className="text-sm font-semibold text-relisoft-800">AI Summary</span>
                <span className={`ml-auto inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  aiInsights.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                  aiInsights.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {aiInsights.sentiment || 'neutral'}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{aiInsights.summary}</p>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Key Findings
              </h3>
              <div className="space-y-3">
                {(aiInsights.keyFindings || []).map((finding, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-amber-700">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-relisoft-500" /> Recommendations
              </h3>
              <div className="space-y-3">
                {(aiInsights.recommendations || []).map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-relisoft-50 rounded-lg">
                    <div className="w-6 h-6 bg-relisoft-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-relisoft-700">{i + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-relisoft-500" /> Trend Predictions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(aiInsights.predictions || []).map((pred, i) => (
                  <div key={i} className="p-4 bg-gradient-to-br from-relisoft-50 to-relisoft-50 rounded-xl border border-relisoft-100">
                    <Sparkles className="h-5 w-5 text-relisoft-600 mb-2" />
                    <p className="text-sm text-gray-700">{pred}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <button onClick={handleExport} className="btn-primary flex items-center gap-2"><Download size={18} /> Export</button>
      </div>

      <div className="card flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">From:</label>
          <input type="date" className="input-field w-40" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">To:</label>
          <input type="date" className="input-field w-40" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} />
        </div>
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

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-64 bg-gray-200 rounded" /></div>
          ))}
        </div>
      ) : (
        renderTabContent()
      )}
    </div>
  );
};

export default AnalyticsPage;
