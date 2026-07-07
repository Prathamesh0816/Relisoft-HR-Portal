import aiService from '../services/aiService.js';

const MODULE = 'visitorManagement';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a visitor management AI. Analyze visitor patterns, security compliance, and operational efficiency. Return JSON with: summary, visitorVolume, averageVisitDuration, securityIncidents, peakHours, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function assessSecurityRisk(visitorProfile) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a visitor risk assessment AI. Evaluate visitor security risk based on purpose, background, and access requirements. Return JSON with: riskLevel (low/medium/high), factors (array of {factor, impact}), requiredEscorts, additionalChecks, and authorizationRequired.' },
    { role: 'user', content: JSON.stringify(visitorProfile) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, assessSecurityRisk, handleChatQuery };
