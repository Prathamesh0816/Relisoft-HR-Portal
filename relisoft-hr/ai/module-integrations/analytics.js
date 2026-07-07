import aiService from '../services/aiService.js';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workforce analytics AI. Generate comprehensive insights from HR data across all modules. Return JSON with: executiveSummary, keyMetrics, trends, alerts, and strategicRecommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function predictTrends(historicalData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a predictive analytics AI. Forecast workforce trends based on historical patterns. Return JSON with: headcountForecast, attritionForecast, hiringNeeds, costProjections, and confidence.' },
    { role: 'user', content: JSON.stringify(historicalData) },
  ], { temperature: 0.2 });
}

export async function generateReport(data, reportType) {
  return aiService.generateResponse([
    { role: 'system', content: `You are an HR report generator AI. Generate comprehensive ${reportType} reports with visualizations and insights. Return JSON with: executiveSummary, sections (array), charts (array of {type, data, title}), findings, and appendix.` },
    { role: 'user', content: JSON.stringify({ data, reportType }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: 'analytics' });
}

export default { analyze, predictTrends, generateReport, handleChatQuery };
