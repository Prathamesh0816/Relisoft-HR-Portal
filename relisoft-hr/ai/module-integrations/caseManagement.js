import aiService from '../services/aiService.js';

const MODULE = 'caseManagement';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a case management AI. Analyze HR case volume, resolution patterns, and service quality. Return JSON with: summary, caseVolume, avgResolutionTime, resolutionRate, satisfactionScore, commonCategories, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function autoAssignCase(caseData, agentPool) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a case assignment AI. Automatically assign HR cases to the best suited agent based on skills, workload, and case type. Return JSON with: assignedTo (agentId), reason, estimatedResolutionTime, and priority.' },
    { role: 'user', content: JSON.stringify({ caseData, agentPool }) },
  ], { temperature: 0.15 });
}

export async function suggestResolution(caseData, knowledgeBase) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a case resolution AI. Suggest resolution steps for HR cases based on similar resolved cases and knowledge base articles. Return JSON with: suggestedResolution, confidence, similarCases (array), knowledgeArticles, and recommendedAction.' },
    { role: 'user', content: JSON.stringify({ caseData, knowledgeBase }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, autoAssignCase, suggestResolution, handleChatQuery };
