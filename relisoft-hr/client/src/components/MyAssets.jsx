import { useEffect, useState } from 'react'
import useStore from '../store'
import { getEmployeeAssets, returnAsset } from '../api'

export default function MyAssets() {
  const { currentUser, setMessage } = useStore()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.employeeId) { setLoading(false); return }
    getEmployeeAssets(currentUser.employeeId)
      .then((list) => setAssets(list || []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false))
  }, [currentUser?.employeeId])

  const handleReturn = async (id) => {
    try {
      await returnAsset(id)
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'Returned', returnedOn: new Date().toISOString() } : a)))
      setMessage({ type: 'success', text: 'Asset return requested.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to return asset.' })
    }
  }

  const assigned = assets.filter((a) => a.status === 'Assigned')
  const returned = assets.filter((a) => a.status === 'Returned')

  return (
    <div className="space-y-4">
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">My Assets</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">Assets assigned to you by IT / HR.</p>
        </div>
      </div>
      <div className="card-surface">
        <div className="p-5">
          <h3 className="font-heading font-bold text-lg text-navy dark:text-white">Assigned to me ({assigned.length})</h3>
          {loading ? (
            <p className="text-sm text-navy/50 dark:text-white/50 py-6 text-center">Loading...</p>
          ) : assigned.length === 0 ? (
            <p className="text-sm text-navy/50 dark:text-white/50 py-6 text-center">No assets assigned to you.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy/5 dark:bg-white/5">
                    <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Asset</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Tag</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Assigned on</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assigned.map((a) => (
                    <tr key={a.id} className="border-t border-navy/5 dark:border-white/5">
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">{a.assetName}</td>
                      <td className="px-4 py-3 text-navy/70 dark:text-white/70">{a.assetTag || '—'}</td>
                      <td className="px-4 py-3 text-navy/70 dark:text-white/70">{a.assetCategory || '—'}</td>
                      <td className="px-4 py-3 text-navy/70 dark:text-white/70">{new Date(a.assignedOn).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleReturn(a.id)} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Return</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {returned.length > 0 && (
        <div className="card-surface">
          <div className="p-5">
            <h3 className="font-heading font-bold text-lg text-navy dark:text-white">Returned ({returned.length})</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {returned.map((a) => (
                <span key={a.id} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold">
                  {a.assetName} {a.returnedOn ? `— returned ${new Date(a.returnedOn).toLocaleDateString()}` : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}