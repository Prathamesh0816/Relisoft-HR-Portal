import aiService from '../services/aiService.js';

const MODULE = 'settings';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a system configuration AI. Analyze system settings, configuration drift, and optimization opportunities. Return JSON with: summary, configuredModules, nonDefaultSettings, securityConfigAssessment, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestConfiguration(moduleName, usagePatterns) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a configuration optimization AI. Suggest optimal system configuration based on usage patterns and organizational needs. Return JSON with: recommendedSettings (array of {key, value, rationale}), expectedImpact, and rollbackPlan.' },
    { role: 'user', content: JSON.stringify({ moduleName, usagePatterns }) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestConfiguration, handleChatQuery };
