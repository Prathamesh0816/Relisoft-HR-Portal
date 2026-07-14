import { useEffect } from 'react'
import useStore from '../store'
import { getSkillGaps } from '../api'
import { BookOpen, AlertTriangle, BarChart3 } from 'lucide-react'

export default function SkillGapAnalysis() {
  const { resilience, setResilience } = useStore()
  const gaps = resilience.skillGaps || []

  useEffect(() => {
    getSkillGaps().then((d) => setResilience({ skillGaps: d.skillGaps || [], loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  const riskColor = (r) => {
    if (r === 'High') return 'bg-red-50 text-red-700 border-red-200'
    if (r === 'Medium') return 'bg-amber-50 text-amber-700 border-amber-200'
    return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  const grouped = (resilience.skillGaps || []).reduce((acc, gap) => {
    const key = gap.team || gap.department || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(gap)
    return acc
  }, {})

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Skill Gap Analysis</h2>
      <p className="text-muted text-sm mb-4">Identify skill gaps across teams.</p>
      {Object.keys(grouped).length === 0 ? (
        <p className="text-muted text-sm">No skill gaps found.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([team, gaps]) => (
            <div key={team}>
              <h3 className="font-bold text-sm text-navy dark:text-white mb-2">{team}</h3>
              <div className="space-y-2">
                {gaps.map((gap, i) => (
                  <div key={gap.id || i} className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-navy dark:text-white text-sm">{gap.skillArea || gap.area}</div>
                        <div className="text-xs text-muted mt-1">Proficiency: {gap.proficiency ?? 0}% · Documentation: {gap.documentationLevel ?? 0}%</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${gap.riskLevel === 'High' ? 'bg-red-50 text-red-700' : gap.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {gap.riskLevel || 'Low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
