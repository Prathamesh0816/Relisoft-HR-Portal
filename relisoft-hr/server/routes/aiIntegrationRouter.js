import express from 'express';
import { executeModuleAI, getModuleNames } from '../../ai/module-integrations/index.js';

const MODULE_ROUTE_MAP = {
  attendance: '/api/attendance',
  leave: '/api/leaves',
  payroll: '/api/payroll',
  employee: '/api/employees',
  recruitment: '/api/recruitment',
  performance: '/api/performance',
  training: '/api/training',
  helpdesk: '/api/tickets',
  compliance: '/api/compliance',
  document: '/api/documents',
  asset: '/api/assets',
  analytics: '/api/analytics',
  onboarding: '/api/onboarding',
  separation: '/api/separation',
  engagement: '/api/surveys',
  fnf: '/api/fnf',
  integration: '/api/integrations',
  aiCouncil: '/api/ai-council',
  visa: '/api/visa',
};

const ACTION_ALIASES = {
  chat: 'handleChatQuery',
  query: 'handleChatQuery',
  analyze: 'analyze',
  insights: 'analyze',
  predict: 'predict',
  recommend: 'recommend',
  generate: 'generate',
};

function autoWireAIMiddleware(moduleName, basePath) {
  return async (req, res, next) => {
    const aiAction = req.query.ai;
    if (!aiAction) return next();

    try {
      const action = ACTION_ALIASES[aiAction] || aiAction;
      const payload = { ...req.body, ...req.params, ...req.query };
      delete payload.ai;

      const result = await executeModuleAI(moduleName, action, payload, {
        user: req.user,
        method: req.method,
        path: req.path,
      });

      return res.json({ success: true, ai: true, module: moduleName, action, data: result });
    } catch (error) {
      return res.status(400).json({ success: false, ai: true, module: moduleName, error: error.message });
    }
  };
}

function createAIIntegrationRouter() {
  const router = express.Router();

  router.get('/modules', (req, res) => {
    const integrations = {};
    for (const [key, path] of Object.entries(MODULE_ROUTE_MAP)) {
      integrations[key] = { path, actions: ['analyze', 'handleChatQuery'] };
    }
    res.json({ success: true, modules: getModuleNames(), routeMap: integrations });
  });

  router.post('/:moduleName/:action', async (req, res, next) => {
    try {
      const { moduleName, action } = req.params;
      const result = await executeModuleAI(moduleName, action, req.body, {
        user: req.user,
        params: req.query,
      });
      res.json({ success: true, module: moduleName, action, data: result });
    } catch (error) {
      next(error);
    }
  });

  router.all('/:moduleName', async (req, res, next) => {
    try {
      const { moduleName } = req.params;
      const payload = { ...req.body, method: req.method, query: req.query };
      const result = await executeModuleAI(moduleName, 'handleChatQuery', payload, {
        user: req.user,
      });
      res.json({ success: true, module: moduleName, data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export { autoWireAIMiddleware, createAIIntegrationRouter, MODULE_ROUTE_MAP };
export default createAIIntegrationRouter;
