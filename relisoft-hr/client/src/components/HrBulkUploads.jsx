import { useRef } from 'react'
import useStore from '../store'
import { loadWorkspace } from '../api'
import axios from 'axios'

function UploadResult({ result }) {
  if (!result) return null
  return (
    <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] space-y-2">
      <div className="flex gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-800 text-xs font-bold">Processed: {result.recordsProcessed}</span>
        {result.recordsSkipped !== undefined && <span className="px-3 py-1 rounded-full bg-navy/5 text-navy/70 dark:text-white/70 text-xs font-bold">Skipped: {result.recordsSkipped}</span>}
        <span className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 text-xs font-bold">Failed: {result.recordsFailed}</span>
      </div>
      {result.errors?.length > 0 && (
        <div className="space-y-1 mt-2">
          {result.errors.map((err, i) => <div key={i} className="text-xs text-red-600">{err}</div>)}
        </div>
      )}
    </div>
  )
}

function ExistingEmployeeUpload() {
  const { existingEmployeeUpload, setExcelFile, setExcelResult, setMessage, setData } = useStore()
  const fileRef = useRef(null)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) { setMessage({ type: 'error', text: 'Choose a file first.' }); return }
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await axios.post('/api/excel/upload-existing-employees', fd)
      setExcelResult('existingEmployeeUpload', data)
      setMessage({ type: 'success', text: data.message || 'Uploaded.' })
      setData(await loadWorkspace())
    } catch (err) { setMessage({ type: 'error', text: 'Upload failed.' }) }
  }
  return (
    <div className="card-surface">
      <div className="p-5"><h2 className="font-heading font-bold text-xl text-navy dark:text-white">Upload existing employees</h2><p className="text-muted dark:text-white/60 text-sm mt-1">Bulk-add employees whose onboarding was already completed before the portal launch.</p></div>
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Employee Excel file</label>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => setExcelFile('existingEmployeeUpload', e.target.files?.[0]?.name || '')} className="mt-1.5 w-full text-sm text-navy/70 dark:text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold-1 file:text-navy-dark" />
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Selected file</div>
            <div className="text-sm text-navy dark:text-white mt-1 font-bold">{existingEmployeeUpload.fileName || 'No file chosen'}</div>
          </div>
        </div>
        <a href="/api/excel/existing-employees-template" className="inline-block px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Download existing employees template</a>
        <button type="submit" className="gold-button px-6 py-3 rounded-xl font-bold text-sm">Upload existing employees</button>
        <UploadResult result={existingEmployeeUpload.result} />
      </form>
    </div>
  )
}

function LeaveBalanceUpload() {
  const { excelUpload, setExcelFile, setExcelResult, setMessage } = useStore()
  const fileRef = useRef(null)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) { setMessage({ type: 'error', text: 'Choose a file first.' }); return }
    const fd = new FormData(); fd.append('file', file)
    try {
      const { data } = await axios.post('/api/excel/upload-leave-balances', fd)
      setExcelResult('excelUpload', data)
      setMessage({ type: 'success', text: data.message || 'Uploaded.' })
    } catch (err) { setMessage({ type: 'error', text: 'Upload failed.' }) }
  }
  return (
    <div className="card-surface">
      <div className="p-5"><h2 className="font-heading font-bold text-xl text-navy dark:text-white">Upload leave balances</h2><p className="text-muted dark:text-white/60 text-sm mt-1">Keep existing employees current by importing leave allocations from Excel.</p></div>
      <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase">Excel file</label>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={(e) => setExcelFile('excelUpload', e.target.files?.[0]?.name || '')} className="mt-1.5 w-full text-sm text-navy/70 dark:text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gold-1 file:text-navy-dark" />
          </div>
          <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
            <div className="text-xs font-bold text-navy/50 dark:text-white/50 uppercase">Selected file</div>
            <div className="text-sm text-navy dark:text-white mt-1 font-bold">{excelUpload.fileName || 'No file chosen'}</div>
          </div>
        </div>
        <a href="/api/excel/leave-balance-template" className="inline-block px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5">Download sample Excel template</a>
        <button type="submit" className="gold-button px-6 py-3 rounded-xl font-bold text-sm">Upload leave balance sheet</button>
        <UploadResult result={excelUpload.result} />
      </form>
    </div>
  )
}

export default function HrBulkUploads() {
  return (
    <div className="space-y-4">
      <ExistingEmployeeUpload />
      <LeaveBalanceUpload />
    </div>
  )
}
