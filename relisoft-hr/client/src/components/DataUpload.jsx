import { useState } from 'react'
import useStore from '../store'
import { uploadWorkforceData } from '../api'
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react'

const TABLES = ['employees', 'projects', 'dependencies', 'knowledge', 'performance', 'workload']

export default function DataUpload() {
  const { setMessage } = useStore()
  const [table, setTable] = useState('employees')
  const [jsonData, setJsonData] = useState('')
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    setSuccess(false)
    try {
      const rows = JSON.parse(jsonData)
      const res = await uploadWorkforceData(table, rows)
      setMessage({ type: 'success', text: res.message || 'Data uploaded successfully.' })
      setSuccess(true)
      setJsonData('')
    } catch (err) {
      if (err instanceof SyntaxError) {
        setMessage({ type: 'error', text: 'Invalid JSON format.' })
      } else {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
      }
    }
    setUploading(false)
  }

  return (
    <div className="card-surface p-6">
      <h2 className="font-heading font-bold text-xl text-navy dark:text-white mb-1">Data Upload</h2>
      <p className="text-muted text-sm mb-4">Upload workforce data to the resilience engine.</p>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted mb-1">Table</label>
          <select value={table} onChange={(e) => setTable(e.target.value)} className="input">
            {TABLES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-muted mb-1">JSON Data</label>
          <textarea value={jsonData} onChange={(e) => setJsonData(e.target.value)} rows={10} className="input font-mono text-xs" placeholder='[{ "field": "value" }, ...]' />
        </div>
        <button type="submit" disabled={uploading || !jsonData.trim()} className="btn-primary text-xs"><Upload size={14} className="inline mr-1" />{uploading ? 'Uploading...' : 'Upload'}</button>
      </form>
      {success && <p className="text-xs text-emerald-600 font-bold mt-3">Data uploaded successfully.</p>}
    </div>
  )
}