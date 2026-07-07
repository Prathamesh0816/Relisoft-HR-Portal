import aiService from '../services/aiService.js';

const MODULE = 'attendance';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an attendance analyst AI. Analyze attendance records for patterns, anomalies, and trends. Return JSON with: summary, trends, anomalies (array), recommendations (array), and overtimeAnalysis.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function detectAnomalies(records) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an attendance anomaly detection AI. Flag unusual patterns including buddy punching, irregular timings, pattern changes, and unusual overtime. Return JSON with: anomalies (array of {type, severity, description, dates}), riskLevel, and recommendations.' },
    { role: 'user', content: JSON.stringify({ records, totalRecords: records?.length }) },
  ], { temperature: 0.15 });
}

export async function predictAttendance(employeeData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are an attendance prediction AI. Predict future attendance patterns based on historical data. Return JSON with: predictedPattern, riskDays (array), averagePredictedHours, and confidence.' },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.2 });
}

export async function suggestShifts(requirements) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a smart scheduling AI. Optimize shift assignments based on employee availability, skills, and preferences. Return JSON with: schedule (array of {employee, shift, date}), conflicts (array), and coverage.' },
    { role: 'user', content: JSON.stringify(requirements) },
  ], { temperature: 0.2 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, detectAnomalies, predictAttendance, suggestShifts, handleChatQuery };
