import { useState, useEffect } from 'react';
import { Clock, Plus, X, Users, Check, X as XIcon, Loader2, Sun, Moon, Sunset, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { shiftAPI, employeeAPI } from '../../services/api';

const shiftIcons = { General: Sun, Night: Moon, Evening: Sunset, Flexible: Sparkles };
const shiftColors = {
  General: 'bg-relisoft-100 border-relisoft-300',
  Night: 'bg-relisoft-100 border-relisoft-300',
  Evening: 'bg-orange-100 border-orange-300',
  Flexible: 'bg-relisoft-100 border-relisoft-300',
};

export default function ShiftList() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [swapRequests, setSwapRequests] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', startTime: '09:00', endTime: '18:00', type: 'General', workingDays: ['Mon','Tue','Wed','Thu','Fri'] });
  const [saving, setSaving] = useState(false);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shiftRes, swapRes] = await Promise.all([
        shiftAPI.list(),
        shiftAPI.getSwapRequests().catch(() => null),
      ]);
      setShifts(shiftRes.data.shifts || shiftRes.data.data || shiftRes.data || []);
      setSwapRequests(swapRes?.data?.requests || swapRes?.data?.data || swapRes?.data || []);
    } catch (err) {
      toast.error('Failed to load shift data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddShift = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await shiftAPI.create(form);
      toast.success('Shift created successfully');
      setShowAddModal(false);
      setForm({ name: '', startTime: '09:00', endTime: '18:00', type: 'General', workingDays: ['Mon','Tue','Wed','Thu','Fri'] });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shift');
    } finally {
      setSaving(false);
    }
  };

  const openAssign = async (shift) => {
    setSelectedShift(shift);
    setSelectedEmployees([]);
    try {
      const { data } = await employeeAPI.list({ limit: 100 });
      setEmployees(data.employees || data.data || data || []);
    } catch {
      setEmployees([]);
    }
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedEmployees.length) { toast.error('Select at least one employee'); return; }
    setSaving(true);
    try {
      await shiftAPI.assign({ shiftId: selectedShift._id, employeeIds: selectedEmployees });
      toast.success('Shift assigned successfully');
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign shift');
    } finally {
      setSaving(false);
    }
  };

  const toggleEmployee = (id) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSwapAction = async (id, action) => {
    try {
      if (action === 'approve') await shiftAPI.approveSwap(id);
      else await shiftAPI.rejectSwap(id);
      toast.success(`Swap request ${action}d`);
      loadData();
    } catch (err) {
      toast.error(`Failed to ${action} swap request`);
    }
  };

  const IconComponent = ({ type }) => {
    const Icon = shiftIcons[type] || Clock;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shift Management</h1>
            <p className="text-gray-500 mt-1">Manage work shifts and rotations</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
            <Plus className="h-5 w-5 mr-2" /> Add Shift
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : shifts.length === 0 ? (
            <div className="col-span-full text-center py-20 text-gray-400">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No shifts defined</p>
            </div>
          ) : shifts.map((shift) => (
            <div key={shift._id} className={`bg-white rounded-xl shadow-sm border-2 p-5 ${shiftColors[shift.type] || 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <IconComponent type={shift.type} />
                  <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  shift.type === 'General' ? 'bg-relisoft-100 text-relisoft-700' :
                  shift.type === 'Night' ? 'bg-relisoft-100 text-relisoft-700' :
                  shift.type === 'Evening' ? 'bg-orange-100 text-orange-700' : 'bg-relisoft-100 text-relisoft-700'
                }`}>{shift.type}</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p><span className="font-medium">Time:</span> {shift.startTime} - {shift.endTime}</p>
                <p><span className="font-medium">Days:</span> {(shift.workingDays || []).join(', ')}</p>
                {shift.employeeCount !== undefined && <p><span className="font-medium">Employees:</span> {shift.employeeCount}</p>}
              </div>
              <button onClick={() => openAssign(shift)}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm transition-colors">
                <Users className="h-4 w-4 mr-2" /> Assign Employees
              </button>
            </div>
          ))}
        </div>

        {swapRequests.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shift Swap Requests</h3>
            <div className="space-y-3">
              {swapRequests.map((req) => (
                <div key={req._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-900">
                        {req.employee?.name} wants to swap with {req.swapWith?.name}
                      </p>
                      <p className="text-xs text-gray-500">{req.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => handleSwapAction(req._id, 'approve')}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><Check className="h-4 w-4" /></button>
                    <button onClick={() => handleSwapAction(req._id, 'reject')}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Add Shift</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAddShift} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
              <option value="General">General (Day)</option>
              <option value="Night">Night</option>
              <option value="Evening">Evening</option>
              <option value="Flexible">Flexible</option>
            </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <label key={day} className={`px-3 py-1.5 border rounded-lg text-sm cursor-pointer transition-colors ${
                      form.workingDays.includes(day) ? 'bg-relisoft-100 border-relisoft-400 text-relisoft-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}>
                      <input type="checkbox" checked={form.workingDays.includes(day)}
                        onChange={() => setForm({ ...form, workingDays: form.workingDays.includes(day) ? form.workingDays.filter(d => d !== day) : [...form.workingDays, day] })}
                        className="hidden" />
                      {day}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Assign Shift: {selectedShift?.name}</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {employees.length === 0 ? (
                <p className="text-gray-400 text-center">No employees available</p>
              ) : (
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <label key={emp._id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={selectedEmployees.includes(emp._id)}
                        onChange={() => toggleEmployee(emp._id)}
                        className="h-4 w-4 rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-600" />
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">{emp.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.department} - {emp.designation}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-100">
              <button onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={handleAssign} disabled={saving || !selectedEmployees.length}
                className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Assign to {selectedEmployees.length} Employee(s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
