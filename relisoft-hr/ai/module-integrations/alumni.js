import aiService from '../services/aiService.js';

const MODULE = 'alumni';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an alumni management AI. Analyze alumni engagement, network value, and rehiring potential. Return JSON with: summary, engagementMetrics, boomerangPotential (array of likely return candidates), networkValue, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function identifyBoomerangCandidates(alumniData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a rehiring potential AI. Identify alumni with high potential to return based on their departure reason, career growth, and current market. Return JSON with: candidates (array of {alumni, score, reason, suggestedRole}), and outreachStrategy.' },
    { role: 'user', content: JSON.stringify(alumniData) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, identifyBoomerangCandidates, handleChatQuery };
