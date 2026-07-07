import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Smile, Music, Gamepad2, Lightbulb, Sparkles, Heart, Volume2, RefreshCw, Zap, Dumbbell } from 'lucide-react'
import { companionData } from '../../data/companionData'

const { songs, jokes, quotes, games, facts, greetings } = companionData

function getGreeting() {
  const h = new Date().getHours()
  const g = h < 12 ? greetings[0] : h < 17 ? greetings[1] : h < 21 ? greetings[2] : greetings[3]
  return `🌟 ${g.en} ${g.hi} ${g.mr}`
}

function getRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }

const systemMessage = {
  role: 'nova',
  content: "Namaste! I'm Nova, your AI companion and work buddy! 🌟 Think of me as your digital best friend who's always here to: motivate you, make you laugh, recommend awesome songs, challenge you with fun games, or just chat. What's on your mind?",
}

const actions = [
  { id: 'motivate', label: 'Motivate Me', icon: '💪', emoji: '🔥' },
  { id: 'joke', label: 'Tell a Joke', icon: '😄', emoji: '😄' },
  { id: 'song', label: 'Song Suggestion', icon: '🎵', emoji: '🎶' },
  { id: 'marathi-song', label: 'Marathi Song', icon: '🎤', emoji: '🎤' },
  { id: 'game', label: 'Play a Game', icon: '🎮', emoji: '🎮' },
  { id: 'fact', label: 'Fun Fact', icon: '💡', emoji: '💡' },
  { id: 'quote', label: 'Daily Quote', icon: '✨', emoji: '✨' },
  { id: 'wyr', label: 'Would You Rather', icon: '🤔', emoji: '🤔' },
  { id: 'riddle', label: 'Riddle Me', icon: '🧩', emoji: '🧩' },
]

function getResponse(action, input) {
  switch (action) {
    case 'motivate':
      const q = getRandom(quotes)
      return `🔥 **Motivation Boost!** 🔥\n\n"${q.text}"\n— ${q.author} ${q.emoji}\n\nYou've got this! Go crush it today! 🚀`
    case 'joke':
      return `😄 **Laugh Time!** 😄\n\n${getRandom(jokes)}\n\nWant another one? Just say "joke"! 😃`
    case 'song': {
      const s = getRandom(songs.bollywood)
      return `🎵 **Bollywood Beats!** 🎵\n\n🎧 **${s.title}** — ${s.movie}\n🎤 Singer: ${s.singer}\n💃 Mood: ${s.mood} ${s.emoji}\n\nTry listening to it, it's a banger! 🔥`
    }
    case 'marathi-song': {
      const s = getRandom(songs.marathi)
      return `🎤 **Marathi Masti!** 🎤\n\n🎧 **${s.title}** — ${s.movie}\n🎤 Singer: ${s.singer}\n💃 Mood: ${s.mood} ${s.emoji}\n\nZabardast gaana aahe! बढिया! 🔥`
    }
    case 'game':
      return `🎮 **Let's Play!** 🎮\n\nI've got:\n1. 🔢 **Number Guessing** — I think of a number, you guess!\n2. 🤔 **Would You Rather** — Pick your poison!\n3. 🧩 **Riddle** — Solve the mystery!\n4. ❓ **Trivia** — Test your knowledge!\n\nType the number (1/2/3/4) to pick a game!`
    case 'fact':
      return `💡 **Did You Know?** 💡\n\n${getRandom(facts)}`
    case 'quote':
      const q2 = getRandom(quotes)
      return `✨ **Daily Wisdom** ✨\n\n"${q2.text}"\n— ${q2.author} ${q2.emoji}\n\nLet this sink in today! 🌟`
    case 'wyr':
      return `🤔 **Would You Rather...** 🤔\n\n${getRandom(games.wouldYouRather)}\n\nPick one and tell me why! 😄`
    case 'riddle': {
      const r = getRandom(games.riddles)
      return `🧩 **Riddle Time!** 🧩\n\n${r.riddle}\n\n🤫 Think about it...\n\nType "answer" to reveal!`
    }
    case 'riddle-answer': {
      return `🧩 **The Answer Is...** 🧩\n\n${getRandom(games.riddles).answer}\n\nDid you get it right? Say "another riddle" for more!`
    }
    case 'trivia': {
      const t = getRandom(games.trivia)
      return `❓ **Trivia Time!** ❓\n\n${t.question}\n\nType "answer" to find out!`
    }
    case 'trivia-answer': {
      const t = getRandom(games.trivia)
      return `❓ **The Answer Is...** ❓\n\n${t.answer}\n\nHow did you do? Try another one!`
    }
    case 'greeting':
      return getGreeting() + "\n\nHow can I brighten your day? 😊"
    default: {
      const lower = input?.toLowerCase() || ''
      if (lower.includes('thank')) return "You're most welcome! 🥰 Happy to help! Remember, I'm always here for you. 💫"
      if (lower.includes('bye') || lower.includes('goodnight')) return "Goodbye! Take care and stay awesome! 🌟 Come back anytime you need a smile! 😊"
      if (lower.includes('how are you')) return "I'm absolutely fantastic! 🤩 Especially now that I'm chatting with you! How are you doing today? 💫"
      if (lower.includes('love') || lower.includes('miss')) return "Aww, love you too! 🥰 Sending you a big virtual hug! 🤗💖"
      if (lower.includes('bore') || lower.includes('boring')) return "Let's fix that! 🎉 Pick something fun: joke, song, game, or fact? Your call! 😄"
      if (lower.includes('stress') || lower.includes('tire') || lower.includes('tired') || lower.includes('sad')) {
        return "Hey, I hear you! 🫂 Take a deep breath with me: inhale... exhale... 🌬️\n\nRemember: This too shall pass. You're stronger than you think! 💪 Here's a boost: " + getRandom(quotes).text + " — " + getRandom(quotes).author + " 🌟"
      }
      if (lower.includes('song') || lower.includes('music') || lower.includes('songs')) {
        const s = getRandom(songs.bollywood)
        return `🎵 How about **${s.title}** from ${s.movie} by ${s.singer}? ${s.emoji}\nIt's a ${s.mood} number! 🎧 Say "marathi song" for a Marathi vibe!`
      }
      if (lower.includes('joke') || lower.includes('funny') || lower.includes('laugh')) return getResponse('joke')
      if (lower.includes('quote') || lower.includes('motivat') || lower.includes('inspire')) return getResponse('quote')
      if (lower.includes('fact') || lower.includes('know')) return getResponse('fact')
      if (lower.includes('game') || lower.includes('play') || lower.includes('trivia')) return getResponse('game')
      if (lower.includes('riddle')) return getResponse('riddle')
      if (lower.includes('answer')) return getResponse(input?.toLowerCase().includes('trivia') ? 'trivia-answer' : 'riddle-answer')
      if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'namaste') return getGreeting()
      return `That's interesting! 😊 Tell me more... or pick something fun below! 🎯\n\n✨ I can: motivate you, tell jokes, suggest songs, share facts, or play games!`
    }
  }
}

export default function AICompanion() {
  const [messages, setMessages] = useState([systemMessage])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [gameState, setGameState] = useState(null)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const addMessage = (role, content) => setMessages((p) => [...p, { role, content }])

  const handleSend = async (text) => {
    if (!text.trim()) return
    addMessage('user', text)
    setInput('')
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 500 + Math.random() * 800))

    const reply = getResponse(null, text)
    addMessage('nova', reply)
    setIsTyping(false)
  }

  const handleAction = async (actionId) => {
    const label = actions.find((a) => a.id === actionId)?.label || actionId
    addMessage('user', `/${actionId}`)
    setIsTyping(true)

    await new Promise((r) => setTimeout(r, 400 + Math.random() * 600))

    const reply = getResponse(actionId)
    addMessage('nova', reply)
    setIsTyping(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-relisoft-50/30 via-purple-50/30 to-pink-50/30 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🤖</div>
          <h1 className="text-3xl font-bold text-gray-900">Nova — Your AI Companion</h1>
          <p className="text-gray-500 mt-1">Your work buddy, motivator, entertainer, and friend — always here for you! 🌟</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-relisoft-600 to-purple-600 p-4 text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">Nova</h3>
              <p className="text-xs text-white/70">Always online &middot; Ready to cheer you up!</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Online
            </div>
          </div>

          <div className="flex gap-2 p-3 overflow-x-auto border-b border-gray-100 bg-gray-50/50">
            {actions.map((a) => (
              <button key={a.id} onClick={() => handleAction(a.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-gray-200 hover:border-relisoft-300 hover:text-relisoft-600 transition-colors whitespace-nowrap flex-shrink-0">
                <span>{a.emoji}</span> {a.label}
              </button>
            ))}
          </div>

          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-relisoft-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                  {msg.role === 'nova' && <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--moss)' }}>Nova 🤖</p>}
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-gray-100 p-3">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(input) }} className="flex gap-2">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Type anything — ask, chat, or just say hi!..."
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
          <Sparkles className="h-3 w-3 inline mr-1" />
          Nova is powered by built-in responses — no external API needed &middot; All conversations are private
        </div>
      </div>
    </div>
  )
}
