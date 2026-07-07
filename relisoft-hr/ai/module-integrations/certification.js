import aiService from '../services/aiService.js';

const MODULE = 'certification';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a certification tracking AI. Analyze certification status, expiry patterns, and compliance gaps. Return JSON with: summary, expiringSoon (array with count), complianceRate (percentage), certificationGaps, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestCertifications(employeeProfile, industryTrends) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a career development AI. Suggest relevant certifications based on employee role, skills, career goals, and industry trends. Return JSON with: suggestions (array of {certification, relevance (0-1), estimatedCost, estimatedTime, benefit}), and careerPathImpact.' },
    { role: 'user', content: JSON.stringify({ employeeProfile, industryTrends }) },
  ], { temperature: 0.25 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestCertifications, handleChatQuery };
