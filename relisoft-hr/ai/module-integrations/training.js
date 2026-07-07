import aiService from '../services/aiService.js';

const MODULE = 'training';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a training analytics AI. Analyze training programs, participation, and effectiveness. Return JSON with: completionRates, effectivenessScores, popularCourses, skillGaps, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function recommendTraining(employeeData) {
  const { recommendationEngine } = await import('../services/recommendationEngine.js');
  return recommendationEngine.recommendTraining(employeeData);
}

export async function suggestLearningPath(careerGoal, currentSkills) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a learning path designer AI. Create personalized learning paths based on career goals and current skills. Return JSON with: learningPath (array of {course, priority, duration, skills}), milestones, certifications, and estimatedTimeline.' },
    { role: 'user', content: JSON.stringify({ careerGoal, currentSkills }) },
  ], { temperature: 0.3 });
}

export async function generateCertification(courseData, employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a certification generator AI. Generate a completion certificate with course details and employee information. Return JSON with: certificateContent, certificateId, and metadata.' },
    { role: 'user', content: JSON.stringify({ courseData, employeeData }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, recommendTraining, suggestLearningPath, generateCertification, handleChatQuery };
