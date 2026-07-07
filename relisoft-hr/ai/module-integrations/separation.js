import aiService from '../services/aiService.js';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a separation analytics AI. Analyze separation trends, reasons, and patterns. Return JSON with: trends, reasonAnalysis, departmentBreakdown, retentionRisks, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function analyzeExitInterview(interviewData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an exit interview analyst AI. Extract insights from exit interview responses. Return JSON with: keyThemes, sentiment, riskFactors, actionItems, and trends.' },
    { role: 'user', content: JSON.stringify(interviewData) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: 'separation' });
}

export default { analyze, analyzeExitInterview, handleChatQuery };
