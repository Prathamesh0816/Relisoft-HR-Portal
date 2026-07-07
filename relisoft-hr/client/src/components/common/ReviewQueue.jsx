import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Edit3, FileText, Code, Loader2, AlertCircle, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { aiAPI } from '../../services/aiApi';
import useAIStore from '../../store/aiStore';
import toast from 'react-hot-toast';

const typeIcons = {
  spec: FileText,
  code: Code,
};
const typeColors = {
  spec: 'bg-relisoft-100 text-relisoft-800',
  code: 'bg-relisoft-100 text-relisoft-800',
};

export default function ReviewQueue() {
  const { pendingReviews, setPendingReviews, removeReview } = useAIStore();
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewComments, setReviewComments] = useState('');
  const [processing, setProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data } = await aiAPI.getPendingReviews();
      const reviews = data.reviews || data.data || data || [];
      setPendingReviews(reviews);
    } catch {
      toast.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessReview = async () => {
    if (!selectedReview || !reviewAction) return;
    setProcessing(true);
    try {
      await aiAPI.processReview(selectedReview._id, reviewAction, reviewComments);
      toast.success(`Review ${reviewAction}d successfully`);
      removeReview(selectedReview._id);
      setSelectedReview(null);
      setReviewAction('');
      setReviewComments('');
    } catch {
      toast.error('Failed to process review');
    } finally {
      setProcessing(false);
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (score) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-amber-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-relisoft-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pending Reviews</h3>
          <p className="text-sm text-gray-500">{pendingReviews.length} items awaiting human review</p>
        </div>
        <button onClick={loadReviews} className="text-sm text-relisoft-600 hover:underline">
          Refresh
        </button>
      </div>

      {pendingReviews.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-400" />
          <p className="text-sm font-medium text-gray-600">All caught up!</p>
          <p className="text-xs mt-1">No pending reviews at this time.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingReviews.map((review) => {
            const Icon = typeIcons[review.type] || FileText;
            const isExpanded = expandedId === review._id;
            return (
              <div key={review._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeColors[review.type] || 'bg-gray-100 text-gray-800'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900 capitalize">{review.type}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getConfidenceBg(review.confidence)} ${getConfidenceColor(review.confidence)}`}>
                            {review.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{review.description}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(review.createdAt || review.timestamp).toLocaleString()}
                          </span>
                          {review.version && (
                            <span className="flex items-center gap-1">v{review.version}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : review._id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {isExpanded && review.generatedCode && (
                    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Spec / Description</h4>
                        <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {review.description}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Generated Code</h4>
                        <div className="bg-gray-900 rounded-lg p-3 text-xs text-green-400 font-mono max-h-48 overflow-y-auto whitespace-pre-wrap">
                          {review.generatedCode}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
                  <button
                    onClick={() => setSelectedReview(review)}
                    className="w-full px-3 py-1.5 bg-relisoft-600 text-white text-sm rounded-lg hover:bg-relisoft-700 transition-colors"
                  >
                    Review Item
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-semibold capitalize">Review {selectedReview.type}</h3>
              <button onClick={() => setSelectedReview(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <XCircle className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Specification / Description</h4>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 font-mono max-h-64 overflow-y-auto whitespace-pre-wrap border border-gray-200">
                    {selectedReview.description}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Generated Code</h4>
                  <div className="bg-gray-900 rounded-lg p-4 text-sm text-green-400 font-mono max-h-64 overflow-y-auto whitespace-pre-wrap border border-gray-700">
                    {selectedReview.generatedCode || 'No code generated yet'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className={`h-5 w-5 ${getConfidenceColor(selectedReview.confidence)}`} />
                  <span className="text-sm font-medium text-gray-700">AI Confidence:</span>
                  <span className={`text-sm font-bold ${getConfidenceColor(selectedReview.confidence)}`}>
                    {selectedReview.confidence}%
                  </span>
                </div>
                {selectedReview.version && (
                  <span className="text-sm text-gray-500">Version: {selectedReview.version}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Review Decision</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setReviewAction('approved')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      reviewAction === 'approved' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => setReviewAction('rejected')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      reviewAction === 'rejected' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <button
                    onClick={() => setReviewAction('changes')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                      reviewAction === 'changes' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Edit3 className="h-5 w-5" />
                    Request Changes
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments / Feedback</label>
                <textarea
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  placeholder="Provide feedback for the AI..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-relisoft-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setSelectedReview(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleProcessReview}
                  disabled={!reviewAction || processing}
                  className="px-4 py-2 bg-relisoft-600 text-white rounded-lg hover:bg-relisoft-700 disabled:opacity-50 text-sm flex items-center gap-2"
                >
                  {processing && <Loader2 className="h-4 w-4 animate-spin" />}
                  <MessageSquare className="h-4 w-4" />
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
