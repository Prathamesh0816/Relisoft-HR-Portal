import aiService from '../services/aiService.js';

const MODULE = 'talentAnalytics';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a talent analytics AI. Analyze comprehensive talent metrics, pipeline health, and strategic workforce insights. Return JSON with: executiveSummary, talentScorecard (object of key metrics), pipelineHealth, riskAreas, predictiveInsights, and strategicRecommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function predictTalentTrends(historicalData, marketData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a talent trend prediction AI. Forecast talent market trends, attrition risks, and hiring challenges. Return JSON with: predictions (array of {trend, impact, confidence, timeline}), riskMitigation, and strategicAdvice.' },
    { role: 'user', content: JSON.stringify({ historicalData, marketData }) },
  ], { temperature: 0.2 });
}

export async function talentValueAnalysis(talentData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a talent value analysis AI. Quantify the business value of talent investments and identify ROI optimization opportunities. Return JSON with: talentROI, productivityMetrics, costPerHire, revenuePerEmployee, retentionCost, and strategicPriorities.' },
    { role: 'user', content: JSON.stringify(talentData) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, predictTalentTrends, talentValueAnalysis, handleChatQuery };
