import aiService from '../services/aiService.js';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an employee engagement AI. Analyze engagement survey data, pulse results, and feedback trends. Return JSON with: engagementScore, trends, departmentBreakdown, keyDrivers, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function analyzeSentiment(text) {
  return aiService.analyzeSentiment(text);
}

export async function generatePulseSurvey(department, focus) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an employee listening AI. Generate pulse survey questions based on department and focus area. Return JSON with: questions (array of {question, type, options}), estimatedCompletionTime, and recommendedFrequency.' },
    { role: 'user', content: JSON.stringify({ department, focus }) },
  ], { temperature: 0.3 });
}

export async function suggestRecognition(employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a recognition AI. Suggest meaningful recognition and rewards based on employee contributions and preferences. Return JSON with: recognitionMessage, suggestedReward, publicAnnouncement, and impact.' },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.3 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: 'engagement' });
}

export default { analyze, analyzeSentiment, generatePulseSurvey, suggestRecognition, handleChatQuery };
