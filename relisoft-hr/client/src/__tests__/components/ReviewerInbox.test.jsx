import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ReviewerInbox from '../../components/ReviewerInbox'

const mockGetReviewerRequests = vi.fn()
const mockMakeDecision = vi.fn()
const mockLoadWorkspace = vi.fn()
const mockGetDelegates = vi.fn()

vi.mock('../../api', () => ({
  getReviewerRequests: (...args) => mockGetReviewerRequests(...args),
  makeDecision: (...args) => mockMakeDecision(...args),
  loadWorkspace: (...args) => mockLoadWorkspace(...args),
  getDelegates: (...args) => mockGetDelegates(...args),
  addDelegate: vi.fn(),
  removeDelegate: vi.fn(),
  uploadMedicalCertificate: vi.fn(),
}))

const baseReviewer = {
  reviewerId: '1', reviewerName: 'Preeti Patil',
  requests: [], cancellationRequests: [], recentDecisions: [], loading: false,
}

const mockStore = {
  currentUser: { employeeId: 1, fullName: 'Preeti Patil', role: 'HRL2' },
  data: {
    employees: [{ id: 1, fullName: 'Preeti Patil', role: 'HRL2' }],
    leaveTypes: [], projects: [], roles: [],
  },
  reviewer: { ...baseReviewer },
  setReviewerId: vi.fn(),
  setReviewerData: vi.fn(),
  setData: vi.fn(),
  setMessage: vi.fn(),
}

vi.mock('../../store', () => ({
  default: () => mockStore,
}))

describe('ReviewerInbox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetDelegates.mockResolvedValue([])
    mockGetReviewerRequests.mockResolvedValue({
      reviewer: { fullName: 'Preeti Patil' },
      requests: [], cancellationRequests: [], recentDecisions: [],
    })
    mockStore.reviewer = { ...baseReviewer }
  })

  it('renders reviewer inbox heading', async () => {
    render(<ReviewerInbox />)
    await waitFor(() => {
      expect(screen.getByText('Reviewer inbox')).toBeInTheDocument()
    })
  })

  it('shows empty state when no requests', async () => {
    render(<ReviewerInbox />)
    await waitFor(() => {
      expect(screen.getByText('No pending leave requests are assigned to this reviewer right now.')).toBeInTheDocument()
    })
  })
})
