import aiService from '../services/aiService.js';

const MODULE = 'helpdesk';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a helpdesk analytics AI. Analyze ticket volume, resolution times, and agent performance. Return JSON with: volume, slaCompliance, agentPerformance, categoryBreakdown, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function categorizeTicket(description) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a ticket classification AI. Categorize support tickets and suggest priority. Return JSON with: category, subCategory, priority, suggestedDepartment, confidence, and relatedTopics.' },
    { role: 'user', content: description },
  ], { temperature: 0.15 });
}

export async function suggestSolution(ticketDetails, knowledgeBase) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a solution suggestion AI. Suggest knowledge base articles and solutions for support tickets. Return JSON with: suggestedSolutions (array of {article, relevance, excerpt}), recommendedActions, and confidence.' },
    { role: 'user', content: JSON.stringify({ ticket: ticketDetails, knowledgeBase }) },
  ], { temperature: 0.2 });
}

export async function analyzeSentiment(text) {
  return aiService.analyzeSentiment(text);
}

export async function autoReply(message, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a helpdesk auto-reply AI. Generate helpful, professional responses to common support queries. Keep responses concise and actionable. Return JSON with: reply (string), requiresHumanFollowUp (boolean), and relatedArticles (array).' },
    { role: 'user', content: JSON.stringify({ message, context }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, categorizeTicket, suggestSolution, analyzeSentiment, autoReply, handleChatQuery };
