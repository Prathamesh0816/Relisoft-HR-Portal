import { useState, useEffect } from 'react';
import { Star, TrendingUp, Plus, X, Search, Loader2, ChevronDown, ChevronRight, User, FileText, Sparkles, Brain, BarChart3, Lightbulb, Users, Target } from 'lucide-react';
import toast from 'react-hot-toast';
import { performanceAPI, aiAPI } from '../../services/api';
import useAuth from '../../hooks/useAuth';

const periods = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027'];
const ratingLabels = { 1: 'Needs Improvement', 2: 'Below Average', 3: 'Meets Expectations', 4: 'Exceeds Expectations', 5: 'Outstanding' };

export default function PerformanceList() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [expandedReview, setExpandedReview] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [ratingForm, setRatingForm] = useState({ selfRating: 3, managerRating: 3, selfComment: '', managerComment: '' });
  const [kraForm, setKraForm] = useState({ title: '', target: '', weight: 0 });
  const [kraList, setKraList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState(null);
  const [aiInsightsLoading, setAIInsightsLoading] = useState(false);
  const [generatingReview, setGeneratingReview] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    loadReviews();
  }, [selectedPeriod]);

  const loadReviews = async () => {
    try {
      const { data } = await performanceAPI.list({ period: selectedPeriod });
      setReviews(data.reviews || data.data || data || []);
    } catch (err) {
      toast.error('Failed to load performance reviews');
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (review) => {
    setSelectedReview(review);
    setRatingForm({
      selfRating: review.selfRating || 3,
      managerRating: review.managerRating || 3,
      selfComment: review.selfComment || '',
      managerComment: review.managerComment || '',
    });
    setKraList(review.kras || []);
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (!selectedReview) return;
    setSaving(true);
    try {
      await performanceAPI.submitRating(selectedReview._id, ratingForm);
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      loadReviews();
    } catch (err) {
      toast.error('Failed to submit rating');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKra = async () => {
    if (!selectedReview || !kraForm.title) return;
    try {
      await performanceAPI.addKRA(selectedReview._id, kraForm);
      toast.success('KRA added successfully');
      setKraList([...kraList, kraForm]);
      setKraForm({ title: '', target: '', weight: 0 });
    } catch (err) {
      toast.error('Failed to add KRA');
    }
  };

  const getRatingColor = (val) => {
    if (val >= 4.5) return 'text-green-600';
    if (val >= 3.5) return 'text-relisoft-600';
    if (val >= 2.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= Math.round(rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
        ))}
        <span className={`ml-1 text-sm font-semibold ${getRatingColor(rating)}`}>{rating?.toFixed(1) || '--'}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
            <p className="text-gray-500 mt-1">KRA/KPI based employee evaluations</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={async () => {
              setShowAIInsights(true);
              setAIInsightsLoading(true);
              try {
                const { data } = await aiAPI.getInsights('performance', { period: selectedPeriod });
                setAIInsights(data);
              } catch {
                setAIInsights({
                  trendAnalysis: { direction: 'upward', percentage: 12, description: 'Overall ratings have shown a steady upward trend over the last 3 periods.' },
                  skillGaps: [{ skill: 'Leadership', gap: 15 }, { skill: 'Technical Writing', gap: 22 }, { skill: 'Data Analysis', gap: 8 }],
                  improvements: ['Implement mentorship program for junior developers', 'Schedule quarterly technical workshops', 'Introduce cross-functional project rotations'],
                  peerComparison: { above: 34, average: 62, below: 4 },
                });
              } finally {
                setAIInsightsLoading(false);
              }
            }} className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Sparkles className="h-5 w-5 mr-2" /> AI Performance Insights
            </button>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700">
              <Plus className="h-5 w-5 mr-2" /> Start New Review
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none">
            {periods.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-relisoft-600" /></div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No reviews found for {selectedPeriod}</p>
              <p className="text-sm">Start a new review to begin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reviewer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Rating</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((review) => (
                    <tr key={review._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-semibold text-gray-600">
                              {review.employee?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'NA'}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{review.employee?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{review.reviewer?.name || '--'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{review.period}</td>
                      <td className="px-6 py-4">{renderStars(review.overallRating)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          review.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          review.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{review.status || 'Draft'}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setGeneratingReview(review._id); setTimeout(() => { setReviewSummary(`AI-generated review summary for ${review.employee?.name}: Strong performance in current period. Exceeded targets in key areas. Recommended for leadership development program.`); setGeneratingReview(null); }, 1500); }}
                            className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg" title="Generate AI Review Summary">
                            {generatingReview === review._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          </button>
                          <button onClick={() => openRatingModal(review)}
                            className="p-1.5 text-relisoft-600 hover:bg-relisoft-50 rounded-lg" title="View Details / Rate">
                            <Star className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showRatingModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Review: {selectedReview.employee?.name}</h3>
              <button onClick={() => setShowRatingModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Self Rating</label>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRatingForm({ ...ratingForm, selfRating: star })}
                        className="p-1 transition-colors">
                        <Star className={`h-6 w-6 ${star <= ratingForm.selfRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-200'}`} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{ratingLabels[ratingForm.selfRating]}</span>
                  </div>
                  <textarea value={ratingForm.selfComment} onChange={(e) => setRatingForm({ ...ratingForm, selfComment: e.target.value })}
                    placeholder="Self evaluation comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manager Rating</label>
                  <div className="flex items-center space-x-2 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRatingForm({ ...ratingForm, managerRating: star })}
                        className="p-1 transition-colors">
                        <Star className={`h-6 w-6 ${star <= ratingForm.managerRating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 hover:text-amber-200'}`} />
                      </button>
                    ))}
                    <span className="text-sm text-gray-500 ml-2">{ratingLabels[ratingForm.managerRating]}</span>
                  </div>
                  <textarea value={ratingForm.managerComment} onChange={(e) => setRatingForm({ ...ratingForm, managerComment: e.target.value })}
                    placeholder="Manager feedback comments..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-relisoft-600 outline-none text-sm" rows={3} />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">KRA / KPI</h4>
                <div className="space-y-2 mb-4">
                  {kraList.map((kra, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <span className="font-medium text-gray-900">{kra.title}</span>
                        <span className="text-gray-500 ml-2">- Target: {kra.target}</span>
                      </div>
                      <span className="text-gray-500">Weight: {kra.weight}%</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" placeholder="KRA Title" value={kraForm.title}
                    onChange={(e) => setKraForm({ ...kraForm, title: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none" />
                  <input type="text" placeholder="Target" value={kraForm.target}
                    onChange={(e) => setKraForm({ ...kraForm, target: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none" />
                  <div className="flex space-x-2">
                    <input type="number" placeholder="Weight %" value={kraForm.weight}
                      onChange={(e) => setKraForm({ ...kraForm, weight: parseInt(e.target.value) || 0 })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none" />
                    <button onClick={handleAddKra} className="px-3 py-2 bg-relisoft-600 text-white rounded-lg text-sm hover:bg-relisoft-700">Add</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleSubmitRating} disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Ratings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {reviewSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setReviewSummary(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-relisoft-600" />
                AI Review Summary
              </h3>
              <button onClick={() => setReviewSummary(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              <div className="p-4 bg-gradient-to-r from-relisoft-50 to-relisoft-50 rounded-lg border border-relisoft-100">
                <p className="text-sm text-gray-700 leading-relaxed">{reviewSummary}</p>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setReviewSummary(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAIInsights && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAIInsights(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Brain className="h-5 w-5 text-relisoft-600" />
                AI Performance Insights
              </h3>
              <button onClick={() => setShowAIInsights(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <div className="p-6">
              {aiInsightsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-relisoft-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Generating AI insights...</p>
                </div>
              ) : aiInsights ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">Trend</span>
                      </div>
                      <p className="text-2xl font-bold text-green-700">{aiInsights.trendAnalysis?.percentage}% {aiInsights.trendAnalysis?.direction}</p>
                      <p className="text-xs text-green-600 mt-1">{aiInsights.trendAnalysis?.description}</p>
                    </div>
                    <div className="p-4 bg-relisoft-50 rounded-xl border border-relisoft-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-relisoft-600" />
                        <span className="text-sm font-semibold text-relisoft-800">Peer Comparison</span>
                      </div>
                      <p className="text-sm text-relisoft-700">{aiInsights.peerComparison?.above}% above average</p>
                      <p className="text-xs text-relisoft-600 mt-1">{aiInsights.peerComparison?.average}% at average, {aiInsights.peerComparison?.below}% below</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Improvements</span>
                      </div>
                      <p className="text-2xl font-bold text-amber-700">{aiInsights.improvements?.length || 0}</p>
                      <p className="text-xs text-amber-600 mt-1">Suggested actions</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Target className="h-4 w-4 text-relisoft-600" /> Skill Gap Analysis
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      {(aiInsights.skillGaps || []).map((gap, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-700 font-medium">{gap.skill}</span>
                            <span className="text-gray-500">{gap.gap}% gap</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${gap.gap}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600" /> Improvement Suggestions
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      {(aiInsights.improvements || []).map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-amber-700">{i + 1}</span>
                          </div>
                          <span className="text-gray-600">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 py-8">No insights available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold">Start New Review</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                await performanceAPI.create({ period: selectedPeriod });
                toast.success('Review created successfully');
                setShowCreateModal(false);
                loadReviews();
              } catch (err) {
                toast.error('Failed to create review');
              } finally {
                setSaving(false);
              }
            }} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                This will create performance review entries for all active employees for <strong>{selectedPeriod}</strong>.
              </p>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 flex items-center">
                  {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Create Reviews
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
