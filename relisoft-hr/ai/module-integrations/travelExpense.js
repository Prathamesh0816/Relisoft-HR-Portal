import aiService from '../services/aiService.js';

const MODULE = 'travelExpense';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a travel expense AI. Analyze travel bookings, expense claims, and policy compliance. Return JSON with: summary, travelPatterns, costTrends, complianceRate, savingsOpportunities, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function optimizeTravel(travelRequest, options) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a travel optimization AI. Suggest optimal travel arrangements balancing cost, convenience, and policy. Return JSON with: recommendedItinerary, costBreakdown, policyCompliance (boolean), and alternatives (array).' },
    { role: 'user', content: JSON.stringify({ travelRequest, options }) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, optimizeTravel, handleChatQuery };
