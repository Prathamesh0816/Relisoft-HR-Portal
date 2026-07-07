import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Calendar, MapPin, UtensilsCrossed, Languages, Brain,
  Heart, Timer, Wind, Quote, Send, ThumbsUp, Compass,
  Sparkles, BookOpen, Play, Pause, RefreshCw, Award,
  Check, X, Lightbulb, Globe, Music, Palette,
  Coffee, Leaf, Smile, Star
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

const culturalSpotlights = [
  { title: 'Bharatanatyam', category: 'Dance', region: 'Tamil Nadu', emoji: '💃', desc: 'One of Indias oldest classical dance forms, known for its fixed upper torso, bent legs, and intricate footwork.', fact: 'Originally performed by devadasis in temples, it was revived and codified in the early 20th century.', color: '#dc2626' },
  { title: 'Pattachitra', category: 'Visual Art', region: 'Odisha', emoji: '🖼️', desc: 'Traditional cloth-based scroll painting known for intricate detail and mythological narratives.', fact: 'The word Pattachitra comes from Sanskrit — patta (cloth) + chitra (picture).', color: '#ea580c' },
  { title: 'Kathak', category: 'Dance', region: 'North India', emoji: '💃', desc: 'A classical dance form characterized by rhythmic footwork, spins, and storytelling through expressions.', fact: 'Kathak is the only North Indian classical dance form, with three distinct gharanas (schools).', color: '#9333ea' },
  { title: 'Madhubani Art', category: 'Visual Art', region: 'Bihar', emoji: '🎨', desc: 'Intricate line drawings filled with bright colors, traditionally done on freshly plastered mud walls.', fact: 'Madhubani paintings use natural dyes from plants, and no blank space is left in the composition.', color: '#0891b2' },
  { title: 'Kathakali', category: 'Dance', region: 'Kerala', emoji: '🎭', desc: 'A dramatic dance form with elaborate makeup, masks, and costumes — telling stories from epics.', fact: 'Kathakali performers undergo 8-10 years of rigorous training before their first stage performance.', color: '#059669' },
  { title: 'Phad Painting', category: 'Visual Art', region: 'Rajasthan', emoji: '🎨', desc: 'Religious scroll paintings depicting folk deities and epic stories, used by wandering bards.', fact: 'Phad paintings can be up to 30 feet long and are used as visual aids during night-long performances.', color: '#d97706' },
  { title: 'Sattriya', category: 'Dance', region: 'Assam', emoji: '💃', desc: 'A classical dance form introduced by the Vaishnava saint Srimanta Sankardeva in the 15th century.', fact: 'Sattriya was recognized as a classical dance form by the Sangeet Natak Akademi only in 2000.', color: '#16a34a' },
  { title: 'Kalamkari', category: 'Visual Art', region: 'Andhra Pradesh', emoji: '🎨', desc: 'Hand-painted or block-printed cotton textile art using natural vegetable dyes.', fact: 'Kalamkari means pen-craft — kalam (pen) + kari (craftsmanship).', color: '#b45309' },
  { title: 'Manipuri', category: 'Dance', region: 'Manipur', emoji: '💃', desc: 'A graceful classical dance form known for its fluid movements, soft music, and colorful costumes.', fact: 'Manipuri dance is deeply rooted in the Vaishnava tradition and the Ras Leela of Krishna.', color: '#c026d3' },
  { title: 'Blue Pottery', category: 'Craft', region: 'Rajasthan', emoji: '🏺', desc: 'A unique glazed pottery style from Jaipur, distinct for its striking blue dye from cobalt oxide.', fact: 'Despite the name, Blue Pottery is not actually pottery — it is a type of glaze applied to a quartz-based body.', color: '#2563eb' },
  { title: 'Chhau Dance', category: 'Dance', region: 'East India', emoji: '🎭', desc: 'A semi-classical dance with martial and tribal origins, performed with elaborate masks.', fact: 'Chhau has three main styles from Seraikella, Purulia, and Mayurbhanj — the last being maskless.', color: '#dc2626' },
]

const festivals = [
  { name: 'Guru Purnima', date: '2026-07-29', emoji: '🧘', desc: 'Honouring spiritual gurus and teachers — a day to express gratitude to mentors.', region: 'All India' },
  { name: 'Nag Panchami', date: '2026-08-07', emoji: '🐍', desc: 'Worship of snakes as divine beings — especially significant in Maharashtra and Karnataka.', region: 'West India' },
  { name: 'Raksha Bandhan', date: '2026-08-19', emoji: '🎀', desc: 'Sisters tie rakhi on brothers wrists, celebrating the bond of love and protection.', region: 'All India' },
  { name: 'Janmashtami', date: '2026-08-16', emoji: '💛', desc: 'Celebrating Lord Krishnas birth with dahi handi, bhajans, and midnight celebrations.', region: 'All India' },
  { name: 'Ganesh Chaturthi', date: '2026-09-07', emoji: '🐘', desc: 'Lord Ganeshas birth celebrated with 10-day festivities — especially grand in Maharashtra.', region: 'Maharashtra' },
  { name: 'Onam', date: '2026-09-15', emoji: '🌺', desc: 'Keralas harvest festival featuring pookalam floral carpets, sadya feast, and boat races.', region: 'Kerala' },
  { name: 'Navratri', date: '2026-10-01', emoji: '🪔', desc: 'Nine nights of Goddess worship — with Garba in Gujarat, Durga Puja in Bengal, and Ramlila in the North.', region: 'All India' },
  { name: 'Dussehra', date: '2026-10-10', emoji: '🏹', desc: 'Victory of good over evil — effigies of Ravana are burnt across the country.', region: 'All India' },
  { name: 'Karwa Chauth', date: '2026-10-17', emoji: '💑', desc: 'A day-long fast observed by married women for their husbands well-being.', region: 'North India' },
  { name: 'Diwali', date: '2026-10-29', emoji: '🪔', desc: 'The festival of lights — diyas, rangoli, sweets, and fireworks across every corner of India.', region: 'All India' },
  { name: 'Bhai Dooj', date: '2026-10-31', emoji: '👨‍👧‍👦', desc: 'Siblings celebrate their bond — brothers visit sisters for a special meal and tilak ceremony.', region: 'All India' },
  { name: 'Chhath Puja', date: '2026-11-03', emoji: '🌅', desc: 'Worship of the Sun God with offerings at riverbanks — mainly in Bihar, UP, and Jharkhand.', region: 'East India' },
  { name: 'Guru Nanak Jayanti', date: '2026-11-14', emoji: '✨', desc: 'Birth anniversary of Guru Nanak Dev Ji — celebrated with langar, kirtan, and processions.', region: 'All India' },
  { name: 'Christmas', date: '2026-12-25', emoji: '🎄', desc: 'Celebrating the birth of Jesus Christ with midnight mass, cakes, and festive cheer.', region: 'All India' },
]

const recipes = [
  { name: 'Puran Poli', region: 'Maharashtra', emoji: '🫓', desc: 'Sweet flatbread stuffed with chana dal and jaggery — a festival essential in every Maharashtrian home.', cookTime: '45 min', difficulty: 'Medium' },
  { name: 'Dhokla', region: 'Gujarat', emoji: '🧈', desc: 'Steamed fermented chickpea cake — light, fluffy, and the perfect tea-time snack.', cookTime: '30 min', difficulty: 'Easy' },
  { name: 'Hyderabadi Biryani', region: 'Telangana', emoji: '🍚', desc: 'Aromatic layered rice dish with marinated meat, saffron, and caramelized onions — a royal legacy.', cookTime: '1.5 hrs', difficulty: 'Hard' },
  { name: 'Masala Dosa', region: 'Karnataka', emoji: '🥞', desc: 'Crispy fermented rice crepe filled with spiced potato — the king of South Indian breakfasts.', cookTime: '25 min', difficulty: 'Medium' },
  { name: 'Rosogolla', region: 'West Bengal', emoji: '🍡', desc: 'Soft, spongy cheese balls soaked in light sugar syrup — Bengals most loved sweet.', cookTime: '40 min', difficulty: 'Medium' },
  { name: 'Butter Chicken', region: 'Punjab', emoji: '🍗', desc: 'Creamy tomato-based curry with tender tandoori chicken — the dish that put Indian food on the world map.', cookTime: '50 min', difficulty: 'Medium' },
  { name: 'Modak', region: 'Maharashtra', emoji: '🥟', desc: 'Sweet rice flour dumplings stuffed with coconut and jaggery — Lord Ganeshas favorite offering.', cookTime: '35 min', difficulty: 'Hard' },
  { name: 'Litti Chokha', region: 'Bihar', emoji: '🧆', desc: 'Roasted wheat balls stuffed with sattu, served with mashed spiced vegetables — rustic and hearty.', cookTime: '40 min', difficulty: 'Medium' },
]

const languagePhrases = [
  { language: 'Marathi', phrase: 'नमस्कार (Namaskār)', meaning: 'Hello / Greetings', region: 'Maharashtra', script: 'Devanagari' },
  { language: 'Hindi', phrase: 'आप कैसे हैं? (Aap kaise hain?)', meaning: 'How are you?', region: 'North India', script: 'Devanagari' },
  { language: 'Tamil', phrase: 'வணக்கம் (Vaṇakkam)', meaning: 'Greetings', region: 'Tamil Nadu', script: 'Tamil' },
  { language: 'Bengali', phrase: 'নমস্কার (Nomoshkar)', meaning: 'Hello', region: 'West Bengal', script: 'Bengali' },
  { language: 'Gujarati', phrase: 'કેમ છો? (Kem cho?)', meaning: 'How are you?', region: 'Gujarat', script: 'Gujarati' },
  { language: 'Kannada', phrase: 'ನಮಸ್ಕಾರ (Namaskāra)', meaning: 'Greetings', region: 'Karnataka', script: 'Kannada' },
  { language: 'Malayalam', phrase: 'നമസ്കാരം (Namaskāram)', meaning: 'Greetings', region: 'Kerala', script: 'Malayalam' },
  { language: 'Punjabi', phrase: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akāl)', meaning: 'God is Truth — a common greeting', region: 'Punjab', script: 'Gurmukhi' },
  { language: 'Odia', phrase: 'ନମସ୍କାର (Namaskāra)', meaning: 'Greetings', region: 'Odisha', script: 'Odia' },
  { language: 'Assamese', phrase: 'নমস্কাৰ (Nomoskar)', meaning: 'Hello', region: 'Assam', script: 'Assamese' },
  { language: 'Telugu', phrase: 'నమస్కారం (Namaskāraṁ)', meaning: 'Greetings', region: 'Andhra Pradesh', script: 'Telugu' },
  { language: 'Marwari', phrase: 'खम्मा घणी (Khammā ghaṇī)', meaning: 'Warm welcome', region: 'Rajasthan', script: 'Devanagari' },
]

const quizQuestions = [
  { q: 'Which Indian state is known as the "Land of Five Rivers"?', options: ['Punjab', 'Uttarakhand', 'Assam', 'Kerala'], answer: 0 },
  { q: 'Which classical dance form originated in Kerala?', options: ['Kathakali', 'Bharatanatyam', 'Kathak', 'Manipuri'], answer: 0 },
  { q: 'What is the national flower of India?', options: ['Lotus', 'Rose', 'Marigold', 'Jasmine'], answer: 0 },
  { q: 'The famous Ajanta and Ellora caves are located in which state?', options: ['Maharashtra', 'Madhya Pradesh', 'Rajasthan', 'Gujarat'], answer: 0 },
  { q: 'Which Indian festival is known as the "Festival of Lights"?', options: ['Diwali', 'Holi', 'Dussehra', 'Onam'], answer: 0 },
  { q: 'What is the oldest language among these Indian languages?', options: ['Tamil', 'Hindi', 'Bengali', 'Marathi'], answer: 0 },
  { q: 'The Bengaluru-based institute that pioneered Indian space research is?', options: ['ISRO', 'DRDO', 'BARC', 'IISc'], answer: 0 },
  { q: 'Which Indian state is the largest producer of tea?', options: ['Assam', 'West Bengal', 'Kerala', 'Tamil Nadu'], answer: 0 },
  { q: 'Which of these is NOT a classical dance form of India?', options: ['Bhangra', 'Kathak', 'Odissi', 'Kuchipudi'], answer: 0 },
  { q: 'The Sanchi Stupa is located in which state?', options: ['Madhya Pradesh', 'Uttar Pradesh', 'Bihar', 'Rajasthan'], answer: 0 },
  { q: 'Which Indian city is famous for the "Placed Pottery" known as Blue Pottery?', options: ['Jaipur', 'Delhi', 'Lucknow', 'Ahmedabad'], answer: 0 },
]

const wellnessPractices = [
  { title: 'Surya Namaskar', emoji: '☀️', desc: '12-step sun salutation sequence — a complete full-body warm-up and cardiovascular workout.', duration: '5 min', benefit: 'Full body' },
  { title: 'Anulom Vilom', emoji: '🌬️', desc: 'Alternate nostril breathing — balances the left and right hemispheres of the brain.', duration: '3 min', benefit: 'Calm mind' },
  { title: 'Tadasana', emoji: '🧘', desc: 'Mountain pose — improves posture, strengthens thighs, and relieves sciatica.', duration: '2 min', benefit: 'Posture' },
  { title: 'Bhramari Pranayama', emoji: '🐝', desc: 'Humming bee breath — instantly reduces stress, anger, and anxiety.', duration: '2 min', benefit: 'Stress relief' },
  { title: 'Shavasana', emoji: '😌', desc: 'Corpse pose — the ultimate relaxation posture that integrates the benefits of all other asanas.', duration: '5 min', benefit: 'Deep rest' },
  { title: 'Kapalbhati', emoji: '🔥', desc: 'Skull-shining breathing technique — energizes the mind and strengthens the abdominal muscles.', duration: '3 min', benefit: 'Energy' },
]

const gratitudePosts = [
  { name: 'Aditya P.', dept: 'Engineering', msg: 'Finally my PR got merged after 47 reviews! Shoutout to the QA team for catching those edge cases 🙌', time: '1h ago', likes: 9 },
  { name: 'Kavita R.', dept: 'HR', msg: 'So proud of our Ganesh Chaturthi celebration today! The decorations were next level 🐘✨', time: '3h ago', likes: 14 },
  { name: 'Rahul M.', dept: 'Design', msg: 'The new standing desks are a game changer. My back has never been happier! 🪑💪', time: '5h ago', likes: 11 },
  { name: 'Ananya S.', dept: 'Marketing', msg: 'Grateful for the chai tapri conversations — where real ideas are born ☕💡', time: '1d ago', likes: 18 },
  { name: 'Vivek K.', dept: 'Engineering', msg: 'Shoutout to whoever brought modaks today. You are the real MVP 🥟🙏', time: '1d ago', likes: 22 },
  { name: 'Pooja D.', dept: 'Operations', msg: 'Thankful for the flexi-hours policy. Dropping kids to school AND getting work done — best of both worlds! 🏠', time: '2d ago', likes: 16 },
]

const dailyWisdom = [
  { text: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः', meaning: 'Goals are achieved through effort, not by mere wishing.', source: 'Subhashita' },
  { text: 'परोपकाराय पुण्याय पापाय परपीडनम्', meaning: 'Helping others is merit, harming others is sin.', source: 'Hitopadesha' },
  { text: 'न हि ज्ञानेन सदृशं पवित्रमिह विद्यते', meaning: 'There is nothing as pure as knowledge in this world.', source: 'Bhagavad Gita 4.38' },
  { text: 'अन्नं न निन्द्यात्', meaning: 'Never criticize food — it is the source of life.', source: 'Taittiriya Upanishad' },
  { text: 'विद्या ददाति विनयं विनयाद्याति पात्रताम्', meaning: 'Knowledge gives humility; from humility comes worthiness.', source: 'Subhashita' },
  { text: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः', meaning: 'May all be happy, may all be free from illness.', source: 'Vedic Mantra' },
  { text: 'एकं सत् विप्राः बहुधा वदन्ति', meaning: 'Truth is one, the wise call it by many names.', source: 'Rigveda' },
  { text: 'चरैवेति चरैवेति', meaning: 'Keep moving, keep evolving — there is no standing still.', source: 'Shruti' },
]

function getDaysUntil(dateStr) {
  const parts = dateStr.split('-')
  const target = new Date(+parts[0], +parts[1] - 1, +parts[2])
  const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24))
  return diff
}

function getTodayFestival(festivals) {
  const today = new Date().toISOString().split('T')[0]
  return festivals.find(f => f.date === today)
}

function CulturalTab({ spotlightIdx, setSpotlightIdx, spotlights }) {
  useEffect(() => {
    const interval = setInterval(() => {
      setSpotlightIdx(prev => (prev + 1) % spotlights.length)
    }, 12000)
    return () => clearInterval(interval)
  }, [spotlights.length, setSpotlightIdx])

  const s = spotlights[spotlightIdx]

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🧭 Cultural Compass</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Explore Indias incredible diversity — one spotlight at a time</p>
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl overflow-hidden border transition-all" style={{ borderColor: 'var(--line)' }}>
          <div className="p-6 md:p-8 text-white text-center" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}dd)` }}>
            <span className="text-5xl block mb-3">{s.emoji}</span>
            <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">{s.category} · {s.region}</p>
            <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
            <p className="text-sm opacity-90 max-w-lg mx-auto">{s.desc}</p>
          </div>
          <div className="p-4" style={{ background: 'var(--panel)' }}>
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--moss)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{s.fact}</p>
            </div>
            <div className="flex gap-1.5 justify-center mt-4">
              {spotlights.map((_, i) => (
                <button key={i} onClick={() => setSpotlightIdx(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === spotlightIdx ? 'w-6' : ''}`}
                  style={{ background: i === spotlightIdx ? 'var(--moss)' : 'var(--line)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FestivalsTab({ festivals }) {
  const today = new Date().toISOString().split('T')[0]
  const upcoming = festivals.filter(f => f.date >= today).slice(0, 6)
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const tl = {}
      upcoming.forEach(f => {
        const parts = f.date.split('-')
        const target = new Date(+parts[0], +parts[1] - 1, +parts[2])
        const diff = target - now
        if (diff > 0) {
          tl[f.name] = {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            mins: Math.floor((diff / (1000 * 60)) % 60),
          }
        } else {
          tl[f.name] = null
        }
      })
      setTimeLeft(tl)
    }
    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [upcoming])

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🗓️ Festival Calendar</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Indias rich festival heritage — countdown to the next celebration</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {upcoming.map(f => {
          const tl = timeLeft[f.name]
          return (
            <div key={f.name} className="rounded-xl border p-5 transition-all"
              style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{f.emoji}</span>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{f.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(f.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
              </div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{f.desc}</p>
              <p className="text-[10px] font-medium mb-2" style={{ color: 'var(--moss)' }}>📍 {f.region}</p>
              {tl ? (
                <div className="flex gap-2 text-center">
                  <div className="flex-1 rounded-lg p-2" style={{ background: 'var(--sage)' }}>
                    <span className="block text-lg font-bold" style={{ color: 'var(--moss)' }}>{tl.days}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Days</span>
                  </div>
                  <div className="flex-1 rounded-lg p-2" style={{ background: 'var(--sage)' }}>
                    <span className="block text-lg font-bold" style={{ color: 'var(--moss)' }}>{tl.hours}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Hrs</span>
                  </div>
                  <div className="flex-1 rounded-lg p-2" style={{ background: 'var(--sage)' }}>
                    <span className="block text-lg font-bold" style={{ color: 'var(--moss)' }}>{tl.mins}</span>
                    <span className="text-[10px]" style={{ color: 'var(--muted)' }}>Min</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-xs font-bold" style={{ color: 'var(--moss)' }}>🎉 Today!</span>
                </div>
              )}
              {tl && getDaysUntil(f.date) <= 7 && (
                <div className="mt-2 text-center">
                  <span className="inline-block text-[10px] font-bold px-3 py-1 rounded-full" style={{ color: 'var(--moss)', background: 'var(--sage)' }}>Coming Soon 🎊</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-6 rounded-xl p-4 text-center border" style={{ background: 'var(--sage)', borderColor: 'var(--line)' }}>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>📅 Festival dates follow the traditional Hindu calendar — regional variations may apply.</p>
      </div>
    </div>
  )
}

function RecipesTab({ recipes }) {
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🍳 Indian Recipe Corner</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Regional delicacies from across the subcontinent</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {recipes.map(r => (
          <button key={r.name} onClick={() => setSelected(selected === r.name ? null : r.name)}
            className="rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5"
            style={{ borderColor: selected === r.name ? 'var(--moss)' : 'var(--line)', background: 'var(--panel)' }}>
            <span className="text-3xl block mb-2">{r.emoji}</span>
            <h3 className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{r.name}</h3>
            <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--moss)' }}>
              <MapPin className="h-3 w-3" /> {r.region}
            </p>
            {selected === r.name && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{r.desc}</p>
                <div className="flex gap-3 mt-2 text-[10px] font-medium" style={{ color: 'var(--muted)' }}>
                  <span>⏱ {r.cookTime}</span>
                  <span>📊 {r.difficulty}</span>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function LanguageTab({ phrases }) {
  const [idx, setIdx] = useState(0)
  const p = phrases[idx]

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🗣️ Language Lab</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Learn basic phrases from Indias diverse languages</p>
      </div>
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border p-6 text-center transition-all" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--moss)' }}>{p.language} · {p.script}</p>
          <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>📍 {p.region}</p>
          <div className="text-2xl font-bold py-4 px-4 rounded-lg mb-3" style={{ background: 'var(--sage)', color: 'var(--ink)' }}>
            {p.phrase}
          </div>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{p.meaning}</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setIdx(prev => (prev - 1 + phrases.length) % phrases.length)}
              className="px-4 py-2 rounded-lg text-xs font-bold border transition-all" style={{ borderColor: 'var(--line)', color: 'var(--muted)' }}>← Previous</button>
            <button onClick={() => setIdx(prev => (prev + 1) % phrases.length)}
              className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all" style={{ background: 'var(--moss)' }}>Next →</button>
          </div>
        </div>
        <div className="flex gap-1.5 justify-center mt-4">
          {phrases.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'w-5' : ''}`}
              style={{ background: i === idx ? 'var(--moss)' : 'var(--line)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function QuizTab({ questions }) {
  const [idx, setIdx] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [done, setDone] = useState(false)

  const handleAnswer = (optIdx) => {
    if (answered !== null) return
    setAnswered(optIdx)
    if (optIdx === questions[idx].answer) setScore(prev => prev + 1)
    setTimeout(() => {
      if (idx < questions.length - 1) {
        setIdx(prev => prev + 1)
        setAnswered(null)
      } else {
        setDone(true)
      }
    }, 1000)
  }

  const reset = () => {
    setIdx(0)
    setScore(0)
    setAnswered(null)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div className="text-center py-10">
        <span className="text-6xl block mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '💪'}</span>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--ink)' }}>Quiz Complete!</h3>
        <p className="mb-1">You scored <span className="font-bold text-2xl" style={{ color: 'var(--moss)' }}>{score}</span> out of {questions.length}</p>
        <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>{pct >= 80 ? 'India expert! 🇮🇳' : pct >= 50 ? 'Good knowledge! Keep exploring!' : 'Time to explore more of India!'}</p>
        <button onClick={reset} className="text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-all" style={{ background: 'var(--moss)' }}>Play Again</button>
      </div>
    )
  }

  const q = questions[idx]
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🧠 Know India Quiz</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Test your knowledge about Indian culture, geography, and heritage</p>
      </div>
      <div className="max-w-lg mx-auto">
        <div className="rounded-xl border p-6" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs" style={{ color: 'var(--muted)' }}>Question {idx + 1}/{questions.length}</span>
            <span className="text-xs font-bold" style={{ color: 'var(--moss)' }}>Score: {score}</span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-4" style={{ background: 'var(--sage)' }}>
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${((idx + 1) / questions.length) * 100}%`, background: 'var(--moss)' }} />
          </div>
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--ink)' }}>{q.q}</h3>
          <div className="space-y-2">
            {q.options.map((opt, optIdx) => {
              let cls = 'cursor-pointer hover:opacity-80'
              if (answered !== null) {
                if (optIdx === q.answer) cls = 'opacity-100'
                else if (optIdx === answered) cls = 'opacity-50'
                else cls = 'opacity-40'
              }
              return (
                <button key={optIdx} onClick={() => handleAnswer(optIdx)}
                  className={`w-full text-left p-3 rounded-lg border text-sm font-medium transition-all ${cls}`}
                  style={{
                    borderColor: answered !== null
                      ? (optIdx === q.answer ? '#22c55e' : optIdx === answered ? '#ef4444' : 'var(--line)')
                      : 'var(--line)',
                    background: answered !== null
                      ? (optIdx === q.answer ? '#f0fdf4' : optIdx === answered ? '#fef2f2' : 'var(--panel)')
                      : 'var(--panel)',
                    color: 'var(--ink)',
                  }}>
                  <span className="mr-2" style={{ color: 'var(--muted)' }}>{String.fromCharCode(65 + optIdx)}.</span> {opt}
                  {answered !== null && optIdx === q.answer && <Check className="inline h-4 w-4 text-green-500 ml-2" />}
                  {answered === optIdx && optIdx !== q.answer && <X className="inline h-4 w-4 text-red-500 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function WellnessTab({ practices }) {
  const [mode, setMode] = useState(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [bellPlayed, setBellPlayed] = useState(false)
  const intervalRef = useRef(null)
  const audioCtxRef = useRef(null)

  const playBell = useCallback(() => {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 432
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 2.5)
    } catch { }
  }, [])

  const startMed = (mins) => { setMode(mins); setSeconds(mins * 60); setRunning(true); setBellPlayed(false) }
  const stopMed = () => { setRunning(false); if (intervalRef.current) clearInterval(intervalRef.current) }
  const resetMed = () => { stopMed(); setMode(null); setSeconds(0); setBellPlayed(false) }

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setInterval(() => setSeconds(prev => prev - 1), 1000)
    } else if (seconds === 0 && running) {
      setRunning(false)
      if (!bellPlayed) { playBell(); setBellPlayed(true) }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, seconds, playBell, bellPlayed])

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const [breathPhase, setBreathPhase] = useState('inhale')
  const [breathCount, setBreathCount] = useState(0)
  const [isBreathing, setIsBreathing] = useState(false)
  const breathRef = useRef(null)

  const startBreath = () => { setIsBreathing(true); setBreathPhase('inhale'); setBreathCount(0) }

  useEffect(() => {
    if (isBreathing) {
      let step = 0
      const phases = ['inhale', 'hold', 'exhale', 'hold']
      const durations = [4, 7, 8, 0]
      breathRef.current = setInterval(() => {
        const p = step % 4
        setBreathPhase(phases[p])
        if (p === 3) setBreathCount(prev => prev + 1)
        step++
      }, (durations[step % 4] || 4) * 1000)
      setTimeout(() => { clearInterval(breathRef.current); setIsBreathing(false); setBreathPhase('done') }, 120000)
    }
    return () => { if (breathRef.current) clearInterval(breathRef.current) }
  }, [isBreathing])

  const bLabels = { inhale: '🌬️ Breathe In...', hold: '🤫 Hold...', exhale: '😮‍💨 Breathe Out...', done: '✨ Complete!' }
  const bColors = { inhale: '#3b82f6', hold: '#8b5cf6', exhale: '#22c55e', done: '#9ca3af' }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>🧘 Wellness Corner</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Ancient wellness practices for the modern workplace</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Timer className="h-4 w-4" style={{ color: 'var(--moss)' }} /> Meditation Timer</h3>
          {!mode ? (
            <div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Choose your meditation duration:</p>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 10, 15].map(m => (
                  <button key={m} onClick={() => startMed(m)}
                    className="flex-1 font-bold py-3 rounded-lg text-sm transition-all"
                    style={{ background: 'var(--sage)', color: 'var(--moss)' }}>{m} min</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl font-bold mb-3" style={{ color: running ? 'var(--moss)' : 'var(--line)' }}>{fmt(seconds)}</div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{seconds === 0 ? '✨ Time is up. Peace be with you.' : `${mode} min session`}</p>
              <div className="flex gap-2 justify-center">
                {running ? (
                  <button onClick={stopMed} className="inline-flex items-center gap-1 text-white px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#f59e0b' }}>
                    <Pause className="h-3.5 w-3.5" /> Pause
                  </button>
                ) : seconds > 0 ? (
                  <button onClick={() => setRunning(true)} className="inline-flex items-center gap-1 text-white px-4 py-2 rounded-lg text-xs font-bold" style={{ background: '#22c55e' }}>
                    <Play className="h-3.5 w-3.5" /> Resume
                  </button>
                ) : null}
                <button onClick={resetMed} className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold" style={{ background: 'var(--sage)', color: 'var(--muted)' }}>
                  <RefreshCw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-xl border p-5" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Wind className="h-4 w-4" style={{ color: '#3b82f6' }} /> 4-7-8 Breathing</h3>
          {!isBreathing ? (
            <div>
              <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>Inhale 4s · Hold 7s · Exhale 8s. Calms the nervous system instantly.</p>
              <button onClick={startBreath} className="w-full text-white font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2" style={{ background: '#3b82f6' }}>
                <Play className="h-4 w-4" /> Start 2-Min Session
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center transition-all duration-1000"
                style={{ background: bColors[breathPhase], transform: `scale(${breathPhase === 'inhale' ? 1.3 : breathPhase === 'exhale' ? 0.8 : 1})` }}>
                <span className="text-white text-2xl">{breathPhase === 'inhale' ? '↑' : breathPhase === 'exhale' ? '↓' : '—'}</span>
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--ink)' }}>{bLabels[breathPhase]}</p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Cycle {Math.min(breathCount + 1, 8)} of 8</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {practices.map((p, i) => (
          <div key={i} className="rounded-xl border p-4 text-center transition-all" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            <span className="text-2xl block mb-1">{p.emoji}</span>
            <h4 className="font-bold text-xs mb-1" style={{ color: 'var(--ink)' }}>{p.title}</h4>
            <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{p.desc}</p>
            <div className="flex gap-2 justify-center mt-2 text-[10px] font-medium" style={{ color: 'var(--moss)' }}>
              <span>⏱ {p.duration}</span>
              <span>💪 {p.benefit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function GratitudeTab({ posts }) {
  const [items, setItems] = useState(posts)
  const [msg, setMsg] = useState('')
  const [name, setName] = useState('')
  const [liked, setLiked] = useState({})

  const handlePost = () => {
    if (!msg.trim()) return
    const depts = ['Engineering', 'HR', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations']
    setItems(prev => [{
      name: name.trim() || 'Anonymous',
      dept: depts[Math.floor(Math.random() * depts.length)],
      msg: msg.trim(),
      time: 'Just now',
      likes: 0
    }, ...prev])
    setMsg('')
    setName('')
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>💝 Gratitude Wall</h2>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Share what you are grateful for — spread positivity!</p>
      </div>
      <div className="max-w-lg mx-auto mb-6">
        <div className="rounded-xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Your name (optional)" maxLength={30}
            className="w-full text-sm border-b pb-2 mb-3 outline-none transition-colors"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            onFocus={e => e.target.style.borderColor = 'var(--moss)'}
            onBlur={e => e.target.style.borderColor = 'var(--line)'} />
          <textarea value={msg} onChange={e => setMsg(e.target.value)}
            placeholder="What are you grateful for today? 🙏" maxLength={200} rows={2}
            className="w-full text-sm resize-none outline-none mb-2" style={{ color: 'var(--ink)' }} />
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: 'var(--muted)' }}>{msg.length}/200</span>
            <button onClick={handlePost} disabled={!msg.trim()}
              className="inline-flex items-center gap-1 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--moss)' }}>
              <Send className="h-3.5 w-3.5" /> Post
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3 max-w-lg mx-auto">
        {items.map((post, i) => (
          <div key={i} className="rounded-xl border p-4 transition-all" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--moss), var(--copper))' }}>
                  {post.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{post.name}</p>
                  <p className="text-[10px]" style={{ color: 'var(--muted)' }}>{post.dept} · {post.time}</p>
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{post.msg}</p>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setLiked(prev => ({ ...prev, [i]: !prev[i] }))}
                className="inline-flex items-center gap-1 text-xs transition-all"
                style={{ color: liked[i] ? 'var(--moss)' : 'var(--muted)' }}>
                <ThumbsUp className={`h-3.5 w-3.5 ${liked[i] ? 'fill-current' : ''}`} /> {post.likes + (liked[i] ? 1 : 0)}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MandirDarshan() {
  const theme = useAuthStore(s => s.theme)
  const [activeTab, setActiveTab] = useState('cultural')
  const [spotlightIdx, setSpotlightIdx] = useState(0)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const todayFestival = getTodayFestival(festivals)

  useEffect(() => {
    const interval = setInterval(() => setQuoteIdx(prev => (prev + 1) % dailyWisdom.length), 18000)
    return () => clearInterval(interval)
  }, [])

  const themeLabel = theme === 'maharashtra' ? 'Maharashtra Culture' : theme === 'fun' ? '🏏 Cricket & Fun' : 'Professional'
  const themeGreeting = theme === 'maharashtra' ? 'नमस्कार मंडळी! 🙏' : theme === 'fun' ? 'Game on, team! 🏏' : 'Welcome, team! 🌟'

  const tabs = [
    { id: 'cultural', label: 'Cultural Compass', emoji: '🧭' },
    { id: 'festivals', label: 'Festivals', emoji: '🗓️' },
    { id: 'recipes', label: 'Recipes', emoji: '🍳' },
    { id: 'language', label: 'Language Lab', emoji: '🗣️' },
    { id: 'quiz', label: 'Quiz', emoji: '🧠' },
    { id: 'wellness', label: 'Wellness', emoji: '🧘' },
    { id: 'gratitude', label: 'Gratitude', emoji: '💝' },
  ]

  const w = dailyWisdom[quoteIdx]

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <div className="pb-6 text-white" style={{ background: `linear-gradient(135deg, var(--moss), var(--copper))` }}>
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🇮🇳</span>
                <h1 className="text-xl md:text-2xl font-bold">Cultural Compass</h1>
              </div>
              <p className="text-white/80 text-sm mb-3">Exploring Indias diverse heritage — {themeGreeting}</p>
              <div className="inline-flex items-center gap-1.5 text-xs bg-white/15 rounded-full px-3 py-1 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                Active Theme: {themeLabel}
              </div>
            </div>
            <div className="md:w-72">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Quote className="h-4 w-4 text-white/70" />
                  <span className="text-xs font-semibold text-white/70">Daily Wisdom</span>
                </div>
                <p className="text-sm font-medium text-white leading-relaxed mb-1">{w.text}</p>
                <p className="text-[11px] text-white/70 italic">— {w.meaning}</p>
                <p className="text-[10px] text-white/50 mt-1">{w.source}</p>
              </div>
            </div>
          </div>
          {todayFestival && (
            <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex items-center gap-2 text-sm">
              <span className="text-lg">{todayFestival.emoji}</span>
              <span className="font-medium">Today: {todayFestival.name}</span>
              <span className="text-white/70 text-xs">— {todayFestival.desc}</span>
            </div>
          )}
        </div>
      </div>

      <div className="sticky top-0 z-30 border-b shadow-sm" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id ? '' : 'border-transparent hover:opacity-70'}`}
                style={{ borderColor: activeTab === tab.id ? 'var(--moss)' : 'transparent', color: activeTab === tab.id ? 'var(--moss)' : 'var(--muted)' }}>
                <span>{tab.emoji}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'cultural' && <CulturalTab spotlightIdx={spotlightIdx} setSpotlightIdx={setSpotlightIdx} spotlights={culturalSpotlights} />}
        {activeTab === 'festivals' && <FestivalsTab festivals={festivals} />}
        {activeTab === 'recipes' && <RecipesTab recipes={recipes} />}
        {activeTab === 'language' && <LanguageTab phrases={languagePhrases} />}
        {activeTab === 'quiz' && <QuizTab questions={quizQuestions} />}
        {activeTab === 'wellness' && <WellnessTab practices={wellnessPractices} />}
        {activeTab === 'gratitude' && <GratitudeTab posts={gratitudePosts} />}
      </div>

      <div className="border-t py-6 mt-6" style={{ borderColor: 'var(--line)', background: 'var(--sage)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>🇮🇳 Unity in Diversity — celebrating Indias rich cultural tapestry at ReliSoft Technologies</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Cultural Compass v1.0 · Built with ❤️ for the ReliSoft family</p>
        </div>
      </div>
    </div>
  )
}
