import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'
import App from './App'
import './index.css'

function AppWrapper() {
  useEffect(() => {
    document.title = 'ReliSoft Employee Portal'
  }, [])
  return (
    <BrowserRouter>
      <ThemeProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </ThemeProvider>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
)
