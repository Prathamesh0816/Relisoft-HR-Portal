import { useState } from 'react'
import useStore from '../store'
import { forgotPassword, resetPassword } from '../api'

export default function LoginPage({ onLogin }) {
  const { authForm, updateAuthForm } = useStore()
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [resetStep, setResetStep] = useState('request') // request | token | done
  const [resetMsg, setResetMsg] = useState(null)
  const [resetSubmitting, setResetSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await onLogin(authForm.username, authForm.password)
    setSubmitting(false)
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setResetSubmitting(true)
    setResetMsg(null)
    try {
      const r = await forgotPassword(authForm.username || '')
      if (r.devToken) {
        setResetStep('token')
        setResetMsg({ type: 'info', text: 'Dev mode: use the reset token below to set a new password.' })
        setResetToken(r.devToken)
      } else {
        setResetStep('request')
        setResetMsg({ type: 'success', text: r.message })
      }
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.message || 'Failed to request reset.' })
    }
    setResetSubmitting(false)
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setResetSubmitting(true)
    setResetMsg(null)
    const token = resetToken.trim()
    const newPassword = e.target.elements.newPassword.value
    const confirm = e.target.elements.confirmPassword.value
    if (newPassword !== confirm) {
      setResetMsg({ type: 'error', text: 'Passwords do not match.' })
      setResetSubmitting(false)
      return
    }
    try {
      const r = await resetPassword(token, newPassword)
      setResetStep('done')
      setResetMsg({ type: 'success', text: r.message })
    } catch (err) {
      setResetMsg({ type: 'error', text: err.response?.data?.message || 'Reset failed.' })
    }
    setResetSubmitting(false)
  }

  const features = [
    { icon: '📋', label: 'Onboarding' },
    { icon: '🏖️', label: 'Leave' },
    { icon: '✅', label: 'Approvals' },
    { icon: '👥', label: 'Directory' },
  ]

  const resetForm = () => {
    setForgotOpen(false)
    setResetStep('request')
    setResetMsg(null)
    setResetToken('')
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-navy-dark">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold-1/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gold-1/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 rounded-full bg-gold-1/40" />
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 rounded-full bg-gold-1/30" />
        <div className="absolute bottom-1/4 right-1/4 w-1 h-1 rounded-full bg-gold-1/20" />
      </div>
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.1fr_0.9fr] items-stretch">
        <div className="flex flex-col justify-center px-8 md:px-16 py-12">
          <div className="max-w-xl">
            <img src="/relisoft-logo.webp" alt="ReliSoft" className="h-10 w-auto mb-8" />
            <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white">
              People operations,<br />designed with <span className="gold-gradient-text">clarity</span>.
            </h1>
            <p className="text-lg text-white/60 mt-4 max-w-lg leading-relaxed">
              Onboarding, leave, approvals, and workforce records brought together in one calm, reliable workspace for ReliSoft teams.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              {features.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/80 text-sm font-medium">
                  {f.icon} {f.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center px-8 md:px-16 py-12">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-1 via-gold-2 to-gold-1" />
            <div className="p-8 md:p-10">
              <span className="text-xs font-bold tracking-widest text-gold-1 uppercase">Workspace access</span>
              <h2 className="font-heading font-bold text-3xl mt-2 text-navy-dark">Sign in</h2>
              <p className="text-muted text-sm mt-2">Use your company username or your official <span className="font-bold text-navy">@relisofttechnologies.com</span> email.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-navy/70 uppercase tracking-wider">Username</label>
                  <input
                    value={authForm.username}
                    onChange={(e) => updateAuthForm('username', e.target.value)}
                    placeholder="Enter username"
                    required
                    className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => updateAuthForm('password', e.target.value)}
                    placeholder="Enter password"
                    required
                    className="mt-1.5 w-full h-12 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy"
                  />
                </div>
                <div className="flex justify-end -mt-1">
                  <button type="button" onClick={() => setForgotOpen(true)} className="text-xs font-bold text-gold-1 hover:text-gold-2 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <button type="submit" disabled={submitting} className="gold-button w-full h-12 rounded-xl font-bold text-sm">
                  {submitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              <div className="mt-6 pt-5 border-t border-navy/10">
                <span className="text-xs font-bold text-navy/50">Secure sign-in for employees, HR, and leadership</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-xl text-navy-dark">Reset your password</h3>
              <button onClick={resetForm} className="text-navy/40 hover:text-navy text-xl font-bold">&times;</button>
            </div>
            {resetMsg && (
              <div className={`text-xs font-bold px-3 py-2 rounded-lg mb-3 ${resetMsg.type === 'error' ? 'bg-red-50 text-red-700' : resetMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                {resetMsg.text}
              </div>
            )}
            {resetStep === 'request' && (
              <form onSubmit={handleForgot} className="space-y-3">
                <p className="text-sm text-muted">Enter your username and we'll send you a password reset link.</p>
                <input
                  value={authForm.username}
                  onChange={(e) => updateAuthForm('username', e.target.value)}
                  placeholder="Username"
                  required
                  className="w-full h-11 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy text-sm"
                />
                <button type="submit" disabled={resetSubmitting} className="gold-button w-full h-11 rounded-xl font-bold text-sm">
                  {resetSubmitting ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}
            {resetStep === 'token' && (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-navy/70 uppercase tracking-wider">Reset token</label>
                  <input
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste your reset token"
                    required
                    className="mt-1 w-full h-11 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 uppercase tracking-wider">New password</label>
                  <input type="password" name="newPassword" required minLength={6} placeholder="Min 6 characters" className="mt-1 w-full h-11 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-navy/70 uppercase tracking-wider">Confirm password</label>
                  <input type="password" name="confirmPassword" required minLength={6} placeholder="Repeat new password" className="mt-1 w-full h-11 px-4 rounded-xl border border-navy/10 bg-white focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none text-navy text-sm" />
                </div>
                <button type="submit" disabled={resetSubmitting} className="gold-button w-full h-11 rounded-xl font-bold text-sm">
                  {resetSubmitting ? 'Resetting...' : 'Set new password'}
                </button>
              </form>
            )}
            {resetStep === 'done' && (
              <div className="space-y-3">
                <button onClick={resetForm} className="gold-button w-full h-11 rounded-xl font-bold text-sm">Back to sign in</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
