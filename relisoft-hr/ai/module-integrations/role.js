import aiService from '../services/aiService.js';

const MODULE = 'role';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a role management AI. Analyze role assignments, permission usage, and access patterns. Return JSON with: summary, roleDistribution, permissionUtilization, overPrivilegedUsers, accessAnomalies, and recommendations.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function suggestRolePermissions(roleDescription, existingRoles) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a role-based access control AI. Suggest appropriate permissions for new roles based on job functions and principle of least privilege. Return JSON with: suggestedPermissions (array), inheritedFrom (role), conflicts (array), and securityAssessment.' },
    { role: 'user', content: JSON.stringify({ roleDescription, existingRoles }) },
  ], { temperature: 0.15 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, suggestRolePermissions, handleChatQuery };
