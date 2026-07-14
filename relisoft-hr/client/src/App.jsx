import { useEffect, useState } from 'react'
import useStore from './store'
import { login, loadWorkspace } from './api'
import LoadingScreen from './components/LoadingScreen'
import LoginPage from './components/LoginPage'
import AppLayout from './components/AppLayout'
import Message from './components/Message'

export default function App() {
  const { loading, currentUser, message, setLoading, setCurrentUser, setData, setMessage, logout } = useStore()
  const [introReady, setIntroReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('relisoft-hr-user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setCurrentUser(user)
        loadWorkspace().then(setData).catch(() => {
          localStorage.removeItem('relisoft-hr-user')
          setCurrentUser(null)
        }).finally(() => setLoading(false))
      } catch {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
    const timer = setTimeout(() => setIntroReady(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleLogin = async (username, password) => {
    try {
      const user = await login(username, password)
      setCurrentUser(user)
      const data = await loadWorkspace()
      setData(data)
      setMessage(null)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Login failed' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('relisoft-hr-user')
    logout()
  }

  if (loading || !introReady) return <LoadingScreen />

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Message message={message} />
      {!currentUser ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <AppLayout onLogout={handleLogout} />
      )}
    </div>
  )
}
