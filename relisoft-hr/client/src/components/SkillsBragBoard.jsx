import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMySkills, addSkill, removeSkill, getSkillsDirectory, endorseSkill, getBragPosts, createBragPost, likeBragPost, deleteBragPost } from '../api'
import { Award, ThumbsUp, Plus, X, Search, Star, Trash2, Sparkles, MessageSquare } from 'lucide-react'

export default function SkillsBragBoard() {
  const { skills, setSkills, setMessage, currentUser } = useStore()
  const [tab, setTab] = useState('skills')
  const [newSkill, setNewSkill] = useState('')
  const [newCategory, setNewCategory] = useState('Technical')
  const [search, setSearch] = useState('')
  const [bragMessage, setBragMessage] = useState('')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setSkills({ loading: true })
    try {
      const [mySkills, directory, bragPosts] = await Promise.all([
        getMySkills(), getSkillsDirectory(), getBragPosts()
      ])
      setSkills({ mySkills, directory, bragPosts, loading: false })
    } catch { setSkills({ loading: false }) }
  }

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return
    try {
      await addSkill({ skillName: newSkill, category: newCategory })
      setNewSkill(''); setMessage({ type: 'success', text: 'Skill added!' })
      const [mySkills, directory] = await Promise.all([getMySkills(), getSkillsDirectory()])
      setSkills({ mySkills, directory })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }) }
  }

  const handleRemoveSkill = async (id) => {
    try { await removeSkill(id); loadAll() }
    catch { setMessage({ type: 'error', text: 'Failed to remove' }) }
  }

  const handleEndorse = async (skillId) => {
    try {
      await endorseSkill(skillId)
      const directory = await getSkillsDirectory()
      setSkills({ directory })
      setMessage({ type: 'success', text: 'Endorsed!' })
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }) }
  }

  const handleBrag = async () => {
    if (!bragMessage.trim()) return
    try {
      await createBragPost({ message: bragMessage })
      setBragMessage(''); setMessage({ type: 'success', text: 'Posted!' })
      const bragPosts = await getBragPosts()
      setSkills({ bragPosts })
    } catch { setMessage({ type: 'error', text: 'Failed' }) }
  }

  const handleLike = async (id) => {
    try {
      await likeBragPost(id)
      const bragPosts = await getBragPosts()
      setSkills({ bragPosts })
    } catch { }
  }

  const handleDeleteBrag = async (id) => {
    try { await deleteBragPost(id); loadAll() }
    catch { }
  }

  if (skills.loading) return <div className="text-center py-10 text-muted">Loading...</div>

  const categories = ['Technical', 'Management', 'Communication', 'Leadership', 'Design', 'Domain', 'Other']
  const filteredDir = skills.directory.filter(s =>
    !search || s.skillName.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {['skills', 'directory', 'brag'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-navy dark:text-white/70 hover:bg-gray-200'}`}>
            {t === 'skills' ? 'My Skills' : t === 'directory' ? 'Skills Directory' : 'Brag Board'}
          </button>
        ))}
      </div>

      {tab === 'skills' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2"><Award size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">My Skills</h3></div>
          <div className="flex gap-2">
            <input value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Add a skill..." className="input flex-1" />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="input w-40">
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <button onClick={handleAddSkill} className="btn-primary"><Plus size={16} /> Add</button>
          </div>
          {skills.mySkills.length === 0 ? (
            <p className="text-muted text-sm py-4">No skills added yet. Start building your profile!</p>
          ) : (
            <div className="space-y-2">
              {skills.mySkills.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                  <Star size={16} className="text-gold-1" />
                  <div className="flex-1">
                    <div className="font-bold text-navy dark:text-white text-sm">{s.skillName}</div>
                    <div className="text-xs text-muted">{s.category} · {s.endorsementCount} endorsements</div>
                  </div>
                  <button onClick={() => handleRemoveSkill(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"><X size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'directory' && (
        <div className="card-surface p-6 space-y-4">
          <div className="flex items-center gap-2"><Search size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Skills Directory</h3></div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills or categories..." className="input w-full" />
          {filteredDir.length === 0 ? (
            <p className="text-muted text-sm">No skills found.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredDir.map(s => (
                <div key={s.id} className="p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                  <div className="font-bold text-navy dark:text-white text-sm">{s.skillName}</div>
                  <div className="text-xs text-muted">{s.employeeName} · {s.category}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-bold text-muted">{s.endorsementCount} endorsements</span>
                    <button onClick={() => handleEndorse(s.id)} disabled={s.employeeId === currentUser?.id}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-moss/10 text-moss text-xs font-bold hover:bg-moss/20 disabled:opacity-40">
                      <ThumbsUp size={12} /> Endorse
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'brag' && (
        <div className="space-y-4">
          <div className="card-surface p-6">
            <div className="flex items-center gap-2 mb-4"><Sparkles size={18} className="text-moss" /><h3 className="font-bold text-navy dark:text-white">Share a Win</h3></div>
            <div className="flex gap-2">
              <input value={bragMessage} onChange={e => setBragMessage(e.target.value)} placeholder="What did you achieve today? 🎉" className="input flex-1" />
              <button onClick={handleBrag} className="btn-primary"><MessageSquare size={16} /> Post</button>
            </div>
          </div>
          {skills.bragPosts.map(p => (
            <div key={p.id} className="card-surface p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center text-navy-dark font-bold text-sm">
                  {p.employeeName?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-navy dark:text-white text-sm">{p.employeeName}</div>
                  <div className="text-sm text-navy dark:text-white/80 mt-1">{p.message}</div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                    <button onClick={() => handleLike(p.id)} className="flex items-center gap-1 hover:text-moss transition-colors">
                      <ThumbsUp size={14} /> {p.likeCount}
                    </button>
                    <span>{new Date(p.createdOn).toLocaleDateString()}</span>
                    {p.employeeId === currentUser?.id && (
                      <button onClick={() => handleDeleteBrag(p.id)} className="text-red-400 hover:text-red-600 ml-auto"><Trash2 size={14} /></button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {skills.bragPosts.length === 0 && (
            <p className="text-muted text-sm text-center py-8">No brags yet. Be the first to share a win!</p>
          )}
        </div>
      )}
    </div>
  )
}
