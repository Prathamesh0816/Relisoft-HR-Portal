import aiService from '../services/aiService.js';

const MODULE = 'auth';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an authentication security AI. Analyze login patterns, access anomalies, and security threats. Return JSON with: summary, failedLoginAttempts, unusualAccessPatterns, compromisedAccounts (suspected), and securityRecommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function detectAnomalousLogin(loginAttempt, userHistory) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a login anomaly detection AI. Analyze login attempts for suspicious behavior. Return JSON with: isAnomalous (boolean), riskLevel, factors (array of {factor, weight}), action (allow/challenge/block), and reason.' },
    { role: 'user', content: JSON.stringify({ loginAttempt, userHistory }) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, detectAnomalousLogin, handleChatQuery };
