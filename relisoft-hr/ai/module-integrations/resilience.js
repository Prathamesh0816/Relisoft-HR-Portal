import aiService from '../services/aiService.js';

const MODULE = 'resilience';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a resilience analytics AI. Analyze business continuity, disaster recovery readiness, and organizational resilience. Return JSON with: summary, resilienceScore, criticalRisks, recoveryReadiness (percentage), and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function simulateDisruption(scenario, currentState) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a disruption simulation AI. Model the impact of disruptions on workforce operations and suggest mitigation strategies. Return JSON with: impactLevel, affectedDepartments, estimatedDowntime, mitigationPlan, and recoverySteps.' },
    { role: 'user', content: JSON.stringify({ scenario, currentState }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, simulateDisruption, handleChatQuery };
