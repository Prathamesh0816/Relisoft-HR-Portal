import aiService from '../services/aiService.js';

const MODULE = 'leave';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a leave management AI. Analyze leave patterns, trends, and forecast future leave demand. Return JSON with: summary, trends, forecasts, departmentAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function predictLeaveDemand(historicalData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a leave prediction AI. Forecast leave demand for capacity planning. Return JSON with: predictedDemand (array of {period, predictedDays, confidence}), peakPeriods, and staffingRecommendations.' },
    { role: 'user', content: JSON.stringify(historicalData) },
  ], { temperature: 0.2 });
}

export async function checkPolicyCompliance(leaveRequest, policies) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a leave policy compliance AI. Check if a leave request complies with company policies. Return JSON with: compliant (boolean), violations (array of {policy, detail, severity}), and suggestions.' },
    { role: 'user', content: JSON.stringify({ leaveRequest, policies }) },
  ], { temperature: 0.1 });
}

export async function suggestCoverage(leaveRequest, teamMembers) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workforce planning AI. Suggest optimal coverage arrangements for an employee on leave. Return JSON with: coveragePlan (array of {employee, tasks}), riskAssessment, and recommendations.' },
    { role: 'user', content: JSON.stringify({ leaveRequest, teamMembers }) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, predictLeaveDemand, checkPolicyCompliance, suggestCoverage, handleChatQuery };
