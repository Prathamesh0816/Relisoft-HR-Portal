import { useEffect, useState } from 'react'
import useStore from '../store'
import { getAssets, createAsset, getEmployeeAssets, assignAsset, returnAsset, getAllAssignments, deleteAsset, getAssetTemplate, uploadAssetExcel } from '../api'
import { Upload, Download, Trash2, Package } from 'lucide-react'

export default function AssetManagement() {
  const { setMessage, currentUser } = useStore()
  const [assets, setAssets] = useState([])
  const [assignments, setAssignments] = useState([])
  const [tab, setTab] = useState('catalog')
  const [newAsset, setNewAsset] = useState({ name: '', assetTag: '', category: '', serialNumber: '' })
  const [showForm, setShowForm] = useState(false)
  const [assignEmpId, setAssignEmpId] = useState('')
  const [assignAssetId, setAssignAssetId] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)

  useEffect(() => { refreshAssets(); refreshAssignments() }, [])

  const refreshAssets = () => getAssets().then(setAssets)
  const refreshAssignments = () => getAllAssignments().then(setAssignments)

  const handleCreate = async () => {
    if (!newAsset.name) return
    await createAsset({ ...newAsset, status: 'Available' })
    setNewAsset({ name: '', assetTag: '', category: '', serialNumber: '' })
    setShowForm(false); refreshAssets(); setMessage({ type: 'success', text: 'Asset created.' })
  }

  const handleAssign = async () => {
    if (!assignEmpId || !assignAssetId) return
    await assignAsset(Number(assignEmpId), Number(assignAssetId))
    setAssignEmpId(''); setAssignAssetId(''); refreshAssignments()
    setMessage({ type: 'success', text: 'Asset assigned.' })
  }

  const handleReturn = async (id) => {
    await returnAsset(id); refreshAssignments(); setMessage({ type: 'success', text: 'Asset returned.' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this asset?')) return
    try {
      await deleteAsset(id)
      setMessage({ type: 'success', text: 'Asset deleted.' })
      refreshAssets()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed.' })
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const blob = await getAssetTemplate()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url; a.download = 'asset-upload-template.xlsx'
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } catch { setMessage({ type: 'error', text: 'Download failed.' }) }
  }

  const handleUploadExcel = async () => {
    if (!uploadFile) return
    setUploading(true); setUploadResult(null)
    try {
      const fd = new FormData()
      fd.append('file', uploadFile)
      const result = await uploadAssetExcel(fd)
      setUploadResult(result)
      setMessage({ type: 'success', text: `Processed: ${result.recordsProcessed}, Skipped: ${result.recordsSkipped}, Failed: ${result.recordsFailed}` })
      setUploadFile(null)
      refreshAssets()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally { setUploading(false) }
  }

  const availableAssets = assets.filter((a) => a.status === 'Available')
  const { data } = useStore()

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Asset management</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Manage company assets, assign to employees, and track handover during offboarding.</p>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5 flex items-center gap-3 border-b border-navy/10">
          {['catalog', 'assignments', 'upload'].map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70'}`}>
              {t === 'catalog' ? 'Asset catalog' : t === 'assignments' ? 'Assignments' : 'Upload Excel'}
            </button>
          ))}
        </div>
        {tab === 'catalog' && (
          <div className="p-5 space-y-3">
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-navy dark:bg-navy-dark text-white font-bold text-xs rounded-xl">{showForm ? 'Cancel' : '+ New asset'}</button>
            {showForm && (
              <div className="grid md:grid-cols-5 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
                <input placeholder="Asset name" value={newAsset.name} onChange={(e) => setNewAsset((s) => ({ ...s, name: e.target.value }))} className="input" />
                <input placeholder="Asset tag" value={newAsset.assetTag} onChange={(e) => setNewAsset((s) => ({ ...s, assetTag: e.target.value }))} className="input" />
                <input placeholder="Category (Laptop/Monitor/etc)" value={newAsset.category} onChange={(e) => setNewAsset((s) => ({ ...s, category: e.target.value }))} className="input" />
                <input placeholder="Serial number" value={newAsset.serialNumber} onChange={(e) => setNewAsset((s) => ({ ...s, serialNumber: e.target.value }))} className="input" />
                <button onClick={handleCreate} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Save</button>
              </div>
            )}
            <div className="grid md:grid-cols-3 gap-3">
              {assets.map((a) => (
                <div key={a.id} className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-heading font-bold text-navy dark:text-white text-sm">{a.name}</div>
                      <div className="text-xs text-navy/50 dark:text-white/50 mt-1">Tag: {a.assetTag}</div>
                      <div className="text-xs text-navy/50 dark:text-white/50">Category: {a.category}</div>
                      {a.serialNumber && <div className="text-xs text-navy/50 dark:text-white/50">S/N: {a.serialNumber}</div>}
                      <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded font-bold ${a.status === 'Available' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700' : a.status === 'Assigned' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700' : 'bg-red-50 dark:bg-red-900/30 text-red-700'}`}>{a.status}</span>
                    </div>
                    <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete asset">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'assignments' && (
          <div className="p-5 space-y-3">
            <div className="grid md:grid-cols-4 gap-3 p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30">
              <select value={assignEmpId} onChange={(e) => setAssignEmpId(e.target.value)} className="input">
                <option value="">Select employee...</option>
                {data.employees.filter((e) => e.status === 'Active').map((e) => (
                  <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                ))}
              </select>
              <select value={assignAssetId} onChange={(e) => setAssignAssetId(e.target.value)} className="input">
                <option value="">Select asset...</option>
                {availableAssets.map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                ))}
              </select>
              <button onClick={handleAssign} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">Assign</button>
            </div>
            <div className="space-y-2">
              {assignments.filter((a) => a.status === 'Assigned').map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                  <div>
                    <span className="font-bold text-navy dark:text-white text-xs">{a.assetName}</span>
                    <span className="text-xs text-navy/50 dark:text-white/50 ml-3">{a.employeeName}</span>
                    <span className="text-xs text-navy/50 dark:text-white/50 ml-3">Since {new Date(a.assignedOn).toLocaleDateString()}</span>
                  </div>
                  <button onClick={() => handleReturn(a.id)} className="px-3 py-1 border border-red-200 text-red-600 font-bold text-xs rounded-xl">Return</button>
                </div>
              ))}
              {assignments.filter((a) => a.status === 'Assigned').length === 0 && <p className="text-xs text-navy/50 dark:text-white/50 text-center py-4">No active assignments.</p>}
            </div>
          </div>
        )}
        {tab === 'upload' && (
          <div className="p-5 space-y-4">
            <h3 className="font-heading font-bold text-lg text-navy dark:text-white">Bulk Upload Assets from Excel</h3>
            <p className="text-sm text-muted">Upload an Excel file maintained by vendors to auto-populate the asset catalog. Download the template first to ensure correct column format.</p>
            <div className="flex items-center gap-3">
              <button onClick={handleDownloadTemplate} className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100">
                <Download size={14} className="inline mr-1" />Download Template
              </button>
            </div>
            <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-amber-50/30 space-y-3">
              <input type="file" onChange={(e) => setUploadFile(e.target.files[0])} className="input w-full" accept=".xlsx,.xls" />
              {uploadFile && <p className="text-xs text-muted">{uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)</p>}
              <button onClick={handleUploadExcel} disabled={uploading || !uploadFile} className="px-4 py-2 bg-gradient-to-r from-gold-1 to-gold-2 text-navy-dark font-bold text-xs rounded-xl">
                <Upload size={14} className="inline mr-1" />{uploading ? 'Uploading...' : 'Upload & Process'}
              </button>
            </div>
            {uploadResult && (
              <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <h4 className="font-bold text-sm text-navy dark:text-white mb-2">Upload Results</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-emerald-600">{uploadResult.recordsProcessed}</div><div className="text-xs text-muted">Processed</div></div>
                  <div><div className="text-2xl font-bold text-amber-600">{uploadResult.recordsSkipped}</div><div className="text-xs text-muted">Skipped</div></div>
                  <div><div className="text-2xl font-bold text-red-600">{uploadResult.recordsFailed}</div><div className="text-xs text-muted">Failed</div></div>
                </div>
                {uploadResult.errors?.length > 0 && (
                  <div className="mt-3 text-xs text-red-600">
                    {uploadResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
