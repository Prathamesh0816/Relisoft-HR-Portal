import aiService from '../services/aiService.js';

const MODULE = 'notification';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a notification intelligence AI. Analyze notification delivery, engagement, and effectiveness. Return JSON with: summary, deliveryRate, openRate, clickRate, channelPerformance, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function personalizeNotification(notification, userProfile) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a notification personalization AI. Personalize notification content, timing, and channel based on user preferences and behavior. Return JSON with: personalizedContent, recommendedChannel, optimalTime, and priority.' },
    { role: 'user', content: JSON.stringify({ notification, userProfile }) },
  ], { temperature: 0.3 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, personalizeNotification, handleChatQuery };
