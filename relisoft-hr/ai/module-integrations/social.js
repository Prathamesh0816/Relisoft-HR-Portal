import aiService from '../services/aiService.js';

const MODULE = 'social';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a social engagement AI. Analyze social feed activity, engagement patterns, and community health. Return JSON with: summary, activeUsers, popularContent, engagementTrends, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function moderateContent(content) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a content moderation AI. Review social content for policy violations, inappropriate material, and spam. Return JSON with: approved (boolean), violations (array of {type, severity, detail}), and action (allow/flag/remove).' },
    { role: 'user', content: JSON.stringify(content) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, moderateContent, handleChatQuery };
