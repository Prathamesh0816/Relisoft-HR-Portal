import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import ProjectBuilder from '../../components/ProjectBuilder'

vi.mock('../../api', () => ({
  createProject: vi.fn(),
  updateProject: vi.fn(),
  createTeam: vi.fn(),
  updateTeam: vi.fn(),
  deleteTeam: vi.fn(),
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

  it('lets a manager configure a separate delegate for each managed project', async () => {
    const originalUser = mockStore.currentUser
    const originalProjects = mockStore.data.projects
    mockStore.currentUser = { employeeId: 4, role: 'Manager' }
    mockStore.data.projects = [
      { id: 10, name: 'Project One', managerId: 4, managerName: 'Maya Manager', approvalRoute: 'Delegate', approvalDelegateEmployeeId: 6, approvalDelegateName: 'Dev Delegate', teams: [] },
      { id: 11, name: 'Project Two', managerId: 4, managerName: 'Maya Manager', approvalRoute: 'ProjectManager', teams: [] },
    ]

    render(<ProjectBuilder />)

    fireEvent.click(screen.getByRole('tab', { name: 'Delegation' }))
    expect(await screen.findByText('Project approval delegation')).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Project One' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Project Two' })).toBeInTheDocument()
    expect(screen.getByLabelText('Approval delegate')).toHaveValue('6')

    mockStore.currentUser = originalUser
    mockStore.data.projects = originalProjects
  })
})
