import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Bell, Search, ChevronDown, User, Settings, LogOut, Palette, Moon, Sun } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import useAppStore from '../../store/appStore'
import { useTheme } from '../../context/ThemeContext'
import WorldClock from '../common/WorldClock'

const breadcrumbMap = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/attendance': 'Attendance',
  '/leaves': 'Leaves',
  '/shifts': 'Shifts',
  '/holidays': 'Holidays',
  '/recruitment': 'Recruitment',
  '/onboarding': 'Onboarding',
  '/performance': 'Performance',
  '/training': 'Training',
  '/payroll': 'Payroll',
  '/fnf': 'FnF',
  '/travel': 'Travel & Expense',
  '/helpdesk': 'Helpdesk',
  '/assets': 'Assets',
  '/documents': 'Documents',
  '/workflows': 'Workflows',
  '/compliance': 'Compliance',
  '/engagement': 'Engagement',
  '/separation': 'Separation',
  '/analytics': 'Analytics',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/integrations': 'Integrations',
  '/automation': 'Automation',
  '/security': 'Security',
  '/mobile': 'Mobile',
  '/admin': 'Admin Panel',
  '/social-feed': 'Social Feed',
  '/alumni': 'Alumni Portal',
  '/world-clock': 'World Clock',
  '/news': 'News Feed',
  '/ai-companion': 'Nova AI Companion',
  '/hr-assistant': 'HR Assistant',
  '/hr-tickets': 'HR Support Tickets',
  '/mandir-darshan': 'Cultural Compass',

}

export default function Header({ onToggleSidebar }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useAppStore()
  const { dark, toggleDark } = useTheme()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [themeOpen, setThemeOpen] = useState(false)
  const dropdownRef = useRef(null)
  const searchRef = useRef(null)
  const themeRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [searchOpen])

  const pathSegments = location.pathname.split('/').filter(Boolean)
  const breadcrumbs = []
  let accumulated = ''

  for (const seg of pathSegments) {
    accumulated += '/' + seg
    const label = breadcrumbMap[accumulated]
    if (label) {
      breadcrumbs.push({ path: accumulated, label })
    }
  }

  const currentTitle =
    breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : 'Dashboard'

  return (
    <header className="sticky top-0 z-30" style={{ background: 'var(--panel)', borderBottom: '1px solid var(--line)', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)' }}>
      <div className="header-bar" />
      <div className="h-[calc(4rem-1px)] flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <nav className="hidden sm:flex items-center gap-1.5 text-sm" style={{ color: 'var(--muted)' }}>
              <Link to="/dashboard" className="transition-colors" style={{ color: 'var(--muted)' }}>
                Home
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={crumb.path} className="flex items-center gap-1.5">
                  <span style={{ color: 'var(--line)' }}>/</span>
                  {idx === breadcrumbs.length - 1 ? (
                    <span className="font-medium" style={{ color: 'var(--ink)' }}>{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="transition-colors" style={{ color: 'var(--muted)' }}>
                      {crumb.label}
                    </Link>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="text-lg font-semibold sm:hidden" style={{ color: 'var(--ink)' }}>{currentTitle}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex items-center">
            <div className="flex items-center rounded-lg border transition-all duration-200"
              style={{
                borderColor: searchOpen ? 'var(--moss)' : 'var(--line)',
                background: searchOpen ? 'var(--panel)' : 'var(--sage)',
              }}>
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: 'var(--muted)' }}
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchOpen && (
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules, employees..."
                  className="bg-transparent border-none outline-none px-1 py-1.5 text-sm w-56"
                  style={{ color: 'var(--ink)' }}
                />
              )}
            </div>
          </div>

          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              className="relative p-2 rounded-lg transition-colors"
              style={{ color: 'var(--muted)' }}
              aria-label="Theme"
            >
              <Palette className="h-5 w-5" />
            </button>
            {themeOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg shadow-lg border py-1 z-50"
                style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Theme</div>
                <button onClick={() => { useAuthStore.getState().setTheme('default'); setThemeOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}>
                  <span className="w-4 h-4 rounded-full border" style={{ background: 'linear-gradient(135deg,#2563eb,#f59e0b)' }} />
                  Professional
                </button>
                <button onClick={() => { useAuthStore.getState().setTheme('maharashtra'); setThemeOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}>
                  <span className="w-4 h-4 rounded-full border" style={{ background: 'linear-gradient(135deg,#c5542a,#d4a017)' }} />
                  Maharashtra Culture
                </button>
                <button onClick={() => { useAuthStore.getState().setTheme('fun'); setThemeOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}>
                  <span className="w-4 h-4 rounded-full border" style={{ background: 'linear-gradient(135deg,#1b8c3a,#ff6f00)' }} />
                  Cricket & Fun
                </button>
                <hr className="my-1" style={{ borderColor: 'var(--line)' }} />
                <button onClick={() => { toggleDark(); setThemeOpen(false) }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}>
                  {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {dark ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>
            )}
          </div>

          <WorldClock />

          <button
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: 'var(--muted)' }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center shadow-sm"
                style={{ background: 'var(--header-bar)' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg transition-colors border"
              style={{ borderColor: 'transparent' }}
            >
              <div className="h-8 w-8 rounded-full text-white flex items-center justify-center text-sm font-semibold icon-gradient">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                style={{ color: 'var(--muted)' }} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50"
                style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}>
                <div className="px-4 py-2" style={{ borderBottom: '1px solid var(--line)' }}>
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>{user?.name || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{user?.email || ''}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--ink)' }}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <hr style={{ borderColor: 'var(--line)' }} />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors"
                  style={{ color: 'var(--danger)' }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
