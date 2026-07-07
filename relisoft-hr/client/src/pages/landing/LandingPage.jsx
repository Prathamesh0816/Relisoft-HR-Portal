import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, CalendarCheck, Shield, BarChart3, Sparkles,
  ArrowRight, CheckCircle, Building2,
  Phone, Mail, MapPin, ExternalLink,
} from 'lucide-react'
import { getTheme } from '../../config/themes'

const features = [
  { icon: Users, title: 'Employee Management', desc: 'Complete lifecycle management from onboarding to separation with self-service portals for every employee.' },
  { icon: CalendarCheck, title: 'Leave & Attendance', desc: 'Simplified leave requests, real-time approvals, attendance tracking, and shift management in one place.' },
  { icon: BarChart3, title: 'Analytics & Reports', desc: 'Real-time HR analytics, workforce planning dashboards, and custom reports for data-driven decisions.' },
  { icon: Shield, title: 'Compliance & Security', desc: 'Enterprise-grade data protection and compliance tracking for regulatory requirements.' },
  { icon: Sparkles, title: 'Performance & Growth', desc: 'Goal tracking, performance reviews, training programs, and career development paths for every role.' },
  { icon: Building2, title: 'Workspace Tools', desc: 'Directory, service catalog, IT helpdesk, travel, and expense management all in one place.' },
]

export default function LandingPage() {
  const [theme, setTheme] = useState('default')

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'default'
    setTheme(saved)
  }, [])

  const config = getTheme(theme)
  const slides = config.slides

  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  const heroTitle = config.heroTitle

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <header className="border-b" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src="/assets/relisoft-logo.webp" alt="ReliSoft" className="h-8 w-auto" />
              <span className="text-lg font-bold" style={{ color: 'var(--ink)' }}>ReliSoft HR</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold px-5 py-2 rounded-lg transition-all" style={{ color: 'var(--moss)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider mb-6" style={{ borderColor: 'var(--line)', color: 'var(--moss)' }}>
                <Sparkles className="h-3.5 w-3.5" />
                ReliSoft Employee Portal
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.08] tracking-tight mb-6" style={{ color: 'var(--ink)' }}>
                {heroTitle}<br />
                <span style={{ color: 'var(--moss)' }}>One workspace.</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: 'var(--muted)' }}>
                Onboarding, leave, approvals, payroll, and workforce records — all in one reliable internal workspace for ReliSoft teams.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                  Enter Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-10">
                {['Onboarding', 'Leave', 'Approvals', 'Payroll', 'Directory', 'Helpdesk'].map(label => (
                  <span key={label} className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--muted)' }}>
                    <CheckCircle className="h-3.5 w-3.5" style={{ color: 'var(--moss)' }} /> {label}
                  </span>
                ))}
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border aspect-[4/3]" style={{ borderColor: 'var(--line)' }}>
                {slides.map((slide, i) => (
                  <img key={i} src={slide.image} alt={slide.title} className="w-full h-full object-contain absolute inset-0"
                    style={{ opacity: i === activeSlide ? 1 : 0, transition: 'opacity 800ms ease' }} />
                ))}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--moss) 30%, transparent), color-mix(in srgb, var(--copper) 15%, transparent))',
                }} />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {slides.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveSlide(idx)}
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: idx === activeSlide ? '20px' : '5px',
                        background: idx === activeSlide ? 'white' : 'rgba(255,255,255,0.4)',
                      }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: 'var(--ink)' }}>Everything you need</h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--muted)' }}>
              From hire to retire, manage every aspect of the employee experience in a single integrated workspace.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-xl p-6 transition-all border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--sage)' }}>
                    <Icon className="h-5 w-5" style={{ color: 'var(--moss)' }} />
                  </div>
                  <h3 className="font-bold mb-2" style={{ color: 'var(--ink)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16" style={{ background: 'var(--sage)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: 'var(--ink)' }}>Ready to get started?</h2>
          <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
            Sign in to access your workspace — onboarding, leave, payroll, and more.
          </p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Sign In to Your Workspace <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.webp" alt="ReliSoft" className="h-8 w-auto" />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                ReliSoft Technologies Private Limited is a dynamic IT solutions provider specializing in software development, digital transformation, and business automation.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--ink)' }}>Our Offices</h4>
              <div className="space-y-4 text-xs" style={{ color: 'var(--muted)' }}>
                <a href="https://maps.google.com/?q=204+RedBricks+Panchshil+Business+Park+Balewadi+Pune+411045"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:opacity-80 transition-opacity">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'var(--moss)' }} />
                  <span>
                    <strong className="block" style={{ color: 'var(--ink)' }}>India — Pune</strong>
                    204, RedBricks, Panchshil Business Park<br />
                    Level 2, Tower B &amp; C, Balewadi High Street<br />
                    Pune, Maharashtra 411045
                  </span>
                </a>
                <a href="https://maps.google.com/?q=733+Struck+Street+Madison+WI+53744"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-2 hover:opacity-80 transition-opacity">
                  <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: 'var(--moss)' }} />
                  <span>
                    <strong className="block" style={{ color: 'var(--ink)' }}>USA — Madison</strong>
                    733 Struck Street, Unit 44100<br />
                    Madison, WI 53744
                  </span>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--ink)' }}>Contact</h4>
              <div className="space-y-3 text-xs" style={{ color: 'var(--muted)' }}>
                <a href="tel:+917559406966" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Phone className="h-3.5 w-3.5" style={{ color: 'var(--moss)' }} />
                  +91-7559406966
                </a>
                <a href="mailto:contact@relisofttechnologies.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Mail className="h-3.5 w-3.5" style={{ color: 'var(--moss)' }} />
                  contact@relisofttechnologies.com
                </a>
                <a href="https://linkedin.com/company/relisoft-technologies-pvt-ltd"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <ExternalLink className="h-3.5 w-3.5" style={{ color: 'var(--moss)' }} />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-xs" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>
            &copy; {new Date().getFullYear()} ReliSoft Technologies Private Limited. Internal use only.
          </div>
        </div>
      </footer>
    </div>
  )
}
