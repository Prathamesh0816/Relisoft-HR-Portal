import aiService from '../services/aiService.js';

const MODULE = 'integration';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an HR integration AI. Analyze integration status, data sync health, and error patterns. Return JSON with: summary, connectionStatus (object), syncHealth (percentage), recentErrors, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestMapping(sourceFields, targetSchema) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a data mapping AI. Suggest field mappings between source and target systems for HR data integration. Return JSON with: mappings (array of {sourceField, targetField, confidence, transform}), unmappedFields, and recommendations.' },
    { role: 'user', content: JSON.stringify({ sourceFields, targetSchema }) },
  ], { temperature: 0.15 });
}

export async function transformData(data, mappingRules) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a data transformation AI. Transform HR data according to mapping rules while preserving data integrity. Return JSON with: transformed (object), warnings, and transformationLog.' },
    { role: 'user', content: JSON.stringify({ data, mappingRules }) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestMapping, transformData, handleChatQuery };
