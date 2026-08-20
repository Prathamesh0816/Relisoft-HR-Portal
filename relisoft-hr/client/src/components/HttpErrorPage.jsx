import useStore from '../store'
import { ShieldAlert, ShieldX, SearchX, Hourglass, CloudOff, Wrench, Ban, Lock, ServerCrash, CornerLeftUp, RefreshCw } from 'lucide-react'

const PAGES = {
  400: {
    icon: ShieldAlert,
    title: 'Bad Request',
    tone: 'text-amber-600 dark:text-amber-400',
    bg: 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-navy-dark',
    border: 'border-amber-200 dark:border-amber-800',
    chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    description: 'The request was invalid and could not be processed. Check the details and try again.',
    retry: true,
  },
  401: {
    icon: Lock,
    title: 'Unauthorized',
    tone: 'text-red-600 dark:text-red-400',
    bg: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-navy-dark',
    border: 'border-red-200 dark:border-red-800',
    chip: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    description: 'Your session has expired or you are not signed in. Please log in again to continue.',
    login: true,
  },
  403: {
    icon: ShieldX,
    title: 'Forbidden',
    tone: 'text-orange-600 dark:text-orange-400',
    bg: 'from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-navy-dark',
    border: 'border-orange-200 dark:border-orange-800',
    chip: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    description: 'You do not have permission to access this resource. Contact your HR admin if you believe this is a mistake.',
    back: true,
  },
  404: {
    icon: SearchX,
    title: 'Not Found',
    tone: 'text-sky-600 dark:text-sky-400',
    bg: 'from-sky-100 to-sky-50 dark:from-sky-900/30 dark:to-navy-dark',
    border: 'border-sky-200 dark:border-sky-800',
    chip: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    description: 'The page or record you are looking for does not exist. It may have been moved or removed.',
    back: true,
  },
  405: {
    icon: Ban,
    title: 'Method Not Allowed',
    tone: 'text-purple-600 dark:text-purple-400',
    bg: 'from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-navy-dark',
    border: 'border-purple-200 dark:border-purple-800',
    chip: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    description: 'This action is not supported on the current resource. Try a different action or contact IT.',
    back: true,
  },
  409: {
    icon: CornerLeftUp,
    title: 'Conflict',
    tone: 'text-rose-600 dark:text-rose-400',
    bg: 'from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-navy-dark',
    border: 'border-rose-200 dark:border-rose-800',
    chip: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    description: 'Your request conflicts with the current state of the data. Refresh and try again.',
    retry: true,
  },
  422: {
    icon: ShieldAlert,
    title: 'Unprocessable Entity',
    tone: 'text-teal-600 dark:text-teal-400',
    bg: 'from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-navy-dark',
    border: 'border-teal-200 dark:border-teal-800',
    chip: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    description: 'The request was understood but could not be processed with the data provided.',
    retry: true,
  },
  429: {
    icon: Hourglass,
    title: 'Too Many Requests',
    tone: 'text-indigo-600 dark:text-indigo-400',
    bg: 'from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-navy-dark',
    border: 'border-indigo-200 dark:border-indigo-800',
    chip: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
    description: 'You have made too many requests too quickly. Wait a few minutes before trying again.',
    wait: true,
  },
  500: {
    icon: ServerCrash,
    title: 'Internal Server Error',
    tone: 'text-red-600 dark:text-red-400',
    bg: 'from-red-100 to-red-50 dark:from-red-900/30 dark:to-navy-dark',
    border: 'border-red-200 dark:border-red-800',
    chip: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    description: 'Something went wrong on the server. Please try again — if it keeps happening, report it to IT.',
    retry: true,
  },
  502: {
    icon: CloudOff,
    title: 'Bad Gateway',
    tone: 'text-slate-600 dark:text-slate-400',
    bg: 'from-slate-100 to-slate-50 dark:from-slate-900/30 dark:to-navy-dark',
    border: 'border-slate-200 dark:border-slate-800',
    chip: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
    description: 'The server received an invalid response from an upstream service. Try again shortly.',
    retry: true,
  },
  503: {
    icon: Wrench,
    title: 'Service Unavailable',
    tone: 'text-yellow-600 dark:text-yellow-400',
    bg: 'from-yellow-100 to-yellow-50 dark:from-yellow-900/30 dark:to-navy-dark',
    border: 'border-yellow-200 dark:border-yellow-800',
    chip: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    description: 'The service is temporarily unavailable, usually during maintenance. Please try again in a few minutes.',
    wait: true,
  },
  504: {
    icon: Hourglass,
    title: 'Gateway Timeout',
    tone: 'text-cyan-600 dark:text-cyan-400',
    bg: 'from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-navy-dark',
    border: 'border-cyan-200 dark:border-cyan-800',
    chip: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    description: 'The server took too long to respond. Please try again in a moment.',
    retry: true,
  },
}

const GENERIC = {
  icon: ShieldX,
  title: 'Something Went Wrong',
  tone: 'text-navy dark:text-white',
  bg: 'from-navy/10 to-navy/5 dark:from-white/10 dark:to-navy-dark',
  border: 'border-navy/10 dark:border-white/10',
  chip: 'bg-navy/10 text-navy dark:bg-white/10 dark:text-white',
  description: 'An unexpected error occurred while loading this page.',
  retry: true,
}

const OFFLINE = {
  icon: CloudOff,
  title: 'You Are Offline',
  tone: 'text-slate-600 dark:text-slate-400',
  bg: 'from-slate-100 to-slate-50 dark:from-slate-900/30 dark:to-navy-dark',
  border: 'border-slate-200 dark:border-slate-800',
  chip: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  description: 'The server could not be reached. Check your connection and try again.',
  retry: true,
}

export default function HttpErrorPage({ status, message, onBack }) {
  const config = PAGES[status] || (status === 0 || status === 'offline' ? OFFLINE : GENERIC)
  const Icon = config.icon
  const { currentUser } = useStore()

  const goHome = () => {
    if (onBack) onBack()
    useStore.getState().setActiveView(
      ['HRL2', 'HR'].includes(currentUser?.role) ? 'hrHome'
      : ['OrganizationHead', 'ManagerL2', 'Manager'].includes(currentUser?.role) ? 'overview'
      : 'apply'
    )
  }

  const retry = () => {
    if (onBack) onBack()
    window.location.reload()
  }

  const goLogin = () => {
    useStore.getState().logout()
    useStore.getState().setActiveView('login')
    localStorage.removeItem('relisoft-hr-user')
    if (onBack) onBack()
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className={`bg-gradient-to-br ${config.bg} ${config.border} border-b p-10 md:p-14 text-center`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${config.chip} mb-4`}>
          <Icon size={32} />
        </div>
        <div className="font-heading font-extrabold text-6xl md:text-7xl text-navy dark:text-white tracking-tight">{status || '!'}</div>
        <div className={`mt-2 font-heading font-bold text-2xl ${config.tone}`}>{config.title}</div>
        <p className="mt-3 text-sm text-navy/60 dark:text-white/60 max-w-md mx-auto">{config.description}</p>
        {message && message !== config.title && (
          <p className="mt-3 text-xs text-navy/50 dark:text-white/50 max-w-md mx-auto break-words">Server says: “{message}”</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 p-6">
        <button onClick={goHome} className="px-5 py-2.5 bg-navy dark:bg-navy-dark text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all">
          Go to dashboard
        </button>
        {config.login && (
          <button onClick={goLogin} className="px-5 py-2.5 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-sm rounded-xl">
            Log in again
          </button>
        )}
        {config.back && (
          <button onClick={onBack} className="px-5 py-2.5 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 transition-all">
            Go back
          </button>
        )}
        {config.retry && (
          <button onClick={retry} className="inline-flex items-center gap-2 px-5 py-2.5 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} /> Try again
          </button>
        )}
        {config.wait && (
          <button onClick={retry} className="inline-flex items-center gap-2 px-5 py-2.5 border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm rounded-xl hover:bg-navy/5 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} /> I waited, retry now
          </button>
        )}
      </div>
    </div>
  )
}