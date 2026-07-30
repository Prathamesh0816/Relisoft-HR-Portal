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

  it('shows and hides the password', async () => {
    const user = userEvent.setup()
    render(<LoginPage onLogin={mockLogin} />)
    const passwordInput = screen.getByLabelText('Password')

    expect(passwordInput).toHaveAttribute('type', 'password')

    await user.click(screen.getByRole('button', { name: 'Show password' }))
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Hide password' }))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
