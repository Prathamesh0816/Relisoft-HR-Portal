import { useState, useRef, useEffect } from 'react'
import useStore from '../store'
import { Send, Bot, User } from 'lucide-react'

const mockResponses = {
  health: 'Based on the latest TruPulse AI analysis, organizational health is stable. Trust score is 78%, resilience score is 72%, and burnout risk is at 15%. Retention is tracking at 85%.',
  spof: 'There are 3 high-criticality SPOFs identified. The top SPOF is John Doe (Engineering Lead) with a score of 92. Revenue impact is estimated at $450,000.',
  risk: 'Current risk assessment shows 2 high-risk areas: Engineering (SPOF concentration) and Sales (knowledge concentration). Mitigation plans are recommended.',
  employee: 'There are 45 active employees across 6 teams. Average tenure is 3.2 years. 12 employees are flagged as high-criticality.',
  'skill gap': 'Skill gaps identified in 3 teams: Engineering (Cloud Architecture), Sales (CRM), and HR (Compliance). Documentation levels average 45%.',
  succession: 'Succession planning identifies 8 critical roles. 3 have ready successors, 3 are developing, and 2 are at risk.',
  default: 'I can help with questions about workforce health, SPOF analysis, risk assessment, employee data, skill gaps, and succession planning. Try asking about "health", "spof", "risk", "employee", "skill gap", or "succession".'
}

export default function ResilienceAIChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = { role: 'user', text: input }
    const lower = input.toLowerCase()
    let reply = mockResponses.default
    for (const [key, val] of Object.entries(mockResponses)) {
      if (key !== 'default' && lower.includes(key)) {
        reply = val
        break
      }
    }
    const botMsg = { role: 'bot', text: reply }
    setMessages((prev) => [...prev, userMsg, botMsg])
    setInput('')
  }

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Resilience AI Chat</h2>
      <p className="text-muted text-sm mb-4">Ask natural language questions about workforce resilience.</p>
      <div className="h-80 overflow-y-auto mb-4 space-y-3 border border-navy/10 dark:border-white/10 rounded-xl p-4 bg-white dark:bg-[var(--bg-secondary)]">
        {messages.length === 0 && <p className="text-muted text-sm text-center">Ask a question to get started.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-gold-1 text-navy-dark' : 'bg-navy/5 dark:bg-white/10 text-navy dark:text-white'}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about workforce data..." className="input flex-1" />
        <button type="submit" disabled={!input.trim()} className="btn-primary text-xs"><Send size={14} className="inline mr-1" />Send</button>
      </form>
    </div>
  )
}