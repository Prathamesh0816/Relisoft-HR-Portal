import aiService from '../services/aiService.js';

const MODULE = 'workforcePlanning';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workforce planning AI. Analyze workforce composition, identify gaps, and forecast future needs. Return JSON with: summary, currentState, skillGaps, headcountForecast, budgetImpact, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function forecastHeadcount(historicalData, businessPlan) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a headcount forecasting AI. Predict optimal headcount requirements based on historical trends and business plans. Return JSON with: forecasts (array of {period, department, projectedHeadcount, confidence}), surplusAreas, shortageAreas, and hiringTimeline.' },
    { role: 'user', content: JSON.stringify({ historicalData, businessPlan }) },
  ], { temperature: 0.15 });
}

export async function identifySkillGaps(workforceData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a skill gap analysis AI. Identify current and future skill gaps in the workforce. Return JSON with: criticalGaps (array of {skill, severity, impact}), comparison (current vs target), and developmentRoadmap.' },
    { role: 'user', content: JSON.stringify(workforceData) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, forecastHeadcount, identifySkillGaps, handleChatQuery };
