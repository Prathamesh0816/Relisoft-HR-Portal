import { useState, useEffect, useCallback } from 'react'
import useStore from '../store'
import {
  getEmployeeReviews, getReviewsHistory, createReview,
  rateCriterion, completeReview
} from '../api'

const REVIEW_MANAGER_ROLES = ['HRL2', 'HR', 'Admin', 'SuperAdmin', 'Manager', 'ManagerL2', 'OrganizationHead']
const CATEGORIES = [
  { key: 'PerformanceAndDelivery', label: 'Performance & Delivery' },
  { key: 'BehavioralAndTeamSkills', label: 'Behavioral & Team Skills' }
]
const fmtRating = (n) => (n == null ? '—' : Number(n).toFixed(1))

export default function ReviewsPage() {
  const { currentUser, data, setMessage } = useStore()
  const canManage = REVIEW_MANAGER_ROLES.includes(currentUser?.role)
  const isManagerOnly = ['Manager', 'ManagerL2', 'OrganizationHead'].includes(currentUser?.role) && !['HRL2', 'HR', 'Admin', 'SuperAdmin'].includes(currentUser?.role)

  const [employeeId, setEmployeeId] = useState(currentUser?.id ? String(currentUser.id) : '')
  const [reviews, setReviews] = useState(null)
  const [history, setHistory] = useState([])
  const [scorecards, setScorecards] = useState({})
  const [newReview, setNewReview] = useState({ employeeId: '', reviewType: 'SixMonth', reviewDate: new Date().toISOString().slice(0, 10) })
  const [loading, setLoading] = useState(false)

  const loadHistory = useCallback(async () => {
    if (!canManage) return
    try {
      const data = await getReviewsHistory(isManagerOnly ? currentUser.id : null)
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setHistory([])
    }
  }, [canManage, isManagerOnly, currentUser?.id])

  const loadReviews = useCallback(async (empId) => {
    if (!empId) {
      setReviews([])
      return
    }
    setLoading(true)
    try {
      const list = await getEmployeeReviews(empId)
      setReviews(Array.isArray(list) ? list : [])
      const cards = {}
      ;(Array.isArray(list) ? list : []).forEach((r) => {
        cards[r.id] = {
          ratings: Object.fromEntries((r.criteria || []).map((c) => [c.id, c.rating])),
          remarks: Object.fromEntries((r.criteria || []).map((c) => [c.id, c.remarks || ''])),
          keyStrengths: r.keyStrengths || '',
          areasOfImprovement: r.areasOfImprovement || '',
          trainingSupportRequired: r.trainingSupportRequired || '',
          recommendation: r.recommendation || '',
          eligibleForRoleEnhancement: r.eligibleForRoleEnhancement
        }
      })
      setScorecards(cards)
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load reviews.' })
    } finally {
      setLoading(false)
    }
  }, [setMessage])

  useEffect(() => {
    if (employeeId) loadReviews(employeeId)
  }, [employeeId, loadReviews])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const handleLoad = () => {
    if (!employeeId) {
      setMessage({ type: 'error', text: 'Select an employee.' })
      return
    }
    loadReviews(employeeId)
  }

  const saveRatings = async (review) => {
    const card = scorecards[review.id]
    if (!card) return
    try {
      for (const criterion of review.criteria || []) {
        if (card.ratings[criterion.id] != null) {
          await rateCriterion(review.id, {
            performanceReviewId: review.id,
            criterionId: criterion.id,
            rating: Number(card.ratings[criterion.id]),
            remarks: card.remarks[criterion.id] || null
          })
        }
      }
      setMessage({ type: 'success', text: 'Ratings saved.' })
      await loadReviews(employeeId)
      await loadHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save ratings.' })
    }
  }

  const handleComplete = async (review) => {
    const card = scorecards[review.id]
    if (!card) return
    try {
      for (const criterion of review.criteria || []) {
        if (card.ratings[criterion.id] != null) {
          await rateCriterion(review.id, {
            performanceReviewId: review.id,
            criterionId: criterion.id,
            rating: Number(card.ratings[criterion.id]),
            remarks: card.remarks[criterion.id] || null
          })
        }
      }
      await completeReview(review.id, {
        performanceReviewId: review.id,
        keyStrengths: card.keyStrengths || null,
        areasOfImprovement: card.areasOfImprovement || null,
        trainingSupportRequired: card.trainingSupportRequired || null,
        recommendation: card.recommendation || null,
        eligibleForRoleEnhancement: card.eligibleForRoleEnhancement
      })
      setMessage({ type: 'success', text: 'Review completed.' })
      await loadReviews(employeeId)
      await loadHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to complete review.' })
    }
  }

  const handleCreate = async () => {
    if (!newReview.employeeId) {
      setMessage({ type: 'error', text: 'Select an employee.' })
      return
    }
    try {
      await createReview({
        employeeId: Number(newReview.employeeId),
        reviewerId: currentUser.id,
        reviewType: newReview.reviewType,
        reviewDate: newReview.reviewDate
      })
      setMessage({ type: 'success', text: 'Performance review created.' })
      setEmployeeId(newReview.employeeId)
      await loadHistory()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create review.' })
    }
  }

  const updateCard = (reviewId, field, value) =>
    setScorecards((s) => ({ ...s, [reviewId]: { ...s[reviewId], [field]: value } }))

  const updateCriterion = (reviewId, field, criterionId, value) =>
    setScorecards((s) => ({
      ...s,
      [reviewId]: { ...s[reviewId], [field]: { ...s[reviewId][field], [criterionId]: value } }
    }))

  return (
    <div className="space-y-4">
      {/* Employee selector */}
      <div className="card-surface">
        <div className="p-5">
          <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Performance Reviews</h2>
          <p className="text-muted dark:text-white/60 text-sm mt-1">
            Yearly and 6-month scorecards, filled in by the reviewer.
          </p>
        </div>
        <div className="px-5 pb-5 flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Employee</label>
            <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} className="mt-1.5 w-72 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
              <option value="">Select an employee...</option>
              {data.employees.map((e) => (
                <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
              ))}
            </select>
          </div>
          <button onClick={handleLoad} disabled={loading} className="px-5 py-3 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-sm hover:bg-navy/5 transition-all h-12">
            {loading ? 'Loading...' : 'Load reviews'}
          </button>
        </div>
      </div>

      {/* Reviews list */}
      {reviews !== null && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="card-surface p-5 text-sm text-navy/50 dark:text-white/50">
              No reviews yet for this employee.
            </div>
          ) : (
            reviews.map((review) => {
              const card = scorecards[review.id] || { ratings: {}, remarks: {}, keyStrengths: '', areasOfImprovement: '', trainingSupportRequired: '', recommendation: '', eligibleForRoleEnhancement: false }
              const canEdit = canManage && review.status !== 'Completed'
              return (
                <div key={review.id} className="card-surface overflow-hidden">
                  <div className="p-5 border-b border-navy/10 dark:border-white/10">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-heading font-bold text-navy dark:text-white">
                        {review.reviewType === 'Yearly' ? 'Yearly' : '6-Month'} Feedback — {new Date(review.reviewDate).toLocaleDateString()}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${review.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                        {review.status}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 mt-3 text-sm">
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Employee name</span><strong className="text-navy dark:text-white">{review.employeeName}</strong></div>
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Employee ID</span><strong className="text-navy dark:text-white">{review.employeeCode}</strong></div>
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Department</span><strong className="text-navy dark:text-white">{review.department}</strong></div>
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Designation</span><strong className="text-navy dark:text-white">{review.designation}</strong></div>
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Reporting manager</span><strong className="text-navy dark:text-white">{review.reportingManagerName || 'none'}</strong></div>
                      <div className="flex justify-between py-1 border-b border-navy/5 dark:border-white/5"><span className="text-navy/50 dark:text-white/50">Reviewer</span><strong className="text-navy dark:text-white">{review.reviewerName}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-navy/50 dark:text-white/50">Overall rating</span><strong className="text-navy dark:text-white">{fmtRating(review.overallRating)}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-navy/50 dark:text-white/50">Overall assessment</span><strong className="text-navy dark:text-white">{review.overallAssessment || '—'}</strong></div>
                      <div className="flex justify-between py-1"><span className="text-navy/50 dark:text-white/50">Eligible for role enhancement</span><strong className="text-navy dark:text-white">{review.status === 'Completed' ? (review.eligibleForRoleEnhancement ? 'Yes' : 'No') : '—'}</strong></div>
                    </div>
                  </div>

                  <div className="px-5 py-4 space-y-5">
                    {CATEGORIES.map((category) => (
                      <div key={category.key}>
                        <h4 className="font-bold text-sm text-navy dark:text-white mb-2">{category.label}</h4>
                        <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-navy/5 dark:bg-white/5">
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Criteria</th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Weight %</th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Rating (1-5)</th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Weighted score</th>
                                <th className="text-left px-4 py-2.5 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Remarks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(review.criteria || []).filter((c) => c.category === category.key).map((criterion) => (
                                <tr key={criterion.id} className="border-t border-navy/5 dark:border-white/5">
                                  <td className="px-4 py-2.5 font-bold text-navy dark:text-white">{criterion.title}</td>
                                  <td className="px-4 py-2.5 text-navy/70 dark:text-white/70">{criterion.weightPercent}</td>
                                  <td className="px-4 py-2.5">
                                    {canEdit ? (
                                      <input
                                        type="number"
                                        min="1"
                                        max="5"
                                        value={card.ratings[criterion.id] ?? ''}
                                        onChange={(e) => updateCriterion(review.id, 'ratings', criterion.id, e.target.value ? Number(e.target.value) : null)}
                                        className="h-9 w-20 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white"
                                      />
                                    ) : (
                                      <span className="text-navy dark:text-white">{criterion.rating?.toString() || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-navy/70 dark:text-white/70">{criterion.weightedScore ?? '—'}</td>
                                  <td className="px-4 py-2.5">
                                    {canEdit ? (
                                      <input
                                        value={card.remarks[criterion.id] || ''}
                                        onChange={(e) => updateCriterion(review.id, 'remarks', criterion.id, e.target.value)}
                                        className="h-9 w-full min-w-40 px-3 rounded-lg border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white"
                                      />
                                    ) : (
                                      <span className="text-navy/70 dark:text-white/70">{criterion.remarks || '—'}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}

                    {canEdit ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Key strengths</label>
                          <textarea rows="2" value={card.keyStrengths} onChange={(e) => updateCard(review.id, 'keyStrengths', e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Areas of improvement</label>
                          <textarea rows="2" value={card.areasOfImprovement} onChange={(e) => updateCard(review.id, 'areasOfImprovement', e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Training/support required</label>
                          <textarea rows="2" value={card.trainingSupportRequired} onChange={(e) => updateCard(review.id, 'trainingSupportRequired', e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Recommendation</label>
                          <textarea rows="2" value={card.recommendation} onChange={(e) => updateCard(review.id, 'recommendation', e.target.value)} className="mt-1.5 w-full px-4 py-3 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <input type="checkbox" id={`eligible-${review.id}`} checked={card.eligibleForRoleEnhancement} onChange={(e) => updateCard(review.id, 'eligibleForRoleEnhancement', e.target.checked)} className="w-4 h-4 accent-[var(--gold-1)]" />
                          <label htmlFor={`eligible-${review.id}`} className="text-sm font-bold text-navy dark:text-white">Eligible for role enhancement/increment</label>
                        </div>
                        <div className="md:col-span-2 flex flex-wrap gap-3">
                          <button onClick={() => saveRatings(review)} className="px-5 py-2.5 rounded-xl border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">Save ratings</button>
                          <button onClick={() => handleComplete(review)} className="gold-button px-5 py-2.5 rounded-xl font-bold text-xs">Complete review</button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="text-navy/70 dark:text-white/70"><span className="text-navy/50 dark:text-white/50">Key strengths: </span>{review.keyStrengths || '—'}</div>
                        <div className="text-navy/70 dark:text-white/70"><span className="text-navy/50 dark:text-white/50">Areas of improvement: </span>{review.areasOfImprovement || '—'}</div>
                        <div className="text-navy/70 dark:text-white/70"><span className="text-navy/50 dark:text-white/50">Training/support required: </span>{review.trainingSupportRequired || '—'}</div>
                        <div className="text-navy/70 dark:text-white/70"><span className="text-navy/50 dark:text-white/50">Recommendation: </span>{review.recommendation || '—'}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {canManage && (
        <>
          <div className="card-surface">
            <div className="p-5">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Start a New Review</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">Create a 6-month or yearly review for an employee.</p>
            </div>
            <div className="px-5 pb-5 flex flex-wrap items-end gap-3">
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Employee</label>
                <select value={newReview.employeeId} onChange={(e) => setNewReview({ ...newReview, employeeId: e.target.value })} className="mt-1.5 w-72 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                  <option value="">Select an employee...</option>
                  {data.employees.map((e) => (
                    <option key={e.id} value={e.id}>{e.fullName} ({e.employeeCode})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Review type</label>
                <select value={newReview.reviewType} onChange={(e) => setNewReview({ ...newReview, reviewType: e.target.value })} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white">
                  <option value="SixMonth">6-Month</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-navy/70 dark:text-white/70 uppercase tracking-wider">Review date</label>
                <input type="date" value={newReview.reviewDate} onChange={(e) => setNewReview({ ...newReview, reviewDate: e.target.value })} className="mt-1.5 h-12 px-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] focus:border-gold-1 focus:ring-4 focus:ring-gold-1/10 outline-none transition-all text-navy dark:text-white" />
              </div>
              <button onClick={handleCreate} className="gold-button px-6 py-3 rounded-xl font-bold text-sm h-12">Start review</button>
            </div>
          </div>

          <div className="card-surface">
            <div className="p-5">
              <h2 className="font-heading font-bold text-xl text-navy dark:text-white">Review History</h2>
              <p className="text-muted dark:text-white/60 text-sm mt-1">
                {isManagerOnly ? 'Reviews for your direct reports.' : 'All completed and in-progress reviews.'}
              </p>
            </div>
            <div className="px-5 pb-5">
              {history.length === 0 ? (
                <div className="p-4 rounded-xl border border-navy/10 dark:border-white/10 bg-white dark:bg-[var(--bg-secondary)] text-sm text-navy/50 dark:text-white/50">
                  No review history yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-navy/10 dark:border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy/5 dark:bg-white/5">
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Employee</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Review date</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Overall rating</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Assessment</th>
                        <th className="text-right px-4 py-3 text-xs font-bold text-navy/50 dark:text-white/50 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item) => (
                        <tr key={item.id} className="border-t border-navy/5 dark:border-white/5">
                          <td className="px-4 py-3 font-bold text-navy dark:text-white">{item.employeeName}</td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{item.reviewType === 'Yearly' ? 'Yearly' : '6-Month'}</td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{new Date(item.reviewDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.status === 'Completed' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{fmtRating(item.overallRating)}</td>
                          <td className="px-4 py-3 text-navy/70 dark:text-white/70">{item.overallAssessment || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => setEmployeeId(String(item.employeeId))} className="px-3 py-1.5 rounded-lg border border-navy/10 dark:border-white/10 text-navy/70 dark:text-white/70 font-bold text-xs hover:bg-navy/5">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
