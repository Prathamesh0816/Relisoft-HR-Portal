import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, Search, Building, FileText, HelpCircle, Loader2, Sparkles, ExternalLink, Ticket } from 'lucide-react'
import { hrPolicies, hrTicketCategories } from '../../data/hrPolicyData'

const policyKeys = Object.keys(hrPolicies)

function getPolicyAnswer(query) {
  const lower = query.toLowerCase()

  if (lower.includes('laptop') || lower.includes('equipment') || lower.includes('device') || lower.includes('replacement')) {
    const p = hrPolicies.laptopReplacement
    return `**${p.title}** 💻\n\n**Steps:**\n${p.steps.join('\n')}\n\n**Eligibility:** ${p.eligibility}\n\n**Contact:** ${p.contact}`
  }
  if (lower.includes('appraisal') || lower.includes('performance') || lower.includes('review') || lower.includes('increment') || lower.includes('promotion') || lower.includes('rating')) {
    const p = hrPolicies.appraisal
    return `**${p.title}** 📊\n\n**Timeline:**\n${p.steps.join('\n')}\n\n**Ratings:** ${p.ratings}\n\n**Promotion Criteria:** ${p.promotionCriteria}\n\n**Contact:** ${p.contact}`
  }
  if (lower.includes('offboard') || lower.includes('separation') || lower.includes('resign') || lower.includes('quit') || lower.includes('leaving') || lower.includes('notice period') || lower.includes('notice')) {
    const p = hrPolicies.offboarding
    return `**${p.title}** 🚪\n\n**Process:**\n${p.steps.join('\n')}\n\n**Notice Period:** ${p.noticePeriod}\n\n**F&F Settlement:** ${p.fnf}\n\n**Contact:** ${p.contact}`
  }
  if (lower.includes('leave') || lower.includes('holiday') || lower.includes('vacation') || lower.includes('sick') || lower.includes('casual') || lower.includes('planned') || lower.includes('comp off') || lower.includes('floater') || lower.includes('lop') || lower.includes('loss of pay') || lower.includes('maternity') || lower.includes('paternity')) {
    const p = hrPolicies.leavePolicy
    return `**${p.title}** 🏖️\n\n**Leave Types:**\n${p.types.join('\n')}\n\n**Approval:** ${p.approval}`
  }
  if (lower.includes('attendance') || lower.includes('punch') || lower.includes('late') || lower.includes('work hours') || lower.includes('overtime') || lower.includes('wfh') || lower.includes('work from home') || lower.includes('half day')) {
    const p = hrPolicies.attendance
    return `**${p.title}** ⏰\n\n${p.details.join('\n')}`
  }
  if (lower.includes('salary') || lower.includes('payroll') || lower.includes('payslip') || lower.includes('pay') || lower.includes('salary advance') || lower.includes('tax') || lower.includes('pf') || lower.includes('gratuity') || lower.includes('credit')) {
    const p = hrPolicies.payroll
    return `**${p.title}** 💰\n\n${p.details.join('\n')}`
  }
  if (lower.includes('travel') || lower.includes('expense') || lower.includes('reimbursement') || lower.includes('booking') || lower.includes('hotel') || lower.includes('flight') || lower.includes('conveyance')) {
    const p = hrPolicies.travel
    return `**${p.title}** ✈️\n\n${p.details.join('\n')}`
  }
  if (lower.includes('training') || lower.includes('learning') || lower.includes('certification') || lower.includes('course') || lower.includes('l&d') || lower.includes('development') || lower.includes('upskill')) {
    const p = hrPolicies.training
    return `**${p.title}** 🎓\n\n${p.details.join('\n')}`
  }
  if (lower.includes('ticket') || lower.includes('raise') || lower.includes('support') || lower.includes('helpdesk')) {
    const cats = hrTicketCategories.map((c) => `  ${c.icon} **${c.label}**`).join('\n')
    return `**Raise an HR Ticket** 🎫\n\nYou can raise a ticket for any of the following:\n\n${cats}\n\n👉 Go to **HR Support** section to create a ticket or click "Create Ticket" below.`
  }
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('namaste')) {
    return "Namaste! 🙏 Welcome to HR Support! I'm here to answer all your HR-related questions. You can ask me about:\n\n💻 Laptop replacement\n📊 Appraisal process\n🚪 Offboarding / Resignation\n🏖️ Leave policy\n⏰ Attendance rules\n💰 Payroll & salary\n✈️ Travel & expenses\n🎓 Training & certifications\n🎫 Raising support tickets\n\nWhat would you like to know?"
  }
  if (lower.includes('thank')) return "You're welcome! 😊 If you have more questions, just ask. For complex issues, you can raise a support ticket anytime! 🎫"
  if (lower.includes('bye')) return "Goodbye! 👋 For any HR assistance, I'm always here. You can also visit the HR Support page to raise tickets. Take care! 😊"

  return `I can help you with various HR policies and processes! Here's what I know about:\n\n${policyKeys.map((k) => `📌 ${hrPolicies[k].title}`).join('\n')}\n\nJust type what you need help with, or click "Create Ticket" above for direct HR assistance. 🎫`
}

export default function HRChatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Namaste! 🙏 I'm your HR Assistant. Ask me about laptop replacement, appraisal, offboarding, leave policy, payroll, or any HR query!" },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const addMessage = (role, content) => setMessages((p) => [...p, { role, content }])

  const handleSend = async (text) => {
    if (!text.trim()) return
    addMessage('user', text)
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))

    const reply = getPolicyAnswer(text)
    addMessage('bot', reply)
    setIsTyping(false)
  }

  const quickActions = [
    { label: '💻 Laptop Replacement', query: 'Laptop replacement policy' },
    { label: '📊 Appraisal Process', query: 'Appraisal process and timeline' },
    { label: '🚪 Offboarding', query: 'Resignation offboarding process' },
    { label: '🏖️ Leave Policy', query: 'Leave types and policy' },
    { label: '💰 Payroll Query', query: 'Salary and payroll details' },
    { label: '🎫 Create Ticket', query: 'Raise a support ticket' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-relisoft-50/30 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎯</div>
          <h1 className="text-3xl font-bold text-gray-900">HR Support Assistant</h1>
          <p className="text-gray-500 mt-1">Get instant answers to all your HR queries — policies, processes, forms & more</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {quickActions.map((a) => (
            <button key={a.label} onClick={() => handleSend(a.query)}
              className="bg-white border border-gray-200 rounded-xl p-2.5 text-center hover:border-relisoft-300 hover:shadow-sm transition-all text-xs font-medium text-gray-700">
              {a.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-relisoft-600 p-4 text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🎯</div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">HR Support Assistant</h3>
              <p className="text-xs text-white/70">HR policy expert &middot; Instant answers</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Online
            </div>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-relisoft-600 text-white rounded-br-md' : 'bg-blue-50 text-gray-800 rounded-bl-md'}`}>
                  {msg.role === 'bot' && <p className="text-[10px] font-bold text-blue-600 mb-1">HR Assistant 🎯</p>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-blue-50 rounded-2xl rounded-bl-md p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 p-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input) }} className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about laptop, appraisal, leave, payroll, offboarding..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-relisoft-600 outline-none bg-gray-50"
              />
              <button type="submit" disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-relisoft-600 text-white hover:bg-relisoft-700 disabled:opacity-50 transition-colors">
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 text-center text-[10px] text-gray-400">
          <Building className="h-3 w-3 inline mr-1" />
          Powered by ReliSoft HR Policy Database &middot; For complex issues, raise a support ticket
        </div>
      </div>
    </div>
  )
}
