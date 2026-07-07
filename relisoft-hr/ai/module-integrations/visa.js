import aiService from '../services/aiService.js';

const MODULE = 'visa';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a VISA documentation AI. Analyze visa applications, track status, and ensure compliance. Return JSON with: summary, applicationsByStatus, expiringVisas, complianceIssues, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function checkEligibility(employeeProfile) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a visa eligibility AI. Check visa type eligibility based on employee profile and business needs. Return JSON with: eligible (boolean), recommendedVisaType, requirements (array), estimatedTimeline, and nextSteps.' },
    { role: 'user', content: JSON.stringify(employeeProfile) },
  ], { temperature: 0.15 });
}

export async function generateDocumentation(visaData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a visa documentation generator. Generate complete visa application documents with all required fields, supporting statements, and compliance disclaimers.' },
    { role: 'user', content: JSON.stringify(visaData) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, checkEligibility, generateDocumentation, handleChatQuery };
