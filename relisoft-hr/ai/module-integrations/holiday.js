import aiService from '../services/aiService.js';

const MODULE = 'holiday';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a holiday management AI. Analyze holiday calendar, utilization, and optimize scheduling. Return JSON with: summary, holidayDistribution, utilizationRate, clashes (array), and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function optimizeCalendar(currentCalendar, constraints) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a holiday calendar optimizer. Suggest optimal holiday distribution considering business needs and cultural diversity. Return JSON with: optimizedCalendar, reasoning, and impactAnalysis.' },
    { role: 'user', content: JSON.stringify({ currentCalendar, constraints }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, optimizeCalendar, handleChatQuery };
