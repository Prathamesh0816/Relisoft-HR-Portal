import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LeaveCalendar from '../../components/LeaveCalendar'

const mockGetHolidays = vi.fn()
const mockGetLeaveCalendar = vi.fn()

vi.mock('../../api', () => ({
  getHolidays: (...args) => mockGetHolidays(...args),
  getLeaveCalendar: (...args) => mockGetLeaveCalendar(...args),
}))

describe('LeaveCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const eventDate = `${year}-${month}-15`

    mockGetHolidays.mockResolvedValue([
      { id: 1, name: 'Company Holiday', date: eventDate, day: 'Monday', type: 'Fixed' },
    ])
    mockGetLeaveCalendar.mockResolvedValue({
      leaves: [{
        id: 10,
        employeeId: 3,
        employeeName: 'Aradhana Shinde',
        employeeCode: 'EMP-003',
        leaveTypeName: 'Planned Leave',
        fromDate: `${eventDate}T00:00:00`,
        toDate: `${eventDate}T00:00:00`,
        totalDays: 1,
      }],
    })
  })

  it('renders approved leave only on its actual calendar date', async () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const lastDay = String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, '0')

    render(<LeaveCalendar />)

    await waitFor(() => {
      expect(screen.getByText('Aradhana Shinde · Planned Leave')).toBeInTheDocument()
      expect(screen.getAllByText('Company Holiday').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('Aradhana Shinde · Planned Leave')).toHaveLength(1)
    expect(mockGetLeaveCalendar).toHaveBeenCalledWith(`${year}-${month}-01`, `${year}-${month}-${lastDay}`)
  })

  it('styles today with the same red treatment shown in the legend', () => {
    render(<LeaveCalendar />)
    expect(screen.getByTestId('calendar-today')).toHaveClass('bg-red-50', 'text-red-600')
  })

  it('shows distinct visible colors for every legend item', () => {
    render(<LeaveCalendar />)
    expect(screen.getByTestId('legend-leave-day')).toHaveClass('rounded-full', 'bg-amber-800')
    expect(screen.getByTestId('legend-today')).toHaveClass('rounded-full', 'bg-red-600', 'dark:bg-red-400')
    expect(screen.getByTestId('legend-holiday')).toHaveClass('rounded-full', 'bg-green-800', 'dark:bg-green-300')
  })

  it('shows a separate Fixed and Optional legend for the holiday list', () => {
    render(<LeaveCalendar />)
    expect(screen.getByText('Calendar legend')).toBeInTheDocument()
    expect(screen.getByLabelText('Holiday type legend')).toBeInTheDocument()
    expect(screen.getByTestId('legend-fixed')).toHaveClass('bg-green-500')
    expect(screen.getByTestId('legend-optional')).toHaveClass('bg-amber-400')
  })
})
