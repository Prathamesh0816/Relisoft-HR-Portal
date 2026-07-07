import aiService from '../services/aiService.js';

const MODULE = 'dashboard';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a dashboard intelligence AI. Analyze dashboard usage patterns, key metrics, and personalize views. Return JSON with: summary, mostViewedWidgets, criticalMetrics, userPreferences, and personalizationSuggestions.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestWidgets(role, userActivity) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a dashboard personalization AI. Suggest relevant dashboard widgets based on user role, activity patterns, and common workflows. Return JSON with: suggestedWidgets (array of {type, priority, reason, layout}), and layoutOptimization.' },
    { role: 'user', content: JSON.stringify({ role, userActivity }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestWidgets, handleChatQuery };
