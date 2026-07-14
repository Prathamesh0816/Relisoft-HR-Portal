import { useEffect, useState } from 'react'
import useStore from '../store'
import { getWorkforceEmployees, runWhatIf, getResilienceScenarios, createResilienceScenario } from '../api'
import { Play, Save, ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react'

export default function WhatIfSimulator() {
  const { resilience, setResilience, setMessage } = useStore()
  const [selected, setSelected] = useState([])
  const [result, setResult] = useState(null)
  const [scenarioName, setScenarioName] = useState('')

  useEffect(() => {
    getWorkforceEmployees().then((d) => setResilience({ employees: d.employees || [] }))
    getResilienceScenarios().then((d) => setResilience({ scenarios: d.scenarios || [] })).catch(() => {})
  }, [])

  const toggleEmployee = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const handleRun = async () => {
    if (selected.length === 0) return
    const res = await runWhatIf(selected)
    setResilience({ whatIf: res })
  }

  const handleSave = async () => {
    if (!resilience.whatIf) return
    await createResilienceScenario({ name: scenarioName || 'Untitled Scenario', data: resilience.whatIf })
    const scenarios = await getResilienceScenarios()
    setResilience({ scenarios: scenarios.scenarios || [] })
    setScenarioName('')
  }

  const whatIf = resilience.whatIf

  return (
    <div className="space-y-4">
      <div className="card-surface p-6">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">What-If Simulator</h2>
        <p className="text-muted text-sm mb-4">Simulate the impact of employee departures.</p>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-sm text-navy dark:text-white mb-3">Select Departing Employees</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {resilience.employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-3 p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer hover:border-gold-1/30">
                  <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => setSelected((prev) => prev.includes(emp.id) ? prev.filter((x) => x !== emp.id) : [...prev, emp.id])} className="accent-gold-1" />
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{emp.fullName || emp.name}</div>
                    <div className="text-xs text-muted">{emp.team || emp.department} · {emp.jobRole || emp.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm text-navy dark:text-white mb-3">Impact Analysis</h3>
            {whatIf ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="text-xs text-muted font-bold mb-1">Baseline</div>
                    <div className="text-2xl font-bold text-navy dark:text-white">{whatIf.baselineScore ?? 0}%</div>
                  </div>
                  <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                    <div className="text-xs text-muted font-bold mb-1">Projected</div>
                    <div className="text-2xl font-bold text-amber-700">{whatIf.projectedScore ?? 0}%</div>
                  </div>
                </div>
                <div className={`p-4 rounded-xl text-center font-bold text-sm ${(whatIf.delta ?? 0) < 0 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  Impact Delta: {whatIf.delta ?? 0}%
                </div>
              </div>
            ) : (
              <p className="text-muted text-sm">Run a simulation to see results.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Saved Scenarios</h2>
        <p className="text-muted text-sm mb-4">Previously saved what-if scenarios.</p>
        {resilience.scenarios.length === 0 ? (
          <p className="text-muted text-sm">No saved scenarios.</p>
        ) : (
          <div className="space-y-2">
            {resilience.scenarios.map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] flex items-center justify-between">
                <div>
                  <div className="font-bold text-navy dark:text-white text-sm">{s.name}</div>
                  <div className="text-xs text-muted">{new Date(s.createdOn || s.createdAt).toLocaleDateString()}</div>
                </div>
                <span className="text-xs text-muted">{s.employeeCount || s.departingEmployeeIds?.length || 0} employees</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
