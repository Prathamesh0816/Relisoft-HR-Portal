import { useState, useEffect } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar from './Sidebar'
import Header from './Header'
import useAuthStore from '../../store/authStore'

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen app-bg">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div className="relative w-64 h-full" onClick={(e) => e.stopPropagation()}>
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <Header onToggleSidebar={() => setMobileSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { borderRadius: '8px', background: '#333', color: '#fff' },
        }}
      />
    </div>
  )
}
