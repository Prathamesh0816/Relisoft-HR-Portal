import aiService from '../services/aiService.js';

const MODULE = 'compliance';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a compliance analytics AI. Analyze compliance status, upcoming deadlines, and risk areas. Return JSON with: overallStatus, pendingItems, overdueItems, riskAssessment, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function checkCompliance(module, data) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a compliance checker AI. Verify HR practices against labour laws and regulations. Return JSON with: compliant (boolean), violations (array of {regulation, detail, severity, remedy}), recommendations, and riskLevel.' },
    { role: 'user', content: JSON.stringify({ module, data }) },
  ], { temperature: 0.1 });
}

export async function suggestReminders(complianceItems) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a compliance reminder AI. Suggest optimal reminder schedules for compliance items. Return JSON with: reminders (array of {item, triggerDate, channel, message, priority}), and escalationRules.' },
    { role: 'user', content: JSON.stringify(complianceItems) },
  ], { temperature: 0.2 });
}

export async function generateAuditReport(auditData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an audit report generator AI. Generate comprehensive compliance audit reports. Return JSON with: executiveSummary, findings (array of {area, status, evidence, risk}), recommendations, and overallScore.' },
    { role: 'user', content: JSON.stringify(auditData) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, checkCompliance, suggestReminders, generateAuditReport, handleChatQuery };
