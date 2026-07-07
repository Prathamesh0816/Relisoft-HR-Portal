import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, X, Search, Check, X as XIcon, Loader2, Calendar, Clock, Ban, AlertTriangle
} from 'lucide-react'

const demoLeaveTypes = [
  { id: 'lt1', name: 'Sick/Casual Leave', isCompOff: false, isFloater: false },
  { id: 'lt2', name: 'Planned Leave', isCompOff: false, isFloater: false },
  { id: 'lt3', name: 'Compensatory Off', isCompOff: true, isFloater: false },
  { id: 'lt4', name: 'Floater Holiday', isCompOff: false, isFloater: true },
  { id: 'lt5', name: 'Maternity Leave', isCompOff: false, isFloater: false },
  { id: 'lt6', name: 'Paternity Leave', isCompOff: false, isFloater: false },
  { id: 'lt7', name: 'Unpaid Leave', isCompOff: false, isFloater: false },
];

const demoBalance = [
  { leaveType: { id: 'lt1', name: 'Sick/Casual Leave' }, allocatedLeaves: 7, usedLeaves: 2 },
  { leaveType: { id: 'lt2', name: 'Planned Leave' }, allocatedLeaves: 12, usedLeaves: 3 },
  { leaveType: { id: 'lt3', name: 'Compensatory Off' }, allocatedLeaves: 2, usedLeaves: 0 },
  { leaveType: { id: 'lt4', name: 'Floater Holiday' }, allocatedLeaves: 2, usedLeaves: 0 },
  { leaveType: { id: 'lt5', name: 'Maternity Leave' }, allocatedLeaves: 60, usedLeaves: 0 },
];

const demoMyRequests = [
  { _id: 'lr1', leaveType: { name: 'Sick/Casual Leave' }, startDate: '2026-07-10', endDate: '2026-07-11', status: 'Approved', reason: 'Fever and body ache', isHalfDay: false, createdAt: '2026-07-08T10:00:00Z' },
  { _id: 'lr2', leaveType: { name: 'Planned Leave' }, startDate: '2026-07-20', endDate: '2026-07-22', status: 'Pending', reason: 'Family function', isHalfDay: false, createdAt: '2026-07-06T14:30:00Z' },
  { _id: 'lr3', leaveType: { name: 'Compensatory Off' }, startDate: '2026-07-05', endDate: '2026-07-05', status: 'Pending', reason: 'Worked on Sunday for production release', isCompOff: true, workedDate: '2026-06-28', createdAt: '2026-07-04T09:00:00Z' },
  { _id: 'lr4', leaveType: { name: 'Sick/Casual Leave' }, startDate: '2026-06-25', endDate: '2026-06-25', status: 'Rejected', reason: 'Doctor appointment', isHalfDay: true, createdAt: '2026-06-24T11:00:00Z' },
  { _id: 'lr5', leaveType: { name: 'Floater Holiday' }, startDate: '2026-08-15', endDate: '2026-08-15', status: 'Approved', reason: 'Independence Day', createdAt: '2026-06-20T08:00:00Z', isFloater: true },
];

const demoReviewerRequests = {
  requests: [
    { _id: 'rr1', employee: { firstName: 'Rahul', lastName: 'Verma' }, leaveType: { name: 'Planned Leave' }, startDate: '2026-07-18', endDate: '2026-07-19', status: 'Pending', reason: 'Sister wedding', createdAt: '2026-07-06T10:00:00Z' },
    { _id: 'rr2', employee: { firstName: 'Neha', lastName: 'Patel' }, leaveType: { name: 'Sick/Casual Leave' }, startDate: '2026-07-14', endDate: '2026-07-14', status: 'Pending', reason: 'Not feeling well', isHalfDay: true, createdAt: '2026-07-07T08:30:00Z' },
    { _id: 'rr3', employee: { firstName: 'Vikram', lastName: 'Joshi' }, leaveType: { name: 'Compensatory Off' }, startDate: '2026-07-12', endDate: '2026-07-12', status: 'Pending', reason: 'Worked on holiday', isCompOff: true, workedDate: '2026-06-30', createdAt: '2026-07-05T16:00:00Z' },
  ],
  pagination: { total: 3, page: 1, pages: 1 },
};

function BalanceRing({ allocated, used, color = '#6366f1', size = 72 }) {
  const pct = allocated > 0 ? Math.min(100, Math.max(0, (used / allocated) * 100)) : 0
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      </svg>
      <span className="absolute text-lg font-bold" style={{ color }}>{Math.max(0, allocated - used)}</span>
    </div>
  )
}
import toast from 'react-hot-toast'
import { leaveAPI, workspaceAPI } from '../../services/api'
import useAuthStore from '../../store/authStore'

const statusStyles = {
  Pending: 'bg-amber-100 text-amber-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Cancelled: 'bg-gray-100 text-gray-800',
}

const getInitialForm = () => ({ leaveTypeId: '', startDate: '', endDate: '', isHalfDay: false, reason: '', workedDate: '' })

export default function LeaveList() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('my')
  const [myRequests, setMyRequests] = useState(demoMyRequests)
  const [reviewerData, setReviewerData] = useState(demoReviewerRequests)
  const [balance, setBalance] = useState(demoBalance)
  const [floaterRemaining, setFloaterRemaining] = useState(2)
  const [leaveTypes, setLeaveTypes] = useState(demoLeaveTypes)
  const [hrPolicy, setHrPolicy] = useState({ allowHalfDayLeave: true })
  const [loading, setLoading] = useState(true)
  const [showApply, setShowApply] = useState(false)
  const [form, setForm] = useState(getInitialForm())
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const [showLopWarning, setShowLopWarning] = useState(false)
  const [lopPendingForm, setLopPendingForm] = useState(null)

  const canApprove = user?.canApprove || user?.roleValue >= 4 || ['admin', 'hr', 'manager'].includes(user?.role)

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [myRes, balanceRes, wsRes] = await Promise.all([
        leaveAPI.getMyRequests(),
        leaveAPI.getBalance(),
        workspaceAPI.getDirectory(),
      ])
      if (myRes.data?.requests?.length) setMyRequests(myRes.data.requests)
      if (balanceRes.data?.data?.length) setBalance(balanceRes.data.data)
      if (balanceRes.data?.floaterRemaining != null) setFloaterRemaining(balanceRes.data.floaterRemaining)
      if (wsRes.data?.leaveTypes?.length) setLeaveTypes(wsRes.data.leaveTypes)
      if (wsRes.data?.hrPolicy) setHrPolicy(wsRes.data.hrPolicy)

      if (canApprove) {
        const revRes = await leaveAPI.getReviewerRequests()
        if (revRes.data?.requests?.length) setReviewerData(revRes.data)
      }
    } catch (err) {
      if (err.response?.status === 401) { navigate('/login'); return }
    } finally {
      setLoading(false)
    }
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    if (!form.leaveTypeId || !form.startDate || !form.endDate) {
      toast.error('Please fill in all required fields'); return
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      toast.error('End date must be after start date'); return
    }

    const selectedLt = leaveTypes.find(lt => lt.id === form.leaveTypeId)
    if (selectedLt?.isCompOff && !form.workedDate) {
      toast.error('Worked date is required for compensatory off'); return
    }

    setSaving(true)
    try {
      const payload = { ...form }
      if (!selectedLt?.isCompOff) delete payload.workedDate
      const res = await leaveAPI.apply(payload)
      toast.success(res.data?.message || 'Leave applied successfully')
      setShowApply(false)
      setForm(getInitialForm())
      loadAll()
    } catch (err) {
      const data = err.response?.data
      if (data?.insufficientBalance) {
        setLopPendingForm({ ...form })
        setShowLopWarning(true)
      } else {
        toast.error(data?.message || 'Failed to apply leave')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleProceedAsLop = async () => {
    if (!lopPendingForm) return
    setShowLopWarning(false)
    setSaving(true)
    try {
      const res = await leaveAPI.apply({ ...lopPendingForm, proceedAsLop: true })
      toast.success(res.data?.message || 'Leave applied as Loss of Pay')
      setShowApply(false)
      setForm(getInitialForm())
      setLopPendingForm(null)
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply leave')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelLop = () => {
    setShowLopWarning(false)
    setLopPendingForm(null)
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return
    try {
      const res = await leaveAPI.cancel(id)
      toast.success(res.data?.message || 'Leave cancelled')
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave')
    }
  }

  const handleReview = async (leaveApplicationId, action) => {
    let reason = ''
    if (action === 'reject') {
      reason = window.prompt('Enter rejection reason:')
      if (!reason) return
    }
    try {
      const res = await leaveAPI.review({ leaveApplicationId, action, reason })
      toast.success(res.data?.message || 'Decision submitted')
      loadAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit decision')
    }
  }

  const balanceMap = useMemo(() => {
    const m = {}
    for (const b of balance) {
      m[b.leaveTypeId] = { allocated: b.allocatedLeaves, used: b.usedLeaves, remaining: b.remainingLeaves, name: b.leaveTypeName }
    }
    return m
  }, [balance])

  const leaveTypeMap = useMemo(() => {
    const m = {}
    for (const lt of leaveTypes) m[lt.id] = lt
    return m
  }, [leaveTypes])

  const filteredRequests = useMemo(() => {
    let items = myRequests
    if (filterStatus) items = items.filter(r => r.status === filterStatus)
    return items
  }, [myRequests, filterStatus])

  const selectedLeaveType = useMemo(() => {
    return leaveTypes.find(lt => lt.id === form.leaveTypeId)
  }, [form.leaveTypeId, leaveTypes])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
      </div>
    )
  }

  const tabs = [
    { id: 'my', label: 'My Requests', count: myRequests.length },
    ...(canApprove ? [{ id: 'reviews', label: 'Reviews', count: reviewerData?.requests?.length || 0 }] : []),
    { id: 'apply', label: 'Apply Leave' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-500 mt-1">Apply and manage your leave requests</p>
          </div>
          <button onClick={() => { setShowApply(true); setActiveTab('apply') }}
            className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
            <Plus className="h-5 w-5 mr-2" /> Apply Leave
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
          {leaveTypes.map((lt) => {
            const b = balanceMap[lt.id]
            const isCompOrFloater = lt.isCompOff || lt.isFloater
            const color = lt.colorCode || '#6366f1'
            return (
              <div key={lt.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">{lt.name}</span>
                {isCompOrFloater ? (
                  <>
                    <div className="relative inline-flex items-center justify-center mb-1" style={{ width: 72, height: 72 }}>
                      <svg width="72" height="72" className="transform -rotate-90">
                        <circle cx="36" cy="36" r="30" fill="none" stroke="#f3f4f6" strokeWidth="6" />
                        <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="6"
                          strokeDasharray="188.5" strokeDashoffset="0" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-lg font-bold" style={{ color }}>
                        {lt.isFloater ? floaterRemaining : '--'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">{lt.isFloater ? 'of 2 remaining' : lt.isCompOff ? 'By approval' : ''}</p>
                  </>
                ) : (
                  <>
                    <BalanceRing allocated={b?.allocated || 0} used={b?.used || 0} color={color} />
                    <p className="text-[11px] text-gray-400 mt-1">{b ? `${b.used} used of ${b.allocated}` : '0 allocated'}</p>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="mb-4 border-b border-gray-200">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id === 'apply') setShowApply(true) }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-relisoft-600 text-relisoft-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-relisoft-100 text-relisoft-700' : 'bg-gray-100 text-gray-500'
                  }`}>{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'my' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none">
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No leave requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Approver</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRequests.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {r.leaveTypeName || 'Unknown'}
                          {r.isHalfDay && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">Half</span>}
                          {r.isLop && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">LOP</span>}
                          {r.isCompOff && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Comp Off</span>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {r.fromDate ? new Date(r.fromDate).toLocaleDateString() : '--'} - {r.toDate ? new Date(r.toDate).toLocaleDateString() : '--'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.totalDays || 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate">{r.reason || '--'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[r.status] || 'bg-gray-100 text-gray-800'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{r.approverName || '--'}</td>
                        <td className="px-6 py-4 text-right">
                          {r.canCancel && (
                            <button onClick={() => handleCancel(r.id)} title="Cancel leave"
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                              <Ban className="h-4 w-4" />
                            </button>
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

        {activeTab === 'reviews' && reviewerData && (
          <div className="space-y-6">
            {reviewerData.requests?.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-amber-50">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-600" />
                    Pending Reviews ({reviewerData.requests.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Team</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Days</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reason</th>
                        <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviewerData.requests.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-relisoft-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-semibold text-relisoft-700">
                                  {r.employeeName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{r.employeeName || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{r.employeeCode} - {r.employeeRole}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{r.primaryTeamName || '--'}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {r.leaveTypeName}
                            {r.isLop && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">LOP</span>}
                            {r.isCompOff && <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Comp Off</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {r.fromDate ? new Date(r.fromDate).toLocaleDateString() : '--'}
                            {r.isHalfDay && <span className="ml-1 text-xs text-purple-600 font-medium">(Half)</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{r.totalDays}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-[150px] truncate">{r.reason || '--'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleReview(r.id, 'approve')}
                                className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg flex items-center">
                                <Check className="h-3.5 w-3.5 mr-1" /> Approve
                              </button>
                              <button onClick={() => handleReview(r.id, 'reject')}
                                className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg flex items-center">
                                <XIcon className="h-3.5 w-3.5 mr-1" /> Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-400">
                <Check className="h-12 w-12 mx-auto mb-3 text-green-400" />
                <p className="text-lg font-medium">No pending reviews</p>
                <p className="text-sm">All leave requests have been reviewed</p>
              </div>
            )}

            {reviewerData.recentDecisions?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Decisions</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Dates</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Decision Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reviewerData.recentDecisions.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.employeeName}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {r.leaveTypeName}
                            {r.isLop && <span className="ml-1.5 text-xs text-red-600">(LOP)</span>}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {r.fromDate ? new Date(r.fromDate).toLocaleDateString() : '--'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[r.status]}`}>
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {r.actionedOn ? new Date(r.actionedOn).toLocaleDateString() : '--'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'apply' && showApply && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold">Apply Leave</h3>
                <button onClick={() => { setShowApply(false); setForm(getInitialForm()) }} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <form onSubmit={handleApplySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                  <select value={form.leaveTypeId} onChange={(e) => setForm({ ...form, leaveTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required>
                    <option value="">Select leave type</option>
                    {leaveTypes.map((lt) => {
                      const b = balanceMap[lt.id]
                      const suffix = lt.isFloater ? `(${floaterRemaining} remaining)` : lt.isCompOff ? '' : b ? `(${b.remaining} remaining)` : ''
                      return (
                        <option key={lt.id} value={lt.id}>
                          {lt.name} {suffix}
                        </option>
                      )
                    })}
                  </select>
                </div>

                {selectedLeaveType?.isCompOff && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Worked Date (for Comp Off)</label>
                    <input type="date" value={form.workedDate}
                      onChange={(e) => setForm({ ...form, workedDate: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                    <p className="text-xs text-gray-400 mt-1">Comp off must be availed within 1 month of the worked date</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" required />
                  </div>
                </div>

                {selectedLeaveType?.isFloater && (
                  <div className="flex items-center text-xs text-cyan-600 bg-cyan-50 rounded-lg px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                    Floater holidays: {floaterRemaining} of 2 remaining this year
                  </div>
                )}

                {hrPolicy?.allowHalfDayLeave && !selectedLeaveType?.isCompOff && (
                  <label className="flex items-center cursor-pointer">
                    <input type="checkbox" checked={form.isHalfDay} onChange={(e) => setForm({ ...form, isHalfDay: e.target.checked })}
                      className="rounded border-gray-300 text-relisoft-600 focus:ring-relisoft-600" />
                    <span className="ml-2 text-sm text-gray-600">Half Day</span>
                  </label>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none" rows={3} required />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => { setShowApply(false); setForm(getInitialForm()) }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={saving}
                    className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                    {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showLopWarning && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Insufficient Leave Balance</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                You do not have enough leave balance for this request. You may proceed as <strong>Loss of Pay (LOP)</strong>. 
                The excess days will be marked as unpaid leave.
              </p>
              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={handleCancelLop}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleProceedAsLop}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center">
                  Proceed as LOP
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
