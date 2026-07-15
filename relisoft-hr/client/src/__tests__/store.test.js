import { describe, it, expect, beforeEach } from 'vitest'
import useStore from '../store'

describe('Store', () => {
  beforeEach(() => {
    useStore.setState({
      currentUser: null,
      message: null,
      loading: true,
      data: { employees: [], projects: [], leaveTypes: [], roles: [] },
      reviewer: { reviewerId: '', reviewerName: '', requests: [], cancellationRequests: [], recentDecisions: [], loading: false },
      myLeaves: { employeeId: '', requests: [], loading: false },
      employeeTickets: { employeeId: '', tickets: [], loading: false },
      hrTickets: { tickets: [], loading: false },
    })
  })

  it('starts with loading state', () => {
    const state = useStore.getState()
    expect(state.loading).toBe(true)
    expect(state.currentUser).toBeNull()
  })

  it('setCurrentUser updates user', () => {
    const user = { fullName: 'Preeti Patil', role: 'HRL2', token: 'abc' }
    useStore.getState().setCurrentUser(user)
    expect(useStore.getState().currentUser).toEqual(user)
  })

  it('setMessage stores message', () => {
    const msg = { type: 'success', text: 'Done' }
    useStore.getState().setMessage(msg)
    expect(useStore.getState().message).toEqual(msg)
  })

  it('setData stores workspace data', () => {
    const data = { employees: [{ id: 1, fullName: 'Test' }], projects: [], leaveTypes: [], roles: [] }
    useStore.getState().setData(data)
    expect(useStore.getState().data.employees).toHaveLength(1)
  })

  it('setActiveView updates view and clears message', () => {
    useStore.getState().setMessage({ type: 'error', text: 'Oops' })
    useStore.getState().setActiveView('dashboard')
    expect(useStore.getState().activeView).toBe('dashboard')
    expect(useStore.getState().message).toBeNull()
  })

  it('setReviewerData stores reviewer info', () => {
    useStore.getState().setReviewerData({ reviewerId: 1, reviewerName: 'Preeti', requests: [{ id: 1 }] })
    const state = useStore.getState()
    expect(state.reviewer.reviewerId).toBe(1)
    expect(state.reviewer.requests).toHaveLength(1)
  })

  it('setMyLeaves stores leave data', () => {
    useStore.getState().setMyLeaves({ employeeId: 3, requests: [{ id: 1, status: 'Pending' }] })
    const state = useStore.getState()
    expect(state.myLeaves.employeeId).toBe(3)
    expect(state.myLeaves.requests).toHaveLength(1)
  })

  it('setEmployeeTickets stores ticket data', () => {
    useStore.getState().setEmployeeTickets({ employeeId: 3, tickets: [{ id: 1 }] })
    expect(useStore.getState().employeeTickets.tickets).toHaveLength(1)
  })

  it('setHrTickets stores HR ticket queue', () => {
    useStore.getState().setHrTickets({ tickets: [{ id: 1 }, { id: 2 }] })
    expect(useStore.getState().hrTickets.tickets).toHaveLength(2)
  })

  it('updateForm updates form fields', () => {
    useStore.getState().updateForm('leaveForm', 'reason', 'Sick')
    expect(useStore.getState().leaveForm.reason).toBe('Sick')
  })

  it('setSubmitting toggles submit state', () => {
    useStore.getState().setSubmitting('leaveForm', true)
    expect(useStore.getState().leaveForm.submitting).toBe(true)
  })

  it('logout clears user and data', () => {
    useStore.getState().setCurrentUser({ fullName: 'Test' })
    useStore.getState().logout()
    expect(useStore.getState().currentUser).toBeNull()
    expect(useStore.getState().activeView).toBe('login')
  })
})
