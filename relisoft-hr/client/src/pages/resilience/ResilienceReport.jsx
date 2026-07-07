import { useState, useEffect } from 'react'
import { resilienceAPI } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { SkeletonCard } from '../../components/resilience/Skeleton'

export default function ResilienceReport() {
  const { addToast } = useToast()
  const [allEmployees, setAllEmployees] = useState([])
  const [employeesError, setEmployeesError] = useState(null)
  const [scenarioType, setScenarioType] = useState('baseline')
  const [removed, setRemoved] = useState([])
  const [html, setHtml] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    resilienceAPI.getEmployees().then((data) => {
      const names = (data.employees || []).map((e) => e.name || e.Employee).filter(Boolean)
      setAllEmployees(names)
    }).catch((e) => setEmployeesError(e.message))
  }, [])

  const toggleEmployee = (name) => {
    setRemoved((prev) =>
      prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]
    )
  }

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const h = await resilienceAPI.getReportHtml(scenarioType, removed.join(','))
      setHtml(h)
      addToast('Report generated successfully')
    } catch (e) {
      setError(e.message)
      addToast(e.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (employeesError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resilience Report</h1>
          <p className="text-gray-500 mt-1">Generate a downloadable HTML report</p>
        </div>
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
          <p className="text-red-600 font-medium mb-2">Failed to load employee data</p>
          <p className="text-sm text-gray-500">{employeesError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resilience Report</h1>
        <p className="text-gray-500 mt-1">Generate a downloadable HTML report</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
        <div className="flex gap-3">
          <button
            onClick={() => setScenarioType('baseline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              scenarioType === 'baseline'
                ? 'border-relisoft-500 bg-relisoft-50 text-relisoft-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Current State
          </button>
          <button
            onClick={() => setScenarioType('attrition')}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              scenarioType === 'attrition'
                ? 'border-relisoft-500 bg-relisoft-50 text-relisoft-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            What-If Report
          </button>
        </div>

        {scenarioType === 'attrition' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select employees leaving</label>
            <div className="flex flex-wrap gap-2">
              {(allEmployees.length > 0 ? allEmployees : []).map((name) => (
                <button
                  key={name}
                  onClick={() => toggleEmployee(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    removed.includes(name)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={generateReport}
          disabled={loading || (scenarioType === 'attrition' && removed.length === 0)}
          className="bg-relisoft-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-relisoft-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {html && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">Report Preview</p>
            <button
              onClick={() => {
                const blob = new Blob([html], { type: 'text/html' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'relisoft-report.html'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="bg-relisoft-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-relisoft-700"
            >
              Download HTML
            </button>
          </div>
          <iframe
            srcDoc={html}
            title="Report"
            className="w-full h-[600px] border-0"
          />
        </div>
      )}
    </div>
  )
}
