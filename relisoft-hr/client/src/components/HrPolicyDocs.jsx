import { useEffect, useState } from 'react'
import useStore from '../store'
import { getHrPolicyDocs, uploadHrPolicyDoc, deleteHrPolicyDoc, downloadHrPolicyDoc, getHrPolicyCategories } from '../api'
import { FileText, Upload, Search, Download, Trash2, Filter, X, Calendar, Tag } from 'lucide-react'

const CATEGORIES = ['Leave Policies', 'Benefits', 'Code of Conduct', 'Compliance', 'Awards', 'General']

export default function HrPolicyDocs() {
  const { setMessage, currentUser } = useStore()
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'General', description: '', effectiveDate: '', expiryDate: '', version: '', tags: '' })
  const [file, setFile] = useState(null)

  const isHr = ['HR', 'HRL2', 'Admin', 'SuperAdmin'].includes(currentUser?.role)

  const loadDocs = async () => {
    try {
      setLoading(true)
      const data = await getHrPolicyDocs(categoryFilter || undefined, search || undefined)
      setDocs(Array.isArray(data) ? data : [])
    } catch { setDocs([]) }
    finally { setLoading(false) }
  }

  const loadCategories = async () => {
    try {
      const data = await getHrPolicyCategories()
      setCategories(Array.isArray(data) ? data : [])
    } catch { setCategories([]) }
  }

  useEffect(() => { loadDocs(); loadCategories() }, [categoryFilter])

  const handleSearch = (e) => {
    e.preventDefault()
    loadDocs()
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !form.title) { setMessage({ type: 'error', text: 'Title and file are required.' }); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('Title', form.title)
      fd.append('Category', form.category)
      fd.append('Description', form.description || '')
      fd.append('EffectiveDate', form.effectiveDate || '')
      fd.append('ExpiryDate', form.expiryDate || '')
      fd.append('Version', form.version || '')
      fd.append('Tags', form.tags || '')
      await uploadHrPolicyDoc(fd)
      setMessage({ type: 'success', text: 'Document uploaded successfully.' })
      setShowUpload(false)
      setForm({ title: '', category: 'General', description: '', effectiveDate: '', expiryDate: '', version: '', tags: '' })
      setFile(null)
      await loadDocs()
      await loadCategories()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Upload failed.' })
    } finally { setUploading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await deleteHrPolicyDoc(id)
      setMessage({ type: 'success', text: 'Document deleted.' })
      await loadDocs()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Delete failed.' })
    }
  }

  const handleDownload = async (id, fileName) => {
    try {
      const blob = await downloadHrPolicyDoc(id)
      const url = window.URL.createObjectURL(new Blob([blob]))
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setMessage({ type: 'error', text: 'Download failed.' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="card-surface p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-navy dark:text-white">HR Policies & Documents</h2>
            <p className="text-muted text-sm">Company-wide policies, handbooks, and guidelines.</p>
          </div>
          {isHr && (
            <button onClick={() => setShowUpload(!showUpload)} className="btn-primary">
              <Upload size={16} /> Upload Document
            </button>
          )}
        </div>
      </div>

      {showUpload && isHr && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg text-navy dark:text-white">Upload HR Document</h3>
            <button onClick={() => setShowUpload(false)} className="text-muted hover:text-navy dark:hover:text-white"><X size={20} /></button>
          </div>
          <form onSubmit={handleUpload} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Title *</label>
                <input value={form.title} onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))} required className="input w-full" placeholder="e.g. Leave Policy 2026" />
              </div>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={(e) => setForm(s => ({ ...s, category: e.target.value }))} className="input w-full">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => setForm(s => ({ ...s, description: e.target.value }))} className="input w-full" rows={2} placeholder="Brief description of the document..." />
              </div>
              <div>
                <label className="label">Effective Date</label>
                <input type="date" value={form.effectiveDate} onChange={(e) => setForm(s => ({ ...s, effectiveDate: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm(s => ({ ...s, expiryDate: e.target.value }))} className="input w-full" />
              </div>
              <div>
                <label className="label">Version</label>
                <input value={form.version} onChange={(e) => setForm(s => ({ ...s, version: e.target.value }))} className="input w-full" placeholder="e.g. 2.1" />
              </div>
              <div>
                <label className="label">Tags</label>
                <input value={form.tags} onChange={(e) => setForm(s => ({ ...s, tags: e.target.value }))} className="input w-full" placeholder="comma-separated" />
              </div>
            </div>
            <div>
              <label className="label">File *</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} required className="input w-full" accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg" />
              {file && <p className="text-xs text-muted mt-1">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>}
            </div>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>
        </div>
      )}

      <div className="card-surface p-4">
        <div className="flex items-center gap-3 mb-4">
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="input w-full pl-9" placeholder="Search documents..." />
            </div>
            <button type="submit" className="btn-primary text-xs">Search</button>
          </form>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input w-48 text-xs">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : docs.length === 0 ? (
          <p className="text-muted text-sm">No documents found.</p>
        ) : (
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)]">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gold-1/10">
                    <FileText size={20} className="text-gold-1" />
                  </div>
                  <div>
                    <div className="font-bold text-navy dark:text-white text-sm">{doc.title}</div>
                    <div className="text-xs text-muted mt-0.5">{doc.category} · {doc.fileName} · {(doc.fileSize / 1024).toFixed(1)} KB</div>
                    {doc.description && <div className="text-xs text-muted mt-1">{doc.description}</div>}
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      {doc.version && <span>v{doc.version}</span>}
                      {doc.effectiveDate && <span><Calendar size={12} className="inline mr-1" />Effective: {new Date(doc.effectiveDate).toLocaleDateString()}</span>}
                      {doc.tags && <span><Tag size={12} className="inline mr-1" />{doc.tags}</span>}
                      <span>Uploaded by {doc.uploadedByName} on {new Date(doc.uploadedOn).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownload(doc.id, doc.fileName)} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs hover:bg-emerald-100">
                    <Download size={14} className="inline mr-1" />Download
                  </button>
                  {isHr && (
                    <button onClick={() => handleDelete(doc.id)} className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-xs hover:bg-red-100">
                      <Trash2 size={14} className="inline mr-1" />Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
