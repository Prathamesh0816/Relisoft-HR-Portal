import { useState } from 'react'
import useStore from '../store'
import { updateHrPolicy, loadWorkspace } from '../api'

export default function HrControlPanel() {
  const { data, setData, setMessage } = useStore()
  const [allowHalfDay, setAllowHalfDay] = useState(data.hrPolicy?.allowHalfDayLeave || false)
  const [sandwichLeave, setSandwichLeave] = useState(data.hrPolicy?.sandwichLeave || false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateHrPolicy(allowHalfDay, sandwichLeave)
      const fresh = await loadWorkspace()
      setData(fresh)
      setMessage({ type: 'success', text: 'HR policy updated.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update policy.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card-surface">
      <div className="p-5">
        <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Leave policy</h2>
        <p className="text-muted dark:text-white/60 text-sm mt-1">Configure leave rules and defaults.</p>
      </div>
      <form onSubmit={handleSave} className="px-5 pb-5 space-y-4">
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={allowHalfDay}
            onChange={(e) => setAllowHalfDay(e.target.checked)}
            className="w-5 h-5 rounded border-navy/20 text-gold-1 focus:ring-gold-1"
          />
          <span className="text-sm font-semibold text-navy dark:text-white">Allow employees to take half-day leave</span>
        </label>
        <label className="inline-flex items-center gap-3 px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] cursor-pointer">
          <input
            type="checkbox"
            checked={sandwichLeave}
            onChange={(e) => setSandwichLeave(e.target.checked)}
            className="w-5 h-5 rounded border-navy/20 text-gold-1 focus:ring-gold-1"
          />
          <div>
            <span className="text-sm font-semibold text-navy dark:text-white">Sandwich leave rule</span>
            <p className="text-xs text-muted mt-0.5">When enabled, weekends between leave days are counted as leave. When disabled, only working days (Mon–Fri) are counted.</p>
          </div>
        </label>
        <button type="submit" disabled={saving} className="gold-button px-6 py-3 rounded-xl font-bold text-sm">
          {saving ? 'Saving...' : 'Save leave policy'}
        </button>
      </form>
    </div>
  )
}
