import aiService from '../services/aiService.js';

const MODULE = 'recruitment';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a recruitment analytics AI. Analyze recruitment funnel, sourcing effectiveness, and hiring trends. Return JSON with: funnelMetrics, sourceAnalysis, timeToHire, costAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function parseResume(resumeText) {
  const { resumeParser } = await import('../services/resumeParser.js');
  return resumeParser.parse(resumeText);
}

export async function matchCandidates(jobDescription, candidates) {
  return aiService.matchCandidates(jobDescription, candidates);
}

export async function generateQuestions(jobDetails) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an interview question generator. Generate comprehensive, role-specific interview questions. Return JSON with: technical (array), behavioral (array), situational (array), roleSpecific (array), and evaluationCriteria.' },
    { role: 'user', content: JSON.stringify(jobDetails) },
  ], { temperature: 0.35 });
}

export async function screenResume(jobRequirements, resumeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a resume screening AI. Evaluate candidate resume against job requirements. Return JSON with: overallScore, requirementMatch (array of {requirement, match, evidence}), redFlags (array), greenFlags (array), and recommendation.' },
    { role: 'user', content: JSON.stringify({ jobRequirements, resumeData }) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, parseResume, matchCandidates, generateQuestions, screenResume, handleChatQuery };
