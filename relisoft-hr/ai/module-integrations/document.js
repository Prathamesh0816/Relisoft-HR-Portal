import aiService from '../services/aiService.js';

const MODULE = 'document';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a document management AI. Analyze document repository, usage patterns, and expiry status. Return JSON with: summary, expiringDocuments, mostUsedTemplates, complianceStatus, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function generateFromTemplate(template, data) {
  return aiService.generateDocument(template, data);
}

export async function generateDocument(docType, employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: `You are an HR document generator AI. Generate professional ${docType} documents. Return JSON with: content (formatted document text), documentTitle, mergeFields (array), and version.` },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.25 });
}

export async function summarizeDocument(content) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a document summarizer AI. Summarize HR documents extracting key points, deadlines, and action items. Return JSON with: summary, keyPoints (array), deadlines (array), actionItems (array).' },
    { role: 'user', content: content?.substring(0, 10000) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, generateFromTemplate, generateDocument, summarizeDocument, handleChatQuery };
