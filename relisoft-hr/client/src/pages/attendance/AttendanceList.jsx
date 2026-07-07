import { useState, useEffect } from 'react';
import { Search, Filter, Clock, LogIn, LogOut, Loader2, Calendar, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { attendanceAPI } from '../../services/api';

const statusStyles = {
  Present: 'bg-green-100 text-green-800',
  Absent: 'bg-red-100 text-red-800',
  'Half-Day': 'bg-amber-100 text-amber-800',
  Late: 'bg-orange-100 text-orange-800',
  'On Leave': 'bg-relisoft-100 text-relisoft-800',
  Holiday: 'bg-relisoft-100 text-relisoft-800',
};

const departments = ['All', 'Engineering', 'HR', 'Marketing', 'Finance', 'Operations', 'Sales', 'Design'];

const demoRecords = [
  { _id: 'a1', employee: { firstName: 'Priya', lastName: 'Sharma' }, date: '2026-07-06', status: 'Present', checkIn: '09:15 AM', checkOut: '06:30 PM' },
  { _id: 'a2', employee: { firstName: 'Arun', lastName: 'Kumar' }, date: '2026-07-06', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
  { _id: 'a3', employee: { firstName: 'Neha', lastName: 'Patel' }, date: '2026-07-06', status: 'Late', checkIn: '10:30 AM', checkOut: '07:00 PM' },
  { _id: 'a4', employee: { firstName: 'Rahul', lastName: 'Verma' }, date: '2026-07-06', status: 'Present', checkIn: '08:45 AM', checkOut: '05:45 PM' },
  { _id: 'a5', employee: { firstName: 'Sneha', lastName: 'Gupta' }, date: '2026-07-06', status: 'Present', checkIn: '09:05 AM', checkOut: '06:15 PM' },
  { _id: 'a6', employee: { firstName: 'Vikram', lastName: 'Joshi' }, date: '2026-07-06', status: 'Half-Day', checkIn: '09:30 AM', checkOut: '01:00 PM' },
  { _id: 'a7', employee: { firstName: 'Ananya', lastName: 'Reddy' }, date: '2026-07-06', status: 'Present', checkIn: '09:10 AM', checkOut: '06:20 PM' },
  { _id: 'a8', employee: { firstName: 'Karthik', lastName: 'Nair' }, date: '2026-07-06', status: 'On Leave', checkIn: null, checkOut: null },
  { _id: 'a9', employee: { firstName: 'Divya', lastName: 'Singh' }, date: '2026-07-05', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM' },
  { _id: 'a10', employee: { firstName: 'Rohan', lastName: 'Desai' }, date: '2026-07-05', status: 'Absent', checkIn: null, checkOut: null },
];

const demoToday = { status: 'Present', checkIn: '09:15 AM', date: new Date().toISOString().split('T')[0] };

const demoSummary = { present: 6, absent: 1, late: 1, halfDay: 1, onLeave: 1, total: 10 };

export default function AttendanceList() {
  const [records, setRecords] = useState(demoRecords);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);
  const [todayRecord, setTodayRecord] = useState(demoToday);
  const [summary, setSummary] = useState(demoSummary);
  const [filters, setFilters] = useState({ department: '', month: '', year: '' });
  const [search, setSearch] = useState('');

  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      month: prev.month || currentMonth,
      year: prev.year || String(today.getFullYear()),
    }));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const params = {};
      if (filters.month) params.month = filters.month;
      if (filters.department && filters.department !== 'All') params.department = filters.department;
      const [recordRes, todayRes, summaryRes] = await Promise.all([
        attendanceAPI.list(params),
        attendanceAPI.getToday().catch(() => null),
        attendanceAPI.getSummary(params).catch(() => null),
      ]);
      if (recordRes.data?.records?.length || recordRes.data?.data?.length) setRecords(recordRes.data.records || recordRes.data.data || recordRes.data || []);
      if (todayRes?.data) setTodayRecord(todayRes.data);
      if (summaryRes?.data) setSummary(summaryRes.data);
    } catch (err) {
      /* demo data remains */
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    setPunching(true);
    try {
      const { data } = await attendanceAPI.punchIn();
      setTodayRecord(data);
      toast.success('Punched In successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to punch in');
    } finally {
      setPunching(false);
    }
  };

  const handlePunchOut = async () => {
    setPunching(true);
    try {
      const { data } = await attendanceAPI.punchOut();
      setTodayRecord(data);
      toast.success('Punched Out successfully');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to punch out');
    } finally {
      setPunching(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    if (search && !r.employee?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
            <p className="text-gray-500 mt-1">Track employee attendance and work hours</p>
          </div>
          {!todayRecord?.punchOut ? (
            <button
              onClick={todayRecord?.punchIn ? handlePunchOut : handlePunchIn}
              disabled={punching}
              className={`flex items-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                todayRecord?.punchIn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {punching ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : todayRecord?.punchIn ? (
                <LogOut className="h-5 w-5 mr-2" />
              ) : (
                <LogIn className="h-5 w-5 mr-2" />
              )}
              {todayRecord?.punchIn ? 'Punch Out' : 'Punch In'}
            </button>
          ) : (
            <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
              <Clock className="h-5 w-5 mr-2" />
              Today completed
            </div>
          )}
        </div>

        {summary && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.presentPercent || 0}%</p>
              <p className="text-xs text-gray-500">Present</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.absentPercent || 0}%</p>
              <p className="text-xs text-gray-500">Absent</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{summary.latePercent || 0}%</p>
              <p className="text-xs text-gray-500">Late</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-relisoft-600">{summary.otHours || 0}h</p>
              <p className="text-xs text-gray-500">OT Hours</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-2xl font-bold text-gray-600">{summary.totalRecords || 0}</p>
              <p className="text-xs text-gray-500">Total Records</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search employee..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
            </div>
            <select value={filters.department} onChange={(e) => { setFilters({ ...filters, department: e.target.value }); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="month" value={filters.month} onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Punch In</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Punch Out</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Hours</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRecords.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-relisoft-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-relisoft-700">
                              {record.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{record.employee?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.date ? new Date(record.date).toLocaleDateString() : '--'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.punchIn || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.punchOut || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.hours || '--'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[record.status] || 'bg-gray-100 text-gray-800'}`}>
                          {record.status || 'Unknown'}
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
    </div>
  );
}
