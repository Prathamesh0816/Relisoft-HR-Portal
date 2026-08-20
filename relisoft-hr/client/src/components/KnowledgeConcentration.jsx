import { useEffect } from 'react'
import useStore from '../store'
import { getKnowledgeConcentration } from '../api'
import { AlertTriangle, Lightbulb, Users, BookOpen } from 'lucide-react'

export default function KnowledgeConcentration() {
  const { resilience, setResilience } = useStore()
  const knowledge = resilience.knowledge

  useEffect(() => {
    getKnowledgeConcentration().then((d) => setResilience({ knowledge: d, loading: false })).catch(() => setResilience({ loading: false }))
  }, [])

  if (!knowledge) return <div className="card-surface p-6"><p className="text-muted text-sm">Loading knowledge concentration data...</p></div>

  const areas = knowledge.highRiskAreas || knowledge.areas || []

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Knowledge Concentration</h2>
      <p className="text-muted text-sm mb-4">Bus-factor risk analysis across knowledge areas.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
          <div className="text-3xl font-bold text-navy dark:text-white">{knowledge?.busFactorScore ?? knowledge?.overallScore ?? 0}%</div>
          <div className="text-xs text-muted mt-1 font-bold">Overall Knowledge Score</div>
        </div>
        <div className="p-5 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-center">
          <div className="text-3xl font-bold text-amber-700">{Array.isArray(areas) ? areas.length : (knowledge?.highRiskAreas ?? 0)}</div>
          <div className="text-xs text-muted mt-1 font-bold">High Risk Areas</div>
        </div>
      </div>
      <div className="space-y-3">
        {(areas).map((area, i) => (
          <div key={i} className={`p-4 rounded-xl border ${area.riskLevel === 'High' || area.risk === 'High' ? 'bg-red-50 border-red-200' : 'bg-white dark:bg-[var(--bg-secondary)] border-navy/10 dark:border-white/10'}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-bold text-navy dark:text-white text-sm">{area.area || area.name}</div>
                <div className="text-xs text-muted mt-1">{area.suggestion || area.recommendation}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${area.riskLevel === 'High' || area.risk === 'High' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                Score: {area.busFactor ?? area.score ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
