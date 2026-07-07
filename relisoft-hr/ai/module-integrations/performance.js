import aiService from '../services/aiService.js';

const MODULE = 'performance';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a performance analytics AI. Analyze performance review data for trends, biases, and development needs. Return JSON with: distribution, trends, biasAnalysis, topPerformers, bottomPerformers, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function generateSummary(employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a performance summary writer AI. Generate a professional, balanced performance summary. Return JSON with: summary (paragraph), strengths (array), areasForImprovement (array), overallRating, developmentPlan, and recommendations.' },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.25 });
}

export async function suggestGoals(roleData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an OKR/goal suggestion AI. Suggest SMART goals based on role and career level. Return JSON with: suggestedGoals (array of {objective, keyResults, timeline, successMetrics}), and alignmentTips.' },
    { role: 'user', content: JSON.stringify(roleData) },
  ], { temperature: 0.3 });
}

export async function detectBias(reviews) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a bias detection AI. Analyze performance reviews for potential biases (gender, racial, recency, halo/horn). Return JSON with: biasFlags (array of {type, evidence, severity}), overallAssessment, and recommendations.' },
    { role: 'user', content: JSON.stringify(reviews) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, generateSummary, suggestGoals, detectBias, handleChatQuery };
