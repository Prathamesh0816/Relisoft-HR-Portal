import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LeaveHome from '../../components/LeaveHome'

const mockApplyLeave = vi.fn()
const mockGetMyLeaveRequests = vi.fn()
const mockCancelLeave = vi.fn()
const mockRequestCancellation = vi.fn()
const mockCheckLeaveBalance = vi.fn()
const mockGetCompOffTransfers = vi.fn()

vi.mock('../../api', () => ({
  applyLeave: (...args) => mockApplyLeave(...args),
  getMyLeaveRequests: (...args) => mockGetMyLeaveRequests(...args),
  cancelLeave: (...args) => mockCancelLeave(...args),
  requestCancellation: (...args) => mockRequestCancellation(...args),
  checkLeaveBalance: (...args) => mockCheckLeaveBalance(...args),
  getCompOffTransfers: (...args) => mockGetCompOffTransfers(...args),
  loadWorkspace: vi.fn().mockResolvedValue({}),
  getFloaterUsage: vi.fn().mockResolvedValue(null),
  uploadMedicalCertificate: vi.fn(),
  applyCompOff: vi.fn(),
  transferCompOff: vi.fn(),
}))

const mockStore = {
  currentUser: { employeeId: 1, fullName: 'Preeti Patil', role: 'HRL2' },
  data: {
    employees: [
      { id: 1, fullName: 'Preeti Patil', employeeCode: 'EMP-001', primaryTeam: { name: 'Backend', leadName: 'Rakesh Patil' } },
      { id: 3, fullName: 'Aradhana Shinde', employeeCode: 'EMP-003', primaryTeam: { name: 'Frontend', leadName: 'Preeti Patil' } },
    ],
    projects: [{ id: 1, name: 'Test Project', teams: [{ id: 1, name: 'Frontend' }, { id: 2, name: 'Backend' }] }],
    leaveTypes: [
      { id: 1, name: 'Sick/Casual Leave', maxConsecutiveDays: 3, requiresAdvanceNotice: false },
      { id: 2, name: 'Planned Leave', maxConsecutiveDays: 15, requiresAdvanceNotice: true, advanceNoticeDays: 3 },
    ],
    roles: [],
    hrPolicy: { allowHalfDayLeave: false, sandwichLeave: false },
  },
  leaveForm: { employeeId: '', leaveTypeId: '', startDate: '', endDate: '', isHalfDay: false, reason: '', submitting: false, balanceCheck: null },
  myLeaves: { employeeId: '', requests: [], loading: false },
  updateForm: vi.fn(),
  setSubmitting: vi.fn(),
  resetForm: vi.fn(),
  setMyLeaves: vi.fn(),
  setMessage: vi.fn(),
}

vi.mock('../../store', () => ({
  default: () => mockStore,
}))

describe('LeaveHome', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStore.myLeaves = { employeeId: '', requests: [], loading: false }
    mockGetMyLeaveRequests.mockResolvedValue({ requests: [] })
    mockGetCompOffTransfers.mockResolvedValue([])
    mockCheckLeaveBalance.mockResolvedValue({ remaining: 10, allocated: 12, used: 2 })
  })

  it('renders leave application form', async () => {
    render(<LeaveHome />)
    await waitFor(() => {
      expect(screen.getByText(/apply for leave/i)).toBeInTheDocument()
    })
  })

  it('shows loading state when requests are loading', () => {
    mockStore.myLeaves.loading = true
    render(<LeaveHome />)
    expect(screen.getByText('Loading leave requests...')).toBeInTheDocument()
  })

  it('shows empty state when no requests', async () => {
    render(<LeaveHome />)
    await waitFor(() => {
      expect(screen.getByText('No leave requests submitted yet.')).toBeInTheDocument()
    })
  })
})
