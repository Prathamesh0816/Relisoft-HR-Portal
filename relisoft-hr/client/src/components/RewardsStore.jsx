import { useEffect, useState } from 'react'
import useStore from '../store'
import { getMyRewardPoints, getRewardCatalog, redeemRewardItem, getMyRedemptions, getMyRewardTransactions } from '../api'
import { Gift, Award, ShoppingBag, History, Star, CheckCircle, Clock, Package } from 'lucide-react'

export default function RewardsStore() {
  const { rewards, setRewards, setMessage, currentUser } = useStore()
  const [tab, setTab] = useState('catalog')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setRewards({ loading: true })
    try {
      const [myPoints, catalog, myRedemptions, transactions] = await Promise.all([
        getMyRewardPoints(), getRewardCatalog(), getMyRedemptions(), getMyRewardTransactions()
      ])
      setRewards({ myPoints, catalog, myRedemptions, transactions, loading: false })
    } catch { setRewards({ loading: false }) }
  }

  const handleRedeem = async (itemId) => {
    try {
      const result = await redeemRewardItem(itemId, {})
      setMessage({ type: 'success', text: result.message })
      loadAll()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Redemption failed' })
    }
  }

  if (rewards.loading) return <div className="text-center py-10 text-muted">Loading...</div>
  const balance = rewards.myPoints?.balance || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-gold-1">{balance}</div>
          <div className="text-xs text-muted font-bold mt-1">Points Balance</div>
        </div>
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-moss">{rewards.myPoints?.lifetimeEarned || 0}</div>
          <div className="text-xs text-muted font-bold mt-1">Lifetime Earned</div>
        </div>
        <div className="card-surface p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">{rewards.myRedemptions.length}</div>
          <div className="text-xs text-muted font-bold mt-1">Items Redeemed</div>
        </div>
      </div>

      <div className="flex gap-2">
        {['catalog', 'redemptions', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-moss text-white' : 'bg-gray-100 dark:bg-navy-dark/60 text-navy dark:text-white/70'}`}>
            {t === 'catalog' ? 'Rewards Catalog' : t === 'redemptions' ? 'My Redemptions' : 'Transaction History'}
          </button>
        ))}
      </div>

      {tab === 'catalog' && (
        <div className="space-y-4">
          {rewards.catalog.length === 0 ? (
            <div className="card-surface p-6 text-center text-muted">No rewards available yet. Check back soon!</div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {rewards.catalog.map(item => (
                <div key={item.id} className="card-surface p-5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-1 to-gold-2 flex items-center justify-center mb-3">
                    <Gift size={28} className="text-navy-dark" />
                  </div>
                  <h3 className="font-bold text-navy dark:text-white text-sm">{item.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center gap-1 mt-2 text-gold-1 font-bold">
                    <Star size={14} /> {item.pointsCost} pts
                  </div>
                  <div className="text-xs text-muted mt-1">{item.category} · {item.quantity} left</div>
                  <button onClick={() => handleRedeem(item.id)}
                    disabled={balance < item.pointsCost || item.quantity <= 0}
                    className="mt-3 w-full px-3 py-2 rounded-xl text-xs font-bold bg-moss text-white hover:bg-moss-dark disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all">
                    {balance < item.pointsCost ? 'Not enough points' : item.quantity <= 0 ? 'Out of stock' : 'Redeem'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'redemptions' && (
        <div className="card-surface p-6">
          <h3 className="font-bold text-navy dark:text-white mb-4"><Package size={16} className="inline mr-2" />My Redemptions</h3>
          {rewards.myRedemptions.length === 0 ? (
            <p className="text-muted text-sm">No redemptions yet.</p>
          ) : (
            <div className="space-y-3">
              {rewards.myRedemptions.map(r => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                  <div className="w-10 h-10 rounded-xl bg-moss/10 flex items-center justify-center">
                    {r.status === 'Fulfilled' ? <CheckCircle size={20} className="text-green-500" /> : <Clock size={20} className="text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-navy dark:text-white text-sm">{r.itemName}</div>
                    <div className="text-xs text-muted">{r.pointsCost} pts · {r.status}</div>
                    <div className="text-xs text-muted">{new Date(r.createdOn).toLocaleDateString()}</div>
                  </div>
                  {r.fulfilledOn && <div className="text-xs text-green-500">Fulfilled {new Date(r.fulfilledOn).toLocaleDateString()}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="card-surface p-6">
          <h3 className="font-bold text-navy dark:text-white mb-4"><History size={16} className="inline mr-2" />Transaction History</h3>
          {rewards.transactions.length === 0 ? (
            <p className="text-muted text-sm">No transactions yet.</p>
          ) : (
            <div className="space-y-2">
              {rewards.transactions.map(t => (
                <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-navy-dark/60">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${t.points > 0 ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                    {t.points > 0 ? '+' : ''}{t.points}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-navy dark:text-white text-sm">{t.reference || t.type}</div>
                    <div className="text-xs text-muted">{new Date(t.createdOn).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
