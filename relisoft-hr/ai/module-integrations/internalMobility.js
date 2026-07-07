import aiService from '../services/aiService.js';

const MODULE = 'internalMobility';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an internal mobility AI. Analyze internal moves, promotions, transfers, and career progression patterns. Return JSON with: summary, movementMetrics, careerPathHealth, promotionReadiness, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestInternalCandidates(openPosition, employeePool) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an internal talent matching AI. Suggest best internal candidates for open positions based on skills, performance, aspirations, and career path. Return JSON with: candidates (array of {employee, matchScore, strengths, growthAreas, recommendedRole}), and comparisonMatrix.' },
    { role: 'user', content: JSON.stringify({ openPosition, employeePool }) },
  ], { temperature: 0.15 });
}

export async function planCareerPath(employee, availablePaths) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a career pathing AI. Design optimal career progression paths for employees based on their profile, performance, and organizational needs. Return JSON with: currentStage, recommendedPaths (array of {path, timeline, milestones, requiredSkills}), and developmentPlan.' },
    { role: 'user', content: JSON.stringify({ employee, availablePaths }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestInternalCandidates, planCareerPath, handleChatQuery };
