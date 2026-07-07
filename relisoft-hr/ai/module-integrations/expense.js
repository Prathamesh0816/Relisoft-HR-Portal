import aiService from '../services/aiService.js';

const MODULE = 'expense';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a travel and expense AI. Analyze expense patterns, policy compliance, and cost optimization opportunities. Return JSON with: summary, topSpendingCategories, policyViolations, savingsOpportunities, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function detectFraud(expenseData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an expense fraud detection AI. Analyze expense claims for suspicious patterns, duplicate claims, and policy abuse. Return JSON with: flags (array of {claimId, riskLevel, reason, evidence}), fraudScore, and recommendations.' },
    { role: 'user', content: JSON.stringify(expenseData) },
  ], { temperature: 0.1 });
}

export async function validatePolicyCompliance(claim, policy) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an expense policy compliance AI. Validate expense claims against company policy. Return JSON with: compliant (boolean), violations (array of {rule, detail, suggestedAction}), approvedAmount (number).' },
    { role: 'user', content: JSON.stringify({ claim, policy }) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, detectFraud, validatePolicyCompliance, handleChatQuery };
