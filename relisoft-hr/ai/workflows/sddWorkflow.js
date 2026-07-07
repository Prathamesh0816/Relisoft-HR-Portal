import SpecEngine from '../agents/specEngine.js';
import CodeGenAgent from '../agents/codeGenAgent.js';
import ReviewBot from '../agents/reviewBot.js';
import HumanReviewQueue from './humanReviewQueue.js';

const WORKFLOW_STATES = {
  REQUEST_RECEIVED: 'request_received',
  SPEC_DRAFTED: 'spec_drafted',
  PENDING_SPEC_REVIEW: 'pending_spec_review',
  SPEC_APPROVED: 'spec_approved',
  SPEC_REJECTED: 'spec_rejected',
  CODE_GENERATION: 'code_generation',
  CODE_GENERATED: 'code_generated',
  AI_REVIEW_COMPLETE: 'ai_review_complete',
  PENDING_HUMAN_REVIEW: 'pending_human_review',
  CHANGES_REQUESTED: 'changes_requested',
  APPROVED: 'approved',
  MERGED: 'merged',
  DEPLOYED: 'deployed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

class SDDWorkflow {
  constructor() {
    this.specEngine = new SpecEngine();
    this.codeGen = new CodeGenAgent();
    this.reviewBot = new ReviewBot();
    this.reviewQueue = new HumanReviewQueue();
    this.workflows = new Map();
  }

  async processFeatureRequest(request) {
    const workflowId = this._generateId('WF');
    const workflow = {
      id: workflowId,
      type: 'feature_request',
      request,
      state: WORKFLOW_STATES.REQUEST_RECEIVED,
      specId: null,
      codeReviewId: null,
      buildId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      history: [{ state: WORKFLOW_STATES.REQUEST_RECEIVED, timestamp: new Date(), actor: 'system' }],
      metadata: {}
    };

    try {
      workflow.state = WORKFLOW_STATES.SPEC_DRAFTED;
      const specTemplate = await this.specEngine.generateTemplate(request.type || 'api');

      const spec = {
        ...specTemplate,
        title: request.title || 'Untitled Feature',
        description: request.description || '',
        author: request.author || 'unknown',
        requestId: request.id
      };

      workflow.spec = spec;
      workflow.state = WORKFLOW_STATES.PENDING_SPEC_REVIEW;
      workflow.history.push({ state: WORKFLOW_STATES.PENDING_SPEC_REVIEW, timestamp: new Date(), actor: 'system' });

      const reviewQueueItem = await this.reviewQueue.enqueue({
        type: 'spec_review',
        workflowId,
        spec,
        priority: request.priority || 'medium',
        createdBy: request.author || 'system',
        sla: this._calculateSLA(request.priority)
      });

      workflow.specReviewId = reviewQueueItem.id;
      this.workflows.set(workflowId, workflow);

      return {
        workflowId,
        specId: workflow.specId,
        state: workflow.state,
        spec,
        reviewQueueItemId: reviewQueueItem.id
      };
    } catch (error) {
      workflow.state = WORKFLOW_STATES.FAILED;
      workflow.error = error.message;
      this.workflows.set(workflowId, workflow);
      throw error;
    }
  }

  async approveSpec(workflowId, reviewResult) {
    const workflow = this._getWorkflow(workflowId);
    workflow.state = WORKFLOW_STATES.SPEC_APPROVED;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.SPEC_APPROVED, timestamp: new Date(), actor: reviewResult.reviewer || 'human' });

    await this.reviewQueue.updateStatus(workflow.specReviewId, 'approved', reviewResult);
    this.workflows.set(workflowId, workflow);

    return workflow;
  }

  async rejectSpec(workflowId, reviewResult) {
    const workflow = this._getWorkflow(workflowId);
    workflow.state = WORKFLOW_STATES.SPEC_REJECTED;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.SPEC_REJECTED, timestamp: new Date(), actor: reviewResult.reviewer || 'human' });
    workflow.feedback = reviewResult.comments || [];

    await this.reviewQueue.updateStatus(workflow.specReviewId, 'rejected', reviewResult);
    this.workflows.set(workflowId, workflow);

    return workflow;
  }

  async generateFromApprovedSpec(workflowId, outputPath) {
    const workflow = this._getWorkflow(workflowId);

    if (workflow.state !== WORKFLOW_STATES.SPEC_APPROVED) {
      throw new Error(`Workflow ${workflowId} is in state ${workflow.state}, expected ${WORKFLOW_STATES.SPEC_APPROVED}`);
    }

    workflow.state = WORKFLOW_STATES.CODE_GENERATION;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.CODE_GENERATION, timestamp: new Date(), actor: 'system' });

    try {
      this.codeGen = new CodeGenAgent('', outputPath);
      const generationResult = await this.codeGen.generateFromSpec(workflow.spec || '');

      workflow.state = WORKFLOW_STATES.CODE_GENERATED;
      workflow.generatedFiles = generationResult;
      workflow.updatedAt = new Date();
      workflow.history.push({ state: WORKFLOW_STATES.CODE_GENERATED, timestamp: new Date(), actor: 'system' });

      const selfReview = await this.codeGen.reviewBot || this.reviewBot;
      const aiReview = await selfReview.reviewCode(
        JSON.stringify(generationResult),
        JSON.stringify(workflow.spec)
      );

      workflow.aiReview = aiReview;
      workflow.state = WORKFLOW_STATES.AI_REVIEW_COMPLETE;
      workflow.updatedAt = new Date();
      workflow.history.push({ state: WORKFLOW_STATES.AI_REVIEW_COMPLETE, timestamp: new Date(), actor: 'ai' });

      const reviewItem = await this.reviewQueue.enqueue({
        type: 'code_review',
        workflowId,
        generatedFiles: generationResult,
        aiReview,
        priority: 'medium',
        createdBy: 'system',
        sla: this._calculateSLA('medium')
      });

      workflow.codeReviewId = reviewItem.id;
      workflow.state = WORKFLOW_STATES.PENDING_HUMAN_REVIEW;
      workflow.history.push({ state: WORKFLOW_STATES.PENDING_HUMAN_REVIEW, timestamp: new Date(), actor: 'system' });

      this.workflows.set(workflowId, workflow);

      return {
        workflowId,
        state: workflow.state,
        generatedFiles: generationResult,
        aiReview,
        reviewQueueItemId: reviewItem.id
      };
    } catch (error) {
      workflow.state = WORKFLOW_STATES.FAILED;
      workflow.error = error.message;
      workflow.updatedAt = new Date();
      workflow.history.push({ state: WORKFLOW_STATES.FAILED, timestamp: new Date(), actor: 'system', error: error.message });
      this.workflows.set(workflowId, workflow);
      throw error;
    }
  }

  async reviewAndApprove(codeReviewId, reviewResult) {
    const reviewItem = this.reviewQueue.getReview(codeReviewId);
    if (!reviewItem) throw new Error(`Review item ${codeReviewId} not found`);

    const workflow = this._getWorkflow(reviewItem.data.workflowId);

    if (reviewResult.approved) {
      workflow.state = WORKFLOW_STATES.APPROVED;
      workflow.history.push({ state: WORKFLOW_STATES.APPROVED, timestamp: new Date(), actor: reviewResult.reviewer || 'human' });
      await this.reviewQueue.updateStatus(codeReviewId, 'approved', reviewResult);
    } else {
      workflow.state = WORKFLOW_STATES.CHANGES_REQUESTED;
      workflow.feedback = reviewResult.comments || [];
      workflow.history.push({ state: WORKFLOW_STATES.CHANGES_REQUESTED, timestamp: new Date(), actor: reviewResult.reviewer || 'human', feedback: workflow.feedback });
      await this.reviewQueue.updateStatus(codeReviewId, 'changes_requested', reviewResult);
    }

    workflow.updatedAt = new Date();
    this.workflows.set(workflow.id, workflow);

    return workflow;
  }

  async mergeChanges(workflowId, mergeInfo) {
    const workflow = this._getWorkflow(workflowId);

    if (workflow.state !== WORKFLOW_STATES.APPROVED) {
      throw new Error(`Workflow ${workflowId} is not in approved state`);
    }

    workflow.state = WORKFLOW_STATES.MERGED;
    workflow.mergeInfo = mergeInfo;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.MERGED, timestamp: new Date(), actor: mergeInfo.mergedBy || 'system' });

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  async deployChanges(buildId, deployInfo) {
    const workflow = Array.from(this.workflows.values())
      .find(w => w.buildId === buildId || w.mergeInfo?.buildId === buildId);

    if (!workflow) throw new Error(`Build ${buildId} not found`);

    workflow.state = WORKFLOW_STATES.DEPLOYED;
    workflow.deployInfo = deployInfo;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.DEPLOYED, timestamp: new Date(), actor: deployInfo.deployedBy || 'system' });

    this.workflows.set(workflow.id, workflow);
    return workflow;
  }

  async requestChanges(workflowId, feedback) {
    const workflow = this._getWorkflow(workflowId);

    workflow.state = WORKFLOW_STATES.CHANGES_REQUESTED;
    workflow.feedback = [...(workflow.feedback || []), ...(Array.isArray(feedback) ? feedback : [feedback])];
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.CHANGES_REQUESTED, timestamp: new Date(), actor: 'human', feedback });

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  async cancelWorkflow(workflowId, reason) {
    const workflow = this._getWorkflow(workflowId);
    workflow.state = WORKFLOW_STATES.CANCELLED;
    workflow.cancellationReason = reason;
    workflow.updatedAt = new Date();
    workflow.history.push({ state: WORKFLOW_STATES.CANCELLED, timestamp: new Date(), actor: 'system', reason });

    if (workflow.specReviewId) {
      await this.reviewQueue.cancelReview(workflow.specReviewId);
    }
    if (workflow.codeReviewId) {
      await this.reviewQueue.cancelReview(workflow.codeReviewId);
    }

    this.workflows.set(workflowId, workflow);
    return workflow;
  }

  getStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    return {
      id: workflow.id,
      state: workflow.state,
      type: workflow.type,
      title: workflow.request?.title,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      lastAction: workflow.history[workflow.history.length - 1],
      history: workflow.history,
      isComplete: [WORKFLOW_STATES.DEPLOYED, WORKFLOW_STATES.CANCELLED, WORKFLOW_STATES.FAILED].includes(workflow.state),
      reviewQueueStatus: workflow.codeReviewId ? this.reviewQueue.getStatus(workflow.codeReviewId) : null
    };
  }

  getWorkflowTimeline(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);

    return workflow.history.map(entry => ({
      state: entry.state,
      timestamp: entry.timestamp,
      actor: entry.actor,
      duration: entry.timestamp - (workflow.createdAt || entry.timestamp)
    }));
  }

  _getWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow ${workflowId} not found`);
    return workflow;
  }

  _generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  _calculateSLA(priority) {
    const slaMap = {
      critical: { review: 2, response: 1 },
      high: { review: 4, response: 2 },
      medium: { review: 24, response: 8 },
      low: { review: 48, response: 24 }
    };
    return slaMap[priority] || slaMap.medium;
  }
}

export default SDDWorkflow;
export { WORKFLOW_STATES };
