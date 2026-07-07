import { useState, useRef, useEffect, useCallback } from 'react'
import ChatPanel from './ChatPanel'

export default function FloatChat() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)

  const toggle = useCallback(() => setOpen((o) => !o), [])
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (!open) return
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    const handler = () => setOpen((o) => !o)
    window.addEventListener('relisoft-toggle-chat', handler)
    return () => window.removeEventListener('relisoft-toggle-chat', handler)
  }, [])

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40" onClick={close} />
      )}

      {/* Chat panel */}
      <div
        ref={panelRef}
        className={`fixed z-50 bottom-24 right-6 w-[400px] max-w-[calc(100vw-2rem)] transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="shadow-2xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <ChatPanel
            onClose={close}
            floating
          />
        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggle}
        className="fixed z-50 bottom-24 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110 active:scale-95 relisoft-gradient text-white"
        title={open ? 'Close chat' : 'Open AI Assistant'}
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  )
}
