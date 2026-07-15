import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TicketManagement from '../../components/TicketManagement'

const mockCreateTicket = vi.fn()
const mockGetEmployeeTickets = vi.fn()
const mockGetHrTickets = vi.fn()

vi.mock('../../api', () => ({
  createTicket: (...args) => mockCreateTicket(...args),
  getEmployeeTickets: (...args) => mockGetEmployeeTickets(...args),
  getHrTickets: (...args) => mockGetHrTickets(...args),
  addTimeline: vi.fn(),
  cancelTicket: vi.fn(),
}))

const mockStore = {
  currentUser: { employeeId: 1, fullName: 'Preeti Patil', role: 'Employee' },
  data: { employees: [{ id: 1, fullName: 'Preeti Patil' }] },
  ticketForm: { employeeId: '1', category: 'General', requestType: 'Other Inquiry', itemDetail: '', subject: '', description: '', submitting: false },
  employeeTickets: { employeeId: '1', tickets: [], loading: false },
  hrTickets: { tickets: [], loading: false },
  updateForm: vi.fn(),
  setSubmitting: vi.fn(),
  resetForm: vi.fn(),
  setEmployeeTickets: vi.fn(),
  setHrTickets: vi.fn(),
  setMessage: vi.fn(),
}

vi.mock('../../store', () => ({
  default: () => mockStore,
}))

describe('TicketManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetEmployeeTickets.mockResolvedValue({ tickets: [] })
    mockGetHrTickets.mockResolvedValue({ tickets: [] })
    mockCreateTicket.mockResolvedValue({ message: 'Created' })
    mockStore.employeeTickets = { employeeId: '1', tickets: [], loading: false }
    mockStore.hrTickets = { tickets: [], loading: false }
  })

  it('renders raise a ticket heading', async () => {
    render(<TicketManagement />)
    await waitFor(() => {
      expect(screen.getByText('Raise a ticket')).toBeInTheDocument()
    })
  })

  it('shows new ticket form for HR', async () => {
    render(<TicketManagement />)
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Brief summary of your request')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Describe your request in detail.')).toBeInTheDocument()
    })
  })
})
