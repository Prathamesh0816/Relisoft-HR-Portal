import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../ThemeContext'

export default function ThemeToggle({ compact }) {
  const { dark, toggleTheme } = useTheme()
  return (
    <button
      onClick={toggleTheme}
      className={`rounded-xl font-bold transition-all ${
        compact
          ? 'p-2 border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 hover:bg-gold-1/10'
          : 'w-full text-left px-3 py-2.5 border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 hover:bg-gold-1/10'
      }`}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="flex items-center gap-2.5 text-sm">
        {dark ? (
          <Sun size={16} className="text-gold-1" />
        ) : (
          <Moon size={16} className="text-navy/70 dark:text-white/70" />
        )}
        {!compact && (
          <span className="font-bold text-navy/70 dark:text-white/70">
            {dark ? 'Light mode' : 'Dark mode'}
          </span>
        )}
      </span>
    </button>
  )
}
