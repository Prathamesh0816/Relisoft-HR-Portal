import { useState, useEffect } from 'react'
import { getKnowledgeBase, createKnowledgeArticle, recordArticleView } from '../api'
import useStore from '../store'
import { BookOpen, Search, Plus, ChevronDown, ChevronUp, Eye, FileText } from 'lucide-react'

const categories = ['FAQ', 'HR Policy', 'IT Guide', 'Company Info', 'Onboarding']

export default function KnowledgeBase() {
  const { currentUser, knowledgeBase, setKnowledgeBase } = useStore()
  const [articles, setArticles] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'FAQ', tags: '' })
  const [submitting, setSubmitting] = useState(false)

  const isHR = ['HRL2', 'HR', 'Admin', 'SuperAdmin'].includes(currentUser?.role)

  const loadArticles = async () => {
    try {
      const data = await getKnowledgeBase(category || undefined, search || undefined)
      setArticles(data)
      setKnowledgeBase({ articles: data, loading: false })
    } catch {}
  }

  useEffect(() => {
    loadArticles()
  }, [category])

  useEffect(() => {
    const timer = setTimeout(loadArticles, 400)
    return () => clearTimeout(timer)
  }, [search])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content) return
    setSubmitting(true)
    try {
      await createKnowledgeArticle(form)
      setForm({ title: '', content: '', category: 'FAQ', tags: '' })
      setShowForm(false)
      await loadArticles()
    } catch {}
    setSubmitting(false)
  }

  const handleView = async (id) => {
    setExpanded(expanded === id ? null : id)
    if (expanded !== id) {
      try {
        await recordArticleView(id)
        setArticles(prev => prev.map(a => a.id === id ? { ...a, viewCount: (a.viewCount || 0) + 1 } : a))
      } catch {}
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <span className="section-kicker">Reference</span>
          <h2 className="section-title text-2xl mt-1">Knowledge Base</h2>
        </div>
        {isHR && (
          <button onClick={() => setShowForm(!showForm)} className="gold-button px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus size={16} /> New Article
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40"
            placeholder="Search articles..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!category ? 'bg-gold-1 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === c ? 'bg-gold-1 text-navy-dark' : 'border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card-surface p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40"
                placeholder="Article title" required />
            </div>
            <div>
              <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40"
              placeholder="hr, policy, leave" />
          </div>
          <div>
            <label className="text-xs font-bold text-navy dark:text-white/80 uppercase tracking-wider">Content</label>
            <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows={6}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-navy-dark/80 text-navy dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-1/40 font-mono"
              placeholder="Article content (markdown supported)" required />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="gold-button px-5 py-2 rounded-xl text-sm font-bold">
              {submitting ? 'Saving...' : 'Publish Article'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 hover:bg-navy/5">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {articles.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-gold-1/50" />
            <p className="text-muted dark:text-white/60 text-sm">No articles found</p>
          </div>
        ) : articles.map((a) => (
          <div key={a.id} className="card-surface overflow-hidden">
            <button
              onClick={() => handleView(a.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-navy/5 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-1/10 flex items-center justify-center">
                  <FileText size={16} className="text-gold-1" />
                </div>
                <div>
                  <div className="font-bold text-sm text-navy dark:text-white">{a.title}</div>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted dark:text-white/40 mt-0.5">
                    <span>{a.category}</span>
                    <span className="flex items-center gap-1"><Eye size={10} /> {a.viewCount || 0}</span>
                  </div>
                </div>
              </div>
              {expanded === a.id ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
            </button>
            {expanded === a.id && (
              <div className="px-4 pb-4 pt-0 border-t border-navy/5 dark:border-white/5">
                <div className="prose prose-sm max-w-none text-sm text-muted dark:text-white/80 mt-3 whitespace-pre-wrap">
                  {a.content}
                </div>
                <div className="flex items-center gap-3 mt-3 text-[10px] font-bold text-muted dark:text-white/40">
                  <span>By {a.createdByName}</span>
                  <span>{new Date(a.createdOn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {a.tags && <span>Tags: {a.tags}</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
