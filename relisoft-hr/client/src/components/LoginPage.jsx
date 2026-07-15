import { useState } from 'react'
import useStore from '../store'

export default function LoginPage({ onLogin }) {
  const { authForm, updateAuthForm } = useStore()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await onLogin(authForm.username, authForm.password)
    setSubmitting(false)
  }

  const features = [
    { icon: '📋', label: 'Onboarding' },
    { icon: '🏖️', label: 'Leave' },
    { icon: '✅', label: 'Approvals' },
    { icon: '👥', label: 'Directory' },
  ]

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
              <p className="text-muted text-sm mt-2">Use your company username and password.</p>
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
    </section>
  )
}
