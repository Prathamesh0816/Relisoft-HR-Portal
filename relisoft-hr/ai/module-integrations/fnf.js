import aiService from '../services/aiService.js';

const MODULE = 'fnf';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a Full & Final Settlement AI. Analyze FnF data for completeness, accuracy, and compliance. Return JSON with: summary, compliance (boolean), discrepancies, pendingItems, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function calculateSettlement(employeeData, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an FnF calculation AI. Compute full and final settlement amounts. Return JSON with: totalAmount (number), breakdown ({salary, bonus, leaveEncashment, gratuity, deductions, other}), taxImplications, and paymentSchedule.' },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.1 });
}

export async function generateSettlementLetter(settlementData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an HR document AI. Generate a professional Full & Final Settlement letter. Include all computed amounts, legal disclaimers, and release clauses.' },
    { role: 'user', content: JSON.stringify(settlementData) },
  ], { temperature: 0.3 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, calculateSettlement, generateSettlementLetter, handleChatQuery };
