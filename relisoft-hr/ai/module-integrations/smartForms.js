import aiService from '../services/aiService.js';

const MODULE = 'smartForms';

export async function analyze(data, context) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a smart forms AI. Analyze form usage, submission patterns, and data quality. Return JSON with: summary, formCompletionRate, averageFillTime, errorRate, mostUsedForms, and optimizationSuggestions.' },
    { role: 'user', content: JSON.stringify(data) },
  ], { temperature: 0.2 });
}

export async function autoFill(formFields, employeeData, previousSubmissions) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a form auto-fill AI. Intelligently pre-fill form fields based on employee data and previous submissions. Return JSON with: fieldValues (object of {fieldName: value}), confidence (percentage), ambiguousFields (array requiring user input), and suggestions.' },
    { role: 'user', content: JSON.stringify({ formFields, employeeData, previousSubmissions }) },
  ], { temperature: 0.15 });
}

export async function validateFormData(formData, validationRules) {
  return aiService.generateResponse([
    { role: 'system', content: 'You are a form validation AI. Validate form data against rules and detect inconsistencies or errors. Return JSON with: valid (boolean), errors (array of {field, message, severity}), warnings, and autoCorrections.' },
    { role: 'user', content: JSON.stringify({ formData, validationRules }) },
  ], { temperature: 0.1 });
}

export async function handleChatQuery(message, context) {
  const { chatbotService } = await import('../services/chatbotService.js');
  return chatbotService.processMessage(message, { ...context, module: MODULE });
}

export default { analyze, autoFill, validateFormData, handleChatQuery };
