import aiService from '../services/aiService.js';

const MODULE = 'employee';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an HR workforce AI. Analyze employee data for demographics, trends, and insights. Return JSON with: demographics, trends, retentionAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function predictAttrition(employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an attrition prediction AI. Analyze employee data and predict resignation risk. Return JSON with: riskScore (0-1), riskLevel, keyFactors (array), interventions (array), and confidence.' },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.15 });
}

export async function suggestCareerPath(employeeProfile) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a career development AI. Suggest career progression paths based on employee skills, performance, and aspirations. Return JSON with: careerPaths (array of {role, timeline, skills, milestones}), recommendedNextRole, and developmentPlan.' },
    { role: 'user', content: JSON.stringify(employeeProfile) },
  ], { temperature: 0.3 });
}

export async function matchSkills(jobRequirements, employeeSkills) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a skills matching AI. Compare employee skills against role requirements. Return JSON with: matchScore, skillGaps (array), strengths (array), and upskillingRecommendations.' },
    { role: 'user', content: JSON.stringify({ jobRequirements, employeeSkills }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, predictAttrition, suggestCareerPath, matchSkills, handleChatQuery };
