import { useState } from 'react';
import { Clock, Plus, Save, X, Loader2, Calendar, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

const demoProjects = [
  { name: 'Internal HR Portal', color: '#982cc7' },
  { name: 'Client Project - Alpha', color: '#118c83' },
  { name: 'DevOps Infrastructure', color: '#f1c53d' },
  { name: 'Training & Learning', color: '#6366f1' },
  { name: 'Meetings & Admin', color: '#ef4444' },
];

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(today.setDate(diff));
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function generateDemoEntries() {
  const dates = getWeekDates();
  const entryMap = {};
  const hoursOptions = [7.5, 8, 6.5, 7, 8.5, 6, 0, 4, 3, 5, 2];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  demoProjects.forEach((proj) => {
    dates.forEach((d) => {
      const key = d.toISOString().split('T')[0];
      if (!entryMap[key]) entryMap[key] = {};
      if (proj.name === 'Internal HR Portal') entryMap[key][proj.name] = pick([4, 3, 5, 3.5, 4.5]).toString();
      else if (proj.name === 'Client Project - Alpha') entryMap[key][proj.name] = pick([2, 3, 1.5, 2.5, 0]).toString();
      else if (proj.name === 'DevOps Infrastructure') entryMap[key][proj.name] = pick([1, 0, 1.5, 0, 2]).toString();
      else if (proj.name === 'Training & Learning') entryMap[key][proj.name] = pick([0.5, 0, 1, 0, 0]).toString();
      else entryMap[key][proj.name] = pick([1, 0.5, 0, 0.5, 1]).toString();
    });
  });
  return entryMap;
}

export default function TimesheetPage() {
  const [weekStart, setWeekStart] = useState(getWeekDates()[0]);
  const [entries, setEntries] = useState(generateDemoEntries);
  const [saving, setSaving] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [projects, setProjects] = useState(demoProjects);
  const [submitted, setSubmitted] = useState(false);

  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const totalHours = Object.values(entries).reduce((sum, day) => {
    return sum + Object.values(day).reduce((s, h) => s + (parseFloat(h) || 0), 0);
  }, 0);

  const updateEntry = (dateKey, project, hours) => {
    setEntries((prev) => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [project]: hours },
    }));
  };

  const getDayTotal = (dateKey) => {
    const day = entries[dateKey] || {};
    return Object.values(day).reduce((s, h) => s + (parseFloat(h) || 0), 0);
  };

  const getProjectTotal = (project) => {
    return Object.values(entries).reduce((sum, day) => sum + (parseFloat(day[project]) || 0), 0);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Timesheet saved as draft');
    }, 500);
  };

  const handleSubmit = () => {
    if (totalHours === 0) {
      toast.error('Add at least one entry before submitting');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSubmitted(true);
      toast.success('Timesheet submitted for approval ✅');
    }, 800);
  };

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    const colorList = ['#0ea5e9', '#84cc16', '#f97316', '#ec4899', '#14b8a6', '#a855f7'];
    const newP = { name: newProject.trim(), color: colorList[projects.length % colorList.length] };
    setProjects([...projects, newP]);
    setNewProject('');
    setShowAddProject(false);
    toast.success(`Project "${newP.name}" added`);
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
    setSubmitted(false);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d);
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timesheets ⏱️</h1>
            <p className="text-gray-500 mt-1">Log your project hours for the week</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-500 flex items-center gap-1">
              <Clock size={16} /> Total: <span className="font-bold text-gray-900">{totalHours.toFixed(1)}h</span>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-2">
              <Save size={16} /> Save Draft
            </button>
            <button onClick={handleSubmit} disabled={saving || submitted} className="btn-primary flex items-center gap-2">
              {submitted ? <CheckCircle size={16} /> : <CheckCircle size={16} />}
              {submitted ? 'Submitted ✅' : 'Submit for Approval'}
            </button>
          </div>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Timesheet submitted successfully!</p>
              <p className="text-xs text-green-600">Week of {weekDates[0].toLocaleDateString()} — Waiting for manager approval</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
            <button onClick={prevWeek} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">&larr; Previous</button>
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: 'var(--moss)' }} />
              <span className="font-semibold text-gray-900">
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <button onClick={nextWeek} className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Next &rarr;</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase w-44">Project</th>
                  {weekDates.map((d, i) => (
                    <th key={i} className="text-center px-2 py-3 text-xs font-medium text-gray-500 uppercase min-w-[100px]">
                      <div>{dayLabels[i]}</div>
                      <div className="text-lg font-bold text-gray-700">{d.getDate()}</div>
                    </th>
                  ))}
                  <th className="text-center px-3 py-3 text-xs font-medium text-gray-500 uppercase w-16">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projects.map((proj) => {
                  const projKey = proj.name;
                  return (
                    <tr key={projKey} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                          <span className="text-sm font-medium text-gray-700">{projKey}</span>
                        </div>
                      </td>
                      {weekDates.map((d, di) => {
                        const dateKey = d.toISOString().split('T')[0];
                        return (
                          <td key={di} className="px-2 py-3 text-center">
                            <input type="number" min="0" max="24" step="0.5"
                              value={entries[dateKey]?.[projKey] || ''}
                              onChange={(e) => updateEntry(dateKey, projKey, e.target.value)}
                              className="w-20 text-center px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500"
                              placeholder="0" />
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center">
                        <span className="text-sm font-bold" style={{ color: 'var(--moss)' }}>{getProjectTotal(projKey).toFixed(1)}h</span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-gray-900">Daily Total</span>
                  </td>
                  {weekDates.map((d, di) => {
                    const dateKey = d.toISOString().split('T')[0];
                    return (
                      <td key={di} className="px-2 py-3 text-center">
                        <span className="text-sm font-bold text-gray-900">{getDayTotal(dateKey).toFixed(1)}h</span>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center">
                    <span className="text-sm font-bold" style={{ color: 'var(--moss)' }}>{totalHours.toFixed(1)}h</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Project-wise Summary</h3>
              <button onClick={() => setShowAddProject(true)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                <Plus size={14} /> Add Project
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((proj) => {
                const pTotal = getProjectTotal(proj.name);
                const pct = totalHours > 0 ? ((pTotal / totalHours) * 100).toFixed(0) : 0;
                return (
                  <div key={proj.name} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: proj.color }} />
                      <span className="text-sm font-medium text-gray-700 truncate">{proj.name}</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{pTotal.toFixed(1)}h</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: proj.color }} />
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={16} /> Weekly Stats</h3>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900">{totalHours.toFixed(1)}</p>
                <p className="text-xs text-gray-400">Total Hours This Week</p>
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                {weekDates.map((d, i) => {
                  const key = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const dateKey = d.toISOString().split('T')[0];
                  const hrs = getDayTotal(dateKey);
                  const maxHrs = Math.max(...weekDates.map((wd) => getDayTotal(wd.toISOString().split('T')[0])), 1);
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-8">{key}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all" style={{ width: `${(hrs / maxHrs) * 100}%`, background: 'var(--moss)' }} />
                      </div>
                      <span className="text-xs font-medium text-gray-600 w-10 text-right">{hrs.toFixed(1)}h</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium flex items-center gap-1 ${submitted ? 'text-green-600' : 'text-amber-600'}`}>
                    {submitted ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {submitted ? 'Submitted' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Project</h3>
              <button onClick={() => setShowAddProject(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddProject} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input type="text" value={newProject} onChange={(e) => setNewProject(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-relisoft-500" placeholder="e.g. Mobile App Development" required />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddProject(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
