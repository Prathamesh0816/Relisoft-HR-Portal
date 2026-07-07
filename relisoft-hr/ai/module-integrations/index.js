import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moduleIntegrations = {};

const files = readdirSync(__dirname).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
  const moduleName = file.replace('.js', '');
  const integration = await import(`./${file}`);
  moduleIntegrations[moduleName] = integration.default || integration;
}

export function getModuleIntegration(moduleName) {
  return moduleIntegrations[moduleName] || null;
}

export function getAllModuleIntegrations() {
  return moduleIntegrations;
}

export function getModuleNames() {
  return Object.keys(moduleIntegrations);
}

export async function executeModuleAI(moduleName, action, payload, context = {}) {
  const integration = moduleIntegrations[moduleName];
  if (!integration) {
    return { success: false, error: `No AI integration found for module: ${moduleName}` };
  }
  if (!integration[action]) {
    const fallback = integration.default || integration.analyze;
    if (fallback) return fallback(payload, context);
    return { success: false, error: `No action '${action}' in module '${moduleName}'` };
  }
  return integration[action](payload, context);
}

export async function generateModuleSpec(moduleName, description) {
  const { generateResponse } = await import('../services/aiService.js');
  const response = await generateResponse([
    { role: 'system', content: 'You are an SDD specification generator. Generate a complete specification document from the feature description. Include: Overview, Features (table), Data Model (MongoDB schema tables), API Endpoints, UI Components, Business Rules, AI Integration, and Permissions. Return as structured markdown.' },
    { role: 'user', content: `Generate a comprehensive HR module specification for: ${moduleName}\n\nDescription: ${description}` },
  ], { temperature: 0.3 });
  return typeof response === 'string' ? response : response.content || JSON.stringify(response);
}

export async function generateModuleCode(specContent, moduleName, targets = ['model', 'controller', 'routes']) {
  const { generateResponse } = await import('../services/aiService.js');
  const response = await generateResponse([
    { role: 'system', content: 'You are an expert MERN stack code generator. Generate production-ready code from the specification. Return a JSON object with keys for each target (model, controller, routes, client-page, tests). Each value must be complete, working file content.' },
    { role: 'user', content: `Generate code for module "${moduleName}" targeting: ${targets.join(', ')}\n\nSpecification:\n${specContent}` },
  ], { temperature: 0.2 });
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    return { error: 'Could not parse generated code', raw: response };
  }
}

export async function reviewModuleCode(moduleName, codeContent, specContent) {
  const { generateResponse } = await import('../services/aiService.js');
  const response = await generateResponse([
    { role: 'system', content: 'You are a senior code reviewer. Review code against its specification. Return JSON with: specCompliance (0-100), bugs (array), security (array), issues (array of {severity, line, description, suggestion}), score (0-100), passed (boolean).' },
    { role: 'user', content: `Module: ${moduleName}\n\nSpecification:\n${specContent?.substring(0, 3000)}\n\nCode:\n${typeof codeContent === 'object' ? JSON.stringify(codeContent).substring(0, 5000) : codeContent?.substring(0, 5000)}` },
  ], { temperature: 0.15 });
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    return { score: 50, passed: false, rawReview: response };
  }
}

export async function generateModuleTests(specContent, moduleName) {
  const { generateResponse } = await import('../services/aiService.js');
  const response = await generateResponse([
    { role: 'system', content: 'You are a test engineer. Generate comprehensive Jest tests for the module specification. Return a JSON with: unitTests (array of test cases), integrationTests (array), e2eTests (array), and coverage (object).' },
    { role: 'user', content: `Generate tests for module: ${moduleName}\n\nSpecification:\n${specContent?.substring(0, 3000)}` },
  ], { temperature: 0.3 });
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    return jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    return { unitTests: [], integrationTests: [], e2eTests: [] };
  }
}

export async function autoGenerateModule(moduleName, description) {
  const spec = await generateModuleSpec(moduleName, description);
  const code = await generateModuleCode(spec, moduleName);
  const tests = await generateModuleTests(spec, moduleName);
  const review = await reviewModuleCode(moduleName, code, spec);
  return { spec, code, tests, review, generatedAt: new Date().toISOString() };
}

export default moduleIntegrations;
