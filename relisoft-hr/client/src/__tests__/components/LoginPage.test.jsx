import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../../components/LoginPage'

const mockLogin = vi.fn()

const mockStore = {
  authForm: { username: '', password: '' },
  updateAuthForm: vi.fn(),
}

vi.mock('../../store', () => ({
  default: () => mockStore,
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset()
    mockStore.updateAuthForm.mockReset()
    mockStore.authForm = { username: '', password: '' }
  })

  it('renders login form', () => {
    render(<LoginPage onLogin={mockLogin} />)
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls onLogin when form is submitted', async () => {
    mockStore.authForm = { username: 'testuser', password: 'testpass' }
    mockLogin.mockResolvedValue(undefined)

    render(<LoginPage onLogin={mockLogin} />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpass')
    })
  })
})
