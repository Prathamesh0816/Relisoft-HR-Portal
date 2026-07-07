import aiService from '../services/aiService.js';

const MODULE = 'report';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a report analytics AI. Analyze report generation patterns, data quality, and insight extraction. Return JSON with: summary, reportUsage, dataAnomalies, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function generateInsights(reportData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an insight generation AI. Transform raw report data into actionable business insights with executive summaries. Return JSON with: executiveSummary, keyFindings (array of {finding, impact, actionable}), dataVisualizations (array of {type, data, description}), and recommendations.' },
    { role: 'user', content: JSON.stringify(reportData) },
  ], { temperature: 0.25 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, generateInsights, handleChatQuery };
