import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProjectBuilder from '../../components/ProjectBuilder'

vi.mock('../../api', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  loadWorkspace: vi.fn(),
}))

const mockStore = {
  currentUser: { employeeId: 1, role: 'HRL2' },
  data: {
    employees: [
      { id: 4, employeeCode: 'EMP-004', fullName: 'Maya Manager', role: 'Manager', status: 'Active' },
      { id: 6, employeeCode: 'EMP-006', fullName: 'Dev Delegate', role: 'Employee', status: 'Active' },
      { id: 7, employeeCode: 'EMP-007', fullName: 'Former Employee', role: 'Employee', status: 'Separated' },
    ],
    projects: [],
  },
  projectForm: {
    name: '', managerId: '4', approvalRoute: 'Delegate', delegateEmployeeId: '6',
  },
  teamForm: { name: '', projectId: '', leadId: '' },
  updateForm: vi.fn(),
  resetForm: vi.fn(),
  setData: vi.fn(),
  setMessage: vi.fn(),
}

vi.mock('../../store', () => ({
  default: () => mockStore,
}))

describe('ProjectBuilder', () => {
  it('lists active employees directly in the project delegate selector', () => {
    render(<ProjectBuilder />)

    const selector = screen.getByLabelText('Approval delegate')
    expect(selector).toHaveValue('6')
    expect(screen.getByRole('option', { name: 'Dev Delegate (EMP-006)' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Maya Manager (EMP-004)' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Former Employee (EMP-007)' })).not.toBeInTheDocument()
  })
})
