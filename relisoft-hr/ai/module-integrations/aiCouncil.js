import aiService from '../services/aiService.js';

const MODULE = 'aiCouncil';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are the AI Council intelligence engine. Analyze AI system performance, usage patterns, and improvement opportunities. Return JSON with: summary, systemHealth, usageMetrics, modelPerformance, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function moderateDecision(decisionData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an AI governance moderator. Review an AI-proposed decision for fairness, bias, compliance, and accuracy. Return JSON with: approved (boolean), riskLevel (low/medium/high), biasCheck, complianceCheck, override (object or null), and rationale.' },
    { role: 'user', content: JSON.stringify(decisionData) },
  ], { temperature: 0.1 });
}

export async function auditLogAnalysis(logs) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an AI audit analyst. Analyze AI system audit logs for anomalies, policy violations, and optimization opportunities. Return JSON with: summary, anomalies (array), policyCompliance (percentage), recommendations.' },
    { role: 'user', content: JSON.stringify(logs) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, moderateDecision, auditLogAnalysis, handleChatQuery };
