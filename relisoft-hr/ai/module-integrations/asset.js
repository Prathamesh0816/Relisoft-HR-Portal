import aiService from '../services/aiService.js';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an asset management AI. Analyze asset utilization, allocation, and lifecycle. Return JSON with: utilizationRates, allocationStats, expiringWarranties, maintenanceNeeds, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function predictMaintenance(assetData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a predictive maintenance AI. Predict asset maintenance needs based on usage patterns and age. Return JSON with: predictions (array of {asset, predictedIssue, timeline, urgency}), and recommendations.' },
    { role: 'user', content: JSON.stringify(assetData) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: 'asset' });
}

export default { analyze, predictMaintenance, handleChatQuery };
