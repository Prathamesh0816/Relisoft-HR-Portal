import aiService from '../services/aiService.js';

const MODULE = 'workflow';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workflow analytics AI. Analyze workflow performance, bottlenecks, and efficiency. Return JSON with: summary, activeWorkflows, averageCompletionTime, bottlenecks (array), and optimizationSuggestions.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function optimizeWorkflow(workflowDefinition) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workflow optimization AI. Suggest improvements to approval workflows for faster processing and better user experience. Return JSON with: optimizedSteps (array), parallelization, autoApprovalRules, and expectedImprovement (percentage).' },
    { role: 'user', content: JSON.stringify(workflowDefinition) },
  ], { temperature: 0.2 });
}

export async function predictApprovalOutcome(workflowRequest, historicalData) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a workflow prediction AI. Predict approval outcomes and flag potential rejections early. Return JSON with: predictedOutcome (approved/rejected/escalated), confidence (percentage), riskFactors, and suggestedActions.' },
    { role: 'user', content: JSON.stringify({ workflowRequest, historicalData }) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, optimizeWorkflow, predictApprovalOutcome, handleChatQuery };
