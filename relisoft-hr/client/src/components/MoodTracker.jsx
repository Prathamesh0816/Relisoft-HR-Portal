import { useEffect, useState } from 'react'
import useStore from '../store'
import { moodCheckIn, getMyMoods, getTeamMoodTrends, getMoodOrgOverview } from '../api'
import { Smile, Meh, Frown, Angry, Heart, TrendingUp, BarChart3 } from 'lucide-react'

const moodOptions = [
  { score: 1, icon: Angry, label: 'Stressed', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  { score: 2, icon: Frown, label: 'Low', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { score: 3, icon: Meh, label: 'Okay', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { score: 4, icon: Smile, label: 'Good', color: 'text-lime-500', bg: 'bg-lime-100 dark:bg-lime-900/30' },
  { score: 5, icon: Heart, label: 'Great!', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
]

export default function MoodTracker() {
  const { mood, setMood, setMessage } = useStore()
  const [selectedScore, setSelectedScore] = useState(0)
  const [note, setNote] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setMood({ loading: true })
    try {
      const [myMoods, teamTrends, orgOverview] = await Promise.all([
        getMyMoods(), getTeamMoodTrends(), getMoodOrgOverview()
      ])
      setMood({ myMoods, teamTrends, orgOverview, loading: false, todayEntry: myMoods[0] || null })
    } catch { setMood({ loading: false }) }
  }

  const handleCheckIn = async () => {
    if (!selectedScore) return
    setSubmitting(true)
    try {
      await moodCheckIn({ score: selectedScore, note, isAnonymous })
      setMessage({ type: 'success', text: 'Mood logged!' })
      setSelectedScore(0); setNote(''); setIsAnonymous(false)
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed' })
    } finally { setSubmitting(false) }
  }

  const getScoreColor = (s) => {
    const opt = moodOptions.find(m => m.score === Math.round(s))
    return opt?.color || 'text-gray-500'
  }

  if (mood.loading) return <div className="text-center py-10 text-muted">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="card-surface p-6">
        <h3 className="font-bold text-navy dark:text-white text-lg mb-4">How are you feeling today?</h3>
        {mood.todayEntry ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-2">{moodOptions.find(m => m.score === mood.todayEntry.score)?.icon({ size: 48, className: moodOptions.find(m => m.score === mood.todayEntry.score)?.color }) || '✅'}</div>
            <p className="text-muted text-sm">You checked in today — score: {mood.todayEntry.score}/5</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3 justify-center">
              {moodOptions.map(m => (
                <button key={m.score} onClick={() => setSelectedScore(m.score)}
                  className={`p-4 rounded-xl transition-all ${selectedScore === m.score ? `${m.bg} ring-2 ring-current ${m.color} scale-110` : 'bg-gray-100 dark:bg-navy-dark/60 text-gray-400 hover:scale-105'}`}>
                  <m.icon size={32} />
                  <div className="text-xs font-bold mt-1">{m.label}</div>
                </button>
              ))}
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Care to share why? (optional)" className="input w-full" rows={2} />
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="rounded" />
              Submit anonymously
            </label>
            <button onClick={handleCheckIn} disabled={!selectedScore || submitting} className="btn-primary w-full">
              {submitting ? 'Logging...' : 'Check In'}
            </button>
          </div>
        )}
      </div>

      {mood.orgOverview && (
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4"><BarChart3 size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Org Mood Overview</h3></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
              <div className="text-2xl font-bold text-navy dark:text-white">{mood.orgOverview.todayAvg.toFixed(1)}</div>
              <div className="text-xs text-muted">Today's Avg</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
              <div className="text-2xl font-bold text-navy dark:text-white">{mood.orgOverview.todayCount}</div>
              <div className="text-xs text-muted">Today's Entries</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
              <div className="text-2xl font-bold text-navy dark:text-white">{mood.orgOverview.totalEntries}</div>
              <div className="text-xs text-muted">Total Entries</div>
            </div>
          </div>
          {mood.orgOverview.trends?.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-bold text-navy dark:text-white/80">7-Day Trend</div>
              <div className="flex items-end gap-2 h-24">
                {mood.orgOverview.trends.map((t, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`text-xs font-bold ${getScoreColor(t.avgScore)}`}>{t.avgScore.toFixed(1)}</div>
                    <div className="w-full rounded-t-lg transition-all" style={{
                      height: `${(t.avgScore / 5) * 100}%`,
                      background: `hsl(${t.avgScore * 40}, 70%, 50%)`,
                      minHeight: '8px'
                    }} />
                    <div className="text-[10px] text-muted">{new Date(t.date).toLocaleDateString('en', { weekday: 'short' })}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {mood.teamTrends?.length > 0 && (
        <div className="card-surface p-6">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Team Mood Trend</h3></div>
          <div className="space-y-2">
            {mood.teamTrends.map((t, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-20 text-muted">{new Date(t.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <div className="flex-1 h-3 rounded-full bg-gray-100 dark:bg-navy-dark/60 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${(t.avgScore / 5) * 100}%`,
                    background: `hsl(${t.avgScore * 40}, 70%, 50%)`
                  }} />
                </div>
                <span className="font-bold w-8 text-right">{t.avgScore.toFixed(1)}</span>
                <span className="text-xs text-muted w-6">({t.count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {mood.myMoods?.length > 1 && (
        <div className="card-surface p-6">
          <h3 className="font-bold text-navy dark:text-white mb-4">My Mood History</h3>
          <div className="space-y-2">
            {mood.myMoods.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-navy-dark/60">
                <div className="text-xl">{moodOptions.find(o => o.score === m.score)?.icon({ size: 20, className: moodOptions.find(o => o.score === m.score)?.color })}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-navy dark:text-white">{moodOptions.find(o => o.score === m.score)?.label} ({m.score}/5)</div>
                  {m.note && <div className="text-xs text-muted">{m.note}</div>}
                </div>
                <div className="text-xs text-muted">{new Date(m.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
