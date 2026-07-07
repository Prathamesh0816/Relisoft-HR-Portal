import SDDWorkflow, { WORKFLOW_STATES } from '../../ai/workflows/sddWorkflow.js';
import HumanReviewQueue from '../../ai/workflows/humanReviewQueue.js';
import SpecEngine from '../../ai/agents/specEngine.js';
import CodeGenAgent from '../../ai/agents/codeGenAgent.js';
import ReviewBot from '../../ai/agents/reviewBot.js';
import { autoGenerateModule, generateModuleSpec, generateModuleCode, reviewModuleCode, generateModuleTests, getModuleNames, executeModuleAI } from '../../ai/module-integrations/index.js';

const workflow = new SDDWorkflow();
const reviewQueue = new HumanReviewQueue();
const specEngine = new SpecEngine();
const codeGen = new CodeGenAgent();
const reviewBot = new ReviewBot();

const wrap = (fn) => async (req, res, next) => {
  try {
    const result = await fn(req, res);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const startFeature = wrap(async (req) => {
  const { title, description, type, priority, author } = req.body;
  if (!title) throw new Error('Title is required');
  return workflow.processFeatureRequest({ title, description, type: type || 'api', priority, author: author || 'system' });
});

export const getWorkflowStatus = wrap(async (req) => {
  return workflow.getStatus(req.params.id);
});

export const getWorkflowTimeline = wrap(async (req) => {
  return { timeline: workflow.getWorkflowTimeline(req.params.id) };
});

export const listWorkflows = wrap(async () => {
  return { workflows: Array.from(workflow.workflows.values()).map(w => workflow.getStatus(w.id)) };
});

export const approveSpec = wrap(async (req) => {
  const { comments, reviewer } = req.body;
  return workflow.approveSpec(req.params.id, { comments: comments || [], reviewer });
});

export const rejectSpec = wrap(async (req) => {
  const { comments, reviewer } = req.body;
  return workflow.rejectSpec(req.params.id, { comments: comments || [], reviewer });
});

export const generateCode = wrap(async (req) => {
  const { outputPath } = req.body;
  return workflow.generateFromApprovedSpec(req.params.id, outputPath || './generated');
});

export const reviewAndApprove = wrap(async (req) => {
  const { approved, comments, reviewer } = req.body;
  return workflow.reviewAndApprove(req.params.codeReviewId, { approved, comments: comments || [], reviewer });
});

export const requestChanges = wrap(async (req) => {
  const { comments } = req.body;
  return workflow.requestChanges(req.params.id, comments || []);
});

export const cancelWorkflow = wrap(async (req) => {
  const { reason } = req.body;
  return workflow.cancelWorkflow(req.params.id, reason || 'Cancelled by user');
});

export const validateSpec = wrap(async (req) => {
  const { spec } = req.body;
  if (!spec) throw new Error('Spec content is required');
  return specEngine.validate(spec);
});

export const generateSpecTemplate = wrap(async (req) => {
  const { type } = req.query;
  return { template: await specEngine.generateTemplate(type || 'api') };
});

export const checkSpecCompleteness = wrap(async (req) => {
  const { spec } = req.body;
  if (!spec) throw new Error('Spec content is required');
  return specEngine.checkCompleteness(typeof spec === 'string' ? JSON.parse(spec) : spec);
});

export const suggestSpecImprovements = wrap(async (req) => {
  const { spec } = req.body;
  if (!spec) throw new Error('Spec content is required');
  return { suggestions: await specEngine.suggestImprovements(typeof spec === 'string' ? JSON.parse(spec) : spec) };
});

export const generateFromSpec = wrap(async (req) => {
  const { spec } = req.body;
  if (!spec) throw new Error('Spec is required');
  const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;
  const results = {};
  if (specObj.dataModel?.entities) results.models = await codeGen.generateModel(specObj);
  if (specObj.apiEndpoints) {
    results.controllers = await codeGen.generateController(specObj);
    results.routes = await codeGen.generateRoutes(specObj);
  }
  return { generatedFiles: results };
});

export const reviewCode = wrap(async (req) => {
  const { code, spec } = req.body;
  if (!code) throw new Error('Code content is required');
  const review = await reviewBot.reviewCode(code, spec || '', req.body.options || {});
  return { review };
});

export const getReviewQueueStats = wrap(async () => {
  return reviewQueue.getStats();
});

export const getPendingReviews = wrap(async (req) => {
  const { type, priority, assignedTo } = req.query;
  return { reviews: reviewQueue.getPendingReviews({ type, priority, assignedTo }) };
});

export const assignReviewer = wrap(async (req) => {
  const { reviewerId } = req.body;
  return reviewQueue.assignReviewer(req.params.reviewId, reviewerId);
});

export const listModules = wrap(async () => {
  return { modules: getModuleNames() };
});

export const executeModuleAIAction = wrap(async (req) => {
  const { moduleName, action, payload, context } = req.body;
  if (!moduleName || !action) throw new Error('moduleName and action are required');
  return executeModuleAI(moduleName, action, payload, context);
});

export const autoGenerateFullModule = wrap(async (req) => {
  const { moduleName, description } = req.body;
  if (!moduleName || !description) throw new Error('moduleName and description are required');
  return autoGenerateModule(moduleName, description);
});

export const generateModuleCodeFromSpec = wrap(async (req) => {
  const { moduleName, specContent, targets } = req.body;
  if (!moduleName || !specContent) throw new Error('moduleName and specContent are required');
  return { code: await generateModuleCode(specContent, moduleName, targets) };
});

export const reviewModuleCodeEndpoint = wrap(async (req) => {
  const { moduleName, code, spec } = req.body;
  if (!moduleName || !code) throw new Error('moduleName and code are required');
  return { review: await reviewModuleCode(moduleName, code, spec) };
});

export const generateModuleTestsEndpoint = wrap(async (req) => {
  const { moduleName, specContent } = req.body;
  if (!moduleName || !specContent) throw new Error('moduleName and specContent are required');
  return { tests: await generateModuleTests(specContent, moduleName) };
});

export const generateSpecFromDesc = wrap(async (req) => {
  const { moduleName, description } = req.body;
  if (!moduleName || !description) throw new Error('moduleName and description are required');
  return { spec: await generateModuleSpec(moduleName, description) };
});

export const registerReviewer = wrap(async (req) => {
  const { name, email, role, skills, maxLoad } = req.body;
  if (!name || !email) throw new Error('name and email are required');
  return reviewQueue.registerReviewer({ name, email, role, skills, maxLoad });
});
