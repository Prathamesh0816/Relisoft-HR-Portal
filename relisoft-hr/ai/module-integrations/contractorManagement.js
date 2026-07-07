import aiService from '../services/aiService.js';

const MODULE = 'contractorManagement';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a contractor management AI. Analyze contractor utilization, compliance, and cost efficiency. Return JSON with: summary, activeContractors, utilizationRate, complianceStatus, costAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function evaluateCompliance(contractorData, regulations) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a contractor compliance AI. Evaluate contractor compliance with labor laws, tax regulations, and company policies. Return JSON with: compliant (boolean), issues (array of {area, severity, detail, remediation}), and riskScore.' },
    { role: 'user', content: JSON.stringify({ contractorData, regulations }) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, evaluateCompliance, handleChatQuery };
