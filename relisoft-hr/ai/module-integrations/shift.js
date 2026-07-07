import aiService from '../services/aiService.js';

const MODULE = 'shift';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a shift management AI. Analyze shift patterns, coverage, and efficiency. Return JSON with: summary, coverageGaps, overtimeTrends, shiftPreferenceAnalysis, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function optimizeShiftRoster(employees, requirements, constraints) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a shift optimization AI. Create optimal shift rosters balancing business needs, employee preferences, and labor laws. Return JSON with: roster (array of {employee, shift, date}), constraintSatisfaction (percentage), and conflictNotes.' },
    { role: 'user', content: JSON.stringify({ employees, requirements, constraints }) },
  ], { temperature: 0.15 });
}

export async function detectAttendanceAnomalies(shiftRecords) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an attendance anomaly detection AI. Analyze shift attendance for irregularities, buddy punching, and policy violations. Return JSON with: anomalies (array of {employee, date, type (late/early/missing/irregular), confidence, details}), and summary.' },
    { role: 'user', content: JSON.stringify(shiftRecords) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, optimizeShiftRoster, detectAttendanceAnomalies, handleChatQuery };
