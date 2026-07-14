import { useState } from 'react'
import useStore from '../store'
import { getResilienceReport } from '../api'
import { FileText, Download, Printer } from 'lucide-react'

export default function ResilienceReport() {
  const { resilience, setResilience, setMessage } = useStore()
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const d = await getResilienceReport()
      setResilience({ report: d.html || d.content || d })
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to generate report.' })
    }
    setLoading(false)
  }

  const handlePrint = () => {
    const w = window.open('', '_blank')
    w.document.write(resilience.report)
    w.document.close()
    w.print()
  }

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Resilience Report</h2>
      <p className="text-muted text-sm mb-4">Generate and view workforce resilience reports.</p>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={handleGenerate} disabled={loading} className="btn-primary text-xs"><FileText size={14} className="inline mr-1" />{loading ? 'Generating...' : 'Generate Report'}</button>
        {resilience.report && (
          <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-navy/10 dark:border-white/10 font-bold text-xs text-navy dark:text-white hover:bg-navy/5"><Printer size={14} className="inline mr-1" />Print</button>
        )}
      </div>
      {resilience.report && (
        <div className="border border-navy/10 dark:border-white/10 rounded-xl overflow-hidden">
          <iframe srcDoc={typeof resilience.report === 'string' ? resilience.report : resilience.report?.html || ''} title="Resilience Report" className="w-full h-[600px] bg-white" />
        </div>
      )}
    </div>
  )
}