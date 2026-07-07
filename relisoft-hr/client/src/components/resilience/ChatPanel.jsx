import { useState, useRef, useEffect, useCallback } from 'react'
import { useToast } from '../../context/ToastContext'

const SUGGESTIONS = [
  'What happens if our top 3 engineers leave?',
  'Who are our biggest single points of failure?',
  'Who is the most valuable employee?',
  'Simulate a 30% workload increase across all teams',
  'What is our overall organizational health?',
  'Who should we cross-train first?',
  'What is our retention risk?',
  'How is our resilience score?',
]

// const WS_BASE = `ws://${window.location.hostname}:8000/ws/query`
// WebSocket disabled — REST only

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {})
  }
}

export default function ChatPanel({ onResult, onClose, floating }) {
  const { addToast } = useToast()
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('relisoft_chat')
      if (saved) return JSON.parse(saved)
    } catch {}
    return [
      { role: 'system', text: 'Ask me anything about your organization\'s workforce resilience. I can run simulations, analyze risks, and recommend actions.' },
    ]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [wsStatus, setWsStatus] = useState('connecting')
  const endRef = useRef(null)
  const inputRef = useRef(null)
  const wsRef = useRef(null)
  const streamingIdRef = useRef(null)
  const prevLen = useRef(0)

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [])

  useEffect(() => {
    if (prevLen.current > 0 && messages.length > prevLen.current) scrollToBottom()
    prevLen.current = messages.length
  }, [messages, scrollToBottom])

  useEffect(() => {
    localStorage.setItem('relisoft_chat', JSON.stringify(messages))
  }, [messages])

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    setWsStatus('fallback')
  }, [])

  const sendMessage = async (text) => {
    const query = text || input
    if (!query.trim() || loading) return

    const userMsg = { role: 'user', text: query }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setShowSuggestions(false)

    const streamingId = Date.now() + '_' + Math.random().toString(36).slice(2)
    streamingIdRef.current = streamingId
    setMessages((prev) => [...prev, { role: 'assistant', text: '', _id: streamingId }])

    const history = messages
      .filter((m) => m.role !== 'system')
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }))

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ query, messages: history }))
      return
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      const res = await fetch('/api/resilience/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, messages: history }),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) {
        const detail = await res.text().catch(() => '')
        throw new Error(detail || `Analysis request failed with status ${res.status}`)
      }

      const data = await res.json()

      setMessages((prev) =>
        prev.map((m) =>
          m._id === streamingId
            ? { ...m, text: data.answer || data.summary?.insight?.headline || 'Analysis complete.', data }
            : m
        )
      )
      onResult?.(data)
    } catch (err) {
      const errorText = err.name === 'AbortError'
        ? '⚠️ Request timed out. Please try a simpler question.'
        : '⚠️ Sorry, I had trouble connecting. Please try again.'
      setMessages((prev) =>
        prev.map((m) => (m._id === streamingId ? { ...m, text: errorText } : m))
      )
    } finally {
      setLoading(false)
      streamingIdRef.current = null
      inputRef.current?.focus()
    }
  }

  const clearChat = () => {
    setMessages([
      { role: 'system', text: 'Ask me anything about your organization\'s workforce resilience. I can run simulations, analyze risks, and recommend actions.' },
    ])
    localStorage.removeItem('relisoft_chat')
    setShowSuggestions(true)
    addToast('Conversation cleared')
  }

  const nonSystemMessages = messages.filter((m) => m.role !== 'system')
  const assistantCount = nonSystemMessages.filter((m) => m.role === 'assistant' && m.text).length

  return (
    <div className={`bg-white dark:bg-gray-800 flex flex-col ${floating ? 'h-[520px]' : 'h-[500px] rounded-lg border border-gray-200 dark:border-gray-700'}`}>
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg flex-shrink-0">🤖</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm truncate">AI Assistant</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Natural language workforce analysis</p>
          </div>
          {wsStatus === 'fallback' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 font-medium flex-shrink-0">REST</span>
          )}
          {wsStatus === 'connected' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium flex-shrink-0">Live</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {assistantCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
              {assistantCount}
            </span>
          )}
          <button
            onClick={clearChat}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Clear conversation"
          >
            Clear
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {showSuggestions && (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Try asking:</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="block text-left text-sm text-relisoft-600 dark:text-relisoft-400 hover:bg-relisoft-50 dark:hover:bg-relisoft-900/30 rounded-lg px-3 py-2 transition-colors border border-relisoft-100 dark:border-relisoft-900/50 hover:border-relisoft-300"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === 'user'
                  ? 'bg-relisoft-600 text-white'
                  : msg.role === 'system'
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <div className="group relative">
                {msg.text || (msg._id ? (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-relisoft-400 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-relisoft-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-relisoft-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                ) : null)}
                {msg.text && msg.role === 'assistant' && (
                  <button
                    onClick={() => { copyText(msg.text); addToast('Copied to clipboard') }}
                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-1.5 py-0.5 rounded bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-gray-600"
                  >
                    📋
                  </button>
                )}
              </div>
              {msg.data?.summary?.coaching?.actions?.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-relisoft-600 dark:text-relisoft-400 mb-1">Recommended Actions:</p>
                  {msg.data.summary.coaching.actions.slice(0, 3).map((a, j) => (
                    <p key={j} className="text-xs text-gray-600 dark:text-gray-300">→ {a.title}</p>
                  ))}
                </div>
              ) : msg.data?.actions?.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-relisoft-600 dark:text-relisoft-400 mb-1">Recommended Actions:</p>
                  {msg.data.actions.slice(0, 3).map((a, j) => (
                    <p key={j} className="text-xs text-gray-600 dark:text-gray-300">→ {a.title || a}</p>
                  ))}
                </div>
              ) : msg.data?.spofs?.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-relisoft-600 dark:text-relisoft-400 mb-1">Top SPOFs:</p>
                  {msg.data.spofs.slice(0, 3).map((s, j) => (
                    <p key={j} className="text-xs text-gray-600 dark:text-gray-300">→ {s.employee} ({s.team})</p>
                  ))}
                </div>
              ) : msg.data?.scenario ? (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-1">
                    Scenario Impact: {msg.data.scenario.composite_score}/100
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Revenue at risk: ${(msg.data.scenario.revenue_at_risk_usd || 0).toLocaleString()}
                  </p>
                </div>
              ) : msg.data?.valuable_employees?.length > 0 ? (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-medium text-relisoft-600 dark:text-relisoft-400 mb-1">Top Valuable Employees:</p>
                  {msg.data.valuable_employees.slice(0, 3).map((e, j) => (
                    <p key={j} className="text-xs text-gray-600 dark:text-gray-300">→ {e.employee} ({e.team})</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading && !streamingIdRef.current && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-relisoft-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-relisoft-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-relisoft-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about your workforce..."
            className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-relisoft-500 dark:placeholder-gray-400"
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="bg-relisoft-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-relisoft-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
