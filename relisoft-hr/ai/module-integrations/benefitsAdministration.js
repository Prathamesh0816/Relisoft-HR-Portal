import aiService from '../services/aiService.js';

const MODULE = 'benefitsAdministration';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a benefits administration AI. Analyze benefits enrollment, utilization, and cost optimization. Return JSON with: summary, enrollmentRates, utilizationByBenefit, costAnalysis, employeeSatisfaction, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function personalizeRecommendations(employeeProfile, benefitsCatalog) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a benefits recommendation AI. Suggest optimal benefits package for employees based on their life stage, family status, health needs, and financial goals. Return JSON with: recommendedBenefits (array of {benefit, priority, rationale, estimatedValue}), and comparison (current vs recommended).' },
    { role: 'user', content: JSON.stringify({ employeeProfile, benefitsCatalog }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, personalizeRecommendations, handleChatQuery };
