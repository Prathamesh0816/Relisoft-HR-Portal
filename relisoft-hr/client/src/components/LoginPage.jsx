import { useState, useEffect } from 'react'
import useStore from '../store'

const slides = [
  { image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200', title: 'Teams in flow' },
  { image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200', title: 'Onboarding and growth' },
  { image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200', title: 'Work and wellbeing' }
]

export default function LoginPage({ onLogin }) {
  const { authForm, updateAuthForm } = useStore()
  const [activeSlide, setActiveSlide] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setActiveSlide((s) => (s + 1) % slides.length), 4400)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await onLogin(authForm.username, authForm.password)
    setSubmitting(false)
  }

  return (
    <section className="relative min-h-screen overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} className={`absolute inset-0 transition-all duration-700 ease-in-out ${i === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/40 to-white/80" />
        </div>
      ))}
      <div className="relative z-10 min-h-screen grid md:grid-cols-[1.2fr_0.8fr] gap-8 items-stretch p-8 md:p-12">
        <div className="flex flex-col justify-center max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-xl bg-white/95 shadow-lg flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold text-xs">RS</div>
              </div>
              <div>
                <div className="font-heading font-extrabold text-navy text-lg">ReliSoft Technologies</div>
                <div className="text-muted text-sm">People Hub</div>
              </div>
            </div>
            <h1 className="font-heading font-bold text-5xl md:text-7xl leading-[0.94] text-navy">
              People operations,<br />designed with <span className="gold-gradient-text">clarity</span>.
            </h1>
            <p className="text-lg text-muted max-w-xl leading-relaxed">
              Onboarding, leave, approvals, and workforce records brought together in one calm, reliable workspace for ReliSoft teams.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Onboarding', 'Leave', 'Approvals', 'Directory'].map((label) => (
                <span key={label} className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-white/60 text-navy/80 text-sm font-bold shadow-lg">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-stretch justify-end">
          <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl border border-white/60 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-gold-1/10 via-transparent to-purple-500/5" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-1 via-gold-2 to-teal-500" />
            <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center min-h-full">
              <span className="text-xs font-bold tracking-widest text-gold-1 uppercase">Workspace access</span>
              <h2 className="font-heading font-bold text-4xl mt-3 text-navy">Sign in</h2>
              <p className="text-muted text-sm mt-3">Use your company username and password to enter the ReliSoft workspace.</p>
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
