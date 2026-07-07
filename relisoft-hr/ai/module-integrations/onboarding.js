import aiService from '../services/aiService.js';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an onboarding analytics AI. Analyze onboarding effectiveness, completion rates, and new hire experience. Return JSON with: stats, bottlenecks, satisfaction, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function generateChecklist(department, role) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an onboarding specialist AI. Generate comprehensive onboarding checklists based on department and role. Return JSON with: preJoining (array), firstWeek (array), firstMonth (array), firstQuarter (array), requiredDocuments (array), and systemAccess (array).' },
    { role: 'user', content: JSON.stringify({ department, role }) },
  ], { temperature: 0.25 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: 'onboarding' });
}

export default { analyze, generateChecklist, handleChatQuery };
