import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPost = vi.fn()
const mockGet = vi.fn()

vi.mock('axios', () => ({
  default: {
    create: () => ({
      post: mockPost,
      get: mockGet,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
  },
}))

beforeEach(() => {
  const store = {}
  globalThis.localStorage = {
    getItem: vi.fn((k) => store[k] ?? null),
    setItem: vi.fn((k, v) => { store[k] = v }),
    removeItem: vi.fn((k) => { delete store[k] }),
  }
})

const api = await import('../api')

describe('API layer', () => {
  beforeEach(() => {
    mockPost.mockReset()
    mockGet.mockReset()
  })

  it('login calls POST /api/auth/login', async () => {
    mockPost.mockResolvedValue({ data: { token: 'abc', fullName: 'Test' } })
    const result = await api.login('testuser', 'password')
    expect(mockPost).toHaveBeenCalledWith('/api/auth/login', { username: 'testuser', password: 'password' })
    expect(result.token).toBe('abc')
  })

  it('loadWorkspace calls GET /api/workspace', async () => {
    mockGet.mockResolvedValue({ data: { employees: [], projects: [] } })
    const result = await api.loadWorkspace()
    expect(mockGet).toHaveBeenCalledWith('/api/workspace')
    expect(result.employees).toEqual([])
  })

  it('applyLeave calls POST /api/leave/apply-leave', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Applied' } })
    const result = await api.applyLeave({ employeeId: 3, leaveTypeId: 1 })
    expect(mockPost).toHaveBeenCalledWith('/api/leave/apply-leave', { employeeId: 3, leaveTypeId: 1 })
    expect(result.message).toBe('Applied')
  })

  it('getMyLeaveRequests calls GET endpoint', async () => {
    mockGet.mockResolvedValue({ data: { requests: [{ id: 1 }] } })
    const result = await api.getMyLeaveRequests(3)
    expect(mockGet).toHaveBeenCalledWith('/api/leave/employee/3/requests')
    expect(result.requests).toHaveLength(1)
  })

  it('cancelLeave calls POST /api/leave/:id/cancel', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Cancelled' } })
    const result = await api.cancelLeave(1, { employeeId: 3, reason: 'No longer needed' })
    expect(mockPost).toHaveBeenCalledWith('/api/leave/1/cancel', { employeeId: 3, reason: 'No longer needed' })
    expect(result.message).toBe('Cancelled')
  })

  it('requestCancellation calls POST /api/leave/:id/request-cancellation', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Requested' } })
    const result = await api.requestCancellation(1, { employeeId: 3, reason: 'Test' })
    expect(mockPost).toHaveBeenCalledWith('/api/leave/1/request-cancellation', { employeeId: 3, reason: 'Test' })
  })

  it('bulkDecision calls POST /api/leave/reviewer/bulk-decision', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Done' } })
    const result = await api.bulkDecision({ leaveIds: [1, 2], action: 'approve', approverId: 1 })
    expect(mockPost).toHaveBeenCalledWith('/api/leave/reviewer/bulk-decision', { leaveIds: [1, 2], action: 'approve', approverId: 1 })
  })

  it('getLeaveCalendar calls GET /api/leave/calendar with params', async () => {
    mockGet.mockResolvedValue({ data: [{ id: 1 }] })
    const result = await api.getLeaveCalendar('2026-07-01', '2026-07-31')
    expect(mockGet).toHaveBeenCalledWith('/api/leave/calendar?from=2026-07-01&to=2026-07-31')
  })

  it('createTicket calls POST /api/tickets', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Created' } })
    const result = await api.createTicket({ employeeId: 3, subject: 'Test' })
    expect(mockPost).toHaveBeenCalledWith('/api/tickets', { employeeId: 3, subject: 'Test' })
  })

  it('getEmployeeTickets calls GET endpoint', async () => {
    mockGet.mockResolvedValue({ data: { tickets: [{ id: 1 }] } })
    const result = await api.getEmployeeTickets(3)
    expect(mockGet).toHaveBeenCalledWith('/api/tickets/employee/3')
    expect(result.tickets).toHaveLength(1)
  })

  it('getReviewerRequests calls GET endpoint', async () => {
    mockGet.mockResolvedValue({ data: { requests: [], recentDecisions: [] } })
    const result = await api.getReviewerRequests(1)
    expect(mockGet).toHaveBeenCalledWith('/api/leave/reviewer/1/requests')
  })

  it('makeDecision calls POST /api/leave/reviewer/decision', async () => {
    mockPost.mockResolvedValue({ data: { message: 'Done' } })
    const result = await api.makeDecision({ leaveApplicationId: 1, approverId: 1, action: 'approve' })
    expect(mockPost).toHaveBeenCalledWith('/api/leave/reviewer/decision', { leaveApplicationId: 1, approverId: 1, action: 'approve' })
  })

  it('getOnboardingProfile calls GET endpoint', async () => {
    mockGet.mockResolvedValue({ data: { profile: { panNumber: 'ABCDE1234F' } } })
    const result = await api.getOnboardingProfile(3)
    expect(mockGet).toHaveBeenCalledWith('/api/onboarding/3')
    expect(result.profile.panNumber).toBe('ABCDE1234F')
  })
})
