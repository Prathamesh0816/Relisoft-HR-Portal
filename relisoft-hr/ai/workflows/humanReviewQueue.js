const REVIEW_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'changes_requested',
  CANCELLED: 'cancelled',
  ESCALATED: 'escalated',
  SLA_BREACHED: 'sla_breached'
};

class HumanReviewQueue {
  constructor() {
    this.reviews = new Map();
    this.reviewers = new Map();
    this.auditLog = [];
  }

  async enqueue(data) {
    const review = {
      id: this._generateId('REV'),
      type: data.type || 'general',
      workflowId: data.workflowId,
      data: data,
      status: REVIEW_STATUS.PENDING,
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || null,
      createdBy: data.createdBy || 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
      startedAt: null,
      completedAt: null,
      sla: data.sla || { review: 24, response: 8 },
      slaBreachedAt: null,
      result: null,
      comments: [],
      tags: data.tags || []
    };

    if (!data.assignedTo) {
      review.assignedTo = await this._autoAssignReviewer(review);
    }

    this.reviews.set(review.id, review);
    this._log(review.id, 'enqueued', 'system');
    this._startSLATimer(review);

    return review;
  }

  async assignReviewer(reviewId, reviewerId) {
    const review = this._getReview(reviewId);
    review.assignedTo = reviewerId;
    review.updatedAt = new Date();
    this._log(reviewId, 'assigned', reviewerId);
    this.reviews.set(reviewId, review);
    return review;
  }

  async startReview(reviewId, reviewerId) {
    const review = this._getReview(reviewId);
    review.status = REVIEW_STATUS.IN_REVIEW;
    review.assignedTo = reviewerId;
    review.startedAt = new Date();
    review.updatedAt = new Date();
    this._log(reviewId, 'started', reviewerId);
    this.reviews.set(reviewId, review);
    return review;
  }

  async approveReview(reviewId, reviewerId, result) {
    const review = this._getReview(reviewId);
    review.status = REVIEW_STATUS.APPROVED;
    review.completedAt = new Date();
    review.updatedAt = new Date();
    review.result = { approved: true, ...result };
    review.comments = result.comments || [];
    this._log(reviewId, 'approved', reviewerId);
    this.reviews.set(reviewId, review);
    return review;
  }

  async rejectReview(reviewId, reviewerId, result) {
    const review = this._getReview(reviewId);
    review.status = REVIEW_STATUS.REJECTED;
    review.completedAt = new Date();
    review.updatedAt = new Date();
    review.result = { approved: false, ...result };
    review.comments = result.comments || [];
    this._log(reviewId, 'rejected', reviewerId);
    this.reviews.set(reviewId, review);
    return review;
  }

  async updateStatus(reviewId, status, result) {
    const review = this._getReview(reviewId);
    review.status = status;
    review.updatedAt = new Date();
    if (result) {
      review.result = result;
      review.comments = result.comments || review.comments;
    }
    if ([REVIEW_STATUS.APPROVED, REVIEW_STATUS.REJECTED, REVIEW_STATUS.CANCELLED].includes(status)) {
      review.completedAt = new Date();
    }
    this._log(reviewId, `status_${status}`, result?.reviewer || 'system');
    this.reviews.set(reviewId, review);
    return review;
  }

  async cancelReview(reviewId, reason) {
    const review = this._getReview(reviewId);
    review.status = REVIEW_STATUS.CANCELLED;
    review.completedAt = new Date();
    review.updatedAt = new Date();
    review.cancellationReason = reason;
    this._log(reviewId, 'cancelled', 'system', reason);
    this.reviews.set(reviewId, review);
    return review;
  }

  async escalateReview(reviewId, reason) {
    const review = this._getReview(reviewId);
    review.status = REVIEW_STATUS.ESCALATED;
    review.escalationReason = reason;
    review.updatedAt = new Date();
    this._log(reviewId, 'escalated', 'system', reason);
    this.reviews.set(reviewId, review);

    const manager = await this._findManagerReviewer(review);
    if (manager) {
      review.assignedTo = manager;
      this.reviews.set(reviewId, review);
    }

    return review;
  }

  getReview(reviewId) {
    return this.reviews.get(reviewId) || null;
  }

  getStatus(reviewId) {
    const review = this.reviews.get(reviewId);
    return review ? { id: review.id, status: review.status, assignedTo: review.assignedTo, slaRemaining: this._getSLARemaining(review) } : null;
  }

  getPendingReviews(options = {}) {
    const reviews = Array.from(this.reviews.values());
    return reviews.filter(r => {
      if (r.status !== REVIEW_STATUS.PENDING) return false;
      if (options.type && r.type !== options.type) return false;
      if (options.priority && r.priority !== options.priority) return false;
      if (options.assignedTo && r.assignedTo !== options.assignedTo) return false;
      return true;
    }).sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  getReviewHistory(workflowId) {
    return Array.from(this.reviews.values())
      .filter(r => r.workflowId === workflowId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getAuditTrail(reviewId) {
    return this.auditLog.filter(entry => entry.reviewId === reviewId);
  }

  async registerReviewer(reviewerInfo) {
    const reviewer = {
      id: reviewerInfo.id || this._generateId('RVR'),
      name: reviewerInfo.name,
      email: reviewerInfo.email,
      role: reviewerInfo.role,
      skills: reviewerInfo.skills || [],
      currentLoad: 0,
      maxLoad: reviewerInfo.maxLoad || 10,
      isAvailable: true,
      registeredAt: new Date()
    };

    this.reviewers.set(reviewer.id, reviewer);
    return reviewer;
  }

  async _autoAssignReviewer(review) {
    const availableReviewers = Array.from(this.reviewers.values())
      .filter(r => r.isAvailable && r.currentLoad < r.maxLoad);

    if (availableReviewers.length === 0) return null;

    const scored = availableReviewers.map(r => {
      let score = 1 - (r.currentLoad / r.maxLoad);
      if (review.type === 'code_review' && r.skills.includes('code_review')) score += 0.3;
      if (review.type === 'spec_review' && r.skills.includes('spec_review')) score += 0.3;
      return { reviewer: r, score };
    }).sort((a, b) => b.score - a.score);

    const assigned = scored[0].reviewer;
    assigned.currentLoad++;
    this.reviewers.set(assigned.id, assigned);
    return assigned.id;
  }

  async _findManagerReviewer(review) {
    return Array.from(this.reviewers.values())
      .filter(r => r.role === 'manager' && r.isAvailable)
      .sort((a, b) => a.currentLoad - b.currentLoad)[0]?.id || null;
  }

  _startSLATimer(review) {
    const slaMs = review.sla.review * 3600000;
    setTimeout(() => {
      const current = this.reviews.get(review.id);
      if (current && current.status === REVIEW_STATUS.PENDING) {
        current.status = REVIEW_STATUS.SLA_BREACHED;
        current.slaBreachedAt = new Date();
        current.updatedAt = new Date();
        this._log(review.id, 'sla_breached', 'system');
        this.reviews.set(review.id, current);
      }
    }, slaMs);
  }

  _getSLARemaining(review) {
    if (review.status !== REVIEW_STATUS.PENDING) return 0;
    const elapsed = Date.now() - review.createdAt.getTime();
    const totalSla = review.sla.review * 3600000;
    return Math.max(0, totalSla - elapsed);
  }

  _log(reviewId, action, actor, details) {
    this.auditLog.push({
      reviewId,
      action,
      actor,
      details,
      timestamp: new Date()
    });
  }

  _getReview(reviewId) {
    const review = this.reviews.get(reviewId);
    if (!review) throw new Error(`Review ${reviewId} not found`);
    return review;
  }

  _generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  getStats() {
    const all = Array.from(this.reviews.values());
    return {
      total: all.length,
      pending: all.filter(r => r.status === REVIEW_STATUS.PENDING).length,
      inReview: all.filter(r => r.status === REVIEW_STATUS.IN_REVIEW).length,
      approved: all.filter(r => r.status === REVIEW_STATUS.APPROVED).length,
      rejected: all.filter(r => r.status === REVIEW_STATUS.REJECTED).length,
      changesRequested: all.filter(r => r.status === REVIEW_STATUS.CHANGES_REQUESTED).length,
      escalated: all.filter(r => r.status === REVIEW_STATUS.ESCALATED).length,
      slaBreached: all.filter(r => r.status === REVIEW_STATUS.SLA_BREACHED).length,
      cancelled: all.filter(r => r.status === REVIEW_STATUS.CANCELLED).length,
      averageReviewTime: this._calculateAverageReviewTime(all),
      reviewersAvailable: Array.from(this.reviewers.values()).filter(r => r.isAvailable).length
    };
  }

  _calculateAverageReviewTime(reviews) {
    const completed = reviews.filter(r => r.completedAt && r.startedAt);
    if (completed.length === 0) return 0;
    const totalTime = completed.reduce((sum, r) => sum + (r.completedAt - r.startedAt), 0);
    return totalTime / completed.length;
  }
}

export default HumanReviewQueue;
export { REVIEW_STATUS };
