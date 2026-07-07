import aiService from '../services/aiService.js';

const MODULE = 'payroll';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a payroll analyst AI. Analyze payroll data for trends, anomalies, and optimization opportunities. Return JSON with: summary, trends, anomalies, costAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function recommendSalary(data) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a compensation analyst AI. Recommend salary ranges based on role, experience, performance, and market data. Return JSON with: recommendedRange ({min, max, median}), marketPercentile, adjustmentPercentage, rationale, and equityNote.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.15 });
}

export async function benchmarkSalaries(roleData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a salary benchmarking AI. Compare compensation against market data. Return JSON with: marketPosition (percentile), gapAnalysis, competitiveRange, and adjustmentRecommendations.' },
    { role: 'user', content: JSON.stringify(roleData) },
  ], { temperature: 0.15 });
}

export async function detectAnomalies(payrollData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a payroll anomaly detection AI. Flag unusual payroll patterns, potential errors, and compliance issues. Return JSON with: anomalies (array of {type, severity, description, employee}), complianceFlags, and recommendations.' },
    { role: 'user', content: JSON.stringify(payrollData) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, recommendSalary, benchmarkSalaries, detectAnomalies, handleChatQuery };
