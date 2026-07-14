import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem('relisoft-hr-theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('relisoft-hr-theme', dark ? 'dark' : 'light')
  }, [dark])

  return <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(d => !d) }}>
    {children}
  </ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
