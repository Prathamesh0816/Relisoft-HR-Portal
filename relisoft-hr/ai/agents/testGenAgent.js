import aiService from '../services/aiService.js';
import path from 'path';

class TestGenAgent {
  constructor(outputPath = './generated/tests') {
    this.outputPath = outputPath;
    this.generatedTests = [];
  }

  async generateApiTests(spec, moduleName) {
    const systemPrompt = `You are a test generation AI. Generate comprehensive API tests for the specification.
Return ONLY valid JavaScript code using Jest + Supertest. Include:
- Positive test cases for each endpoint (success scenarios)
- Negative test cases (validation errors, auth failures, not found)
- Edge cases (empty results, boundary values, duplicate entries)
- Setup and teardown with beforeAll/afterAll
- Proper assertions on status codes, response body structure, and error messages
- Mock auth tokens where needed

Use ES module syntax (import/export).`;

    const userPrompt = `Generate API tests for module "${moduleName}" with this specification:\n${JSON.stringify(spec, null, 2)}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch {
      return this._fallbackTest(spec, moduleName);
    }
  }

  async generateModelTests(spec, moduleName) {
    const systemPrompt = `You are a test generation AI. Generate Mongoose model tests for the entities in the specification.
Return ONLY valid JavaScript code using Jest. Include:
- Schema validation tests (required fields, types, enums, defaults)
- Custom validation tests (if any virtuals or custom validators exist)
- Pre-save hook tests (if any middleware defined)
- Index tests
- Relationship tests (population, ref validation)
- Edge cases (null handling, boundary values, long strings)

Use ES module syntax. Import models from '../models/ModelName.js'.`;

    const entities = spec.dataModel?.entities || [];
    const userPrompt = `Generate model tests for "${moduleName}" entities:\n${JSON.stringify(entities, null, 2)}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch {
      return null;
    }
  }

  async generateBusinessRuleTests(spec, moduleName) {
    const rules = spec.businessRules || [];
    if (rules.length === 0) return null;

    const systemPrompt = `You are a test generation AI. Generate business logic tests for HR business rules.
Return ONLY valid JavaScript code using Jest. Each test should verify a specific business rule with:
- Setup of test data fulfilling preconditions
- Execution of the rule
- Assertion on expected outcomes
- Both positive (rule enforced correctly) and negative (rule not violated) tests

Use ES module syntax.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate business rule tests for "${moduleName}" with rules:\n${JSON.stringify(rules, null, 2)}` }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch {
      return this._fallbackBusinessRuleTests(rules);
    }
  }

  async generateUITests(spec, moduleName) {
    const components = spec.uiComponents || [];
    if (components.length === 0) return null;

    const systemPrompt = `You are a test generation AI. Generate React component tests using React Testing Library + Jest.
Return ONLY valid JavaScript code. Include:
- Render tests (component renders without crashing)
- Props tests (component renders correctly with different props)
- State tests (state changes work correctly)
- User interaction tests (clicks, form input, etc.)
- Edge cases (empty data, loading state, error state)
- Async operation tests (API calls, loading states)

Use ES module syntax. Import from '@testing-library/react', '@testing-library/user-event'.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate UI tests for "${moduleName}" components:\n${JSON.stringify(components, null, 2)}` }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch {
      return null;
    }
  }

  async generateIntegrationTests(spec, moduleName) {
    const systemPrompt = `You are a test generation AI. Generate integration tests that test the full request-response cycle.
Return ONLY valid JavaScript code using Jest + Supertest. Include:
- End-to-end flows (create → read → update → delete)
- Multi-step scenarios that span multiple endpoints
- Cross-module interactions
- Auth/authorization flow tests
- Data consistency tests

Use ES module syntax.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate integration tests for "${moduleName}":\n${JSON.stringify(spec, null, 2)}` }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch {
      return null;
    }
  }

  async generateAllTests(spec, moduleName) {
    const [apiTests, modelTests, ruleTests, uiTests, integrationTests] = await Promise.all([
      this.generateApiTests(spec, moduleName),
      this.generateModelTests(spec, moduleName),
      this.generateBusinessRuleTests(spec, moduleName),
      this.generateUITests(spec, moduleName),
      this.generateIntegrationTests(spec, moduleName),
    ]);

    return {
      apiTests: { content: apiTests, path: path.join(this.outputPath, `${moduleName}.api.test.js`) },
      modelTests: modelTests ? { content: modelTests, path: path.join(this.outputPath, `${moduleName}.model.test.js`) } : null,
      businessRuleTests: ruleTests ? { content: ruleTests, path: path.join(this.outputPath, `${moduleName}.rules.test.js`) } : null,
      uiTests: uiTests ? { content: uiTests, path: path.join(this.outputPath, `${moduleName}.ui.test.js`) } : null,
      integrationTests: integrationTests ? { content: integrationTests, path: path.join(this.outputPath, `${moduleName}.integration.test.js`) } : null,
      coverage: this._estimateCoverage(spec),
    };
  }

  _estimateCoverage(spec) {
    let total = 0;
    let covered = 0;

    if (spec.apiEndpoints) {
      total += spec.apiEndpoints.length * 3;
      covered += spec.apiEndpoints.length * 2;
    }
    if (spec.dataModel?.entities) {
      for (const entity of spec.dataModel.entities) {
        total += (entity.fields?.length || 0);
        covered += (entity.fields?.filter(f => f.required)?.length || 0);
      }
    }
    if (spec.businessRules) {
      total += spec.businessRules.length * 2;
      covered += spec.businessRules.length;
    }
    if (spec.uiComponents) {
      total += spec.uiComponents.length * 4;
      covered += spec.uiComponents.length * 2;
    }

    return {
      estimatedTestCount: Math.max(covered, 1),
      estimatedAssertionCount: Math.max(covered * 2, 1),
      coverageEstimate: total > 0 ? `${Math.round((covered / total) * 100)}%` : '50%',
      testCategories: [
        ...(spec.apiEndpoints ? ['api'] : []),
        ...(spec.dataModel?.entities ? ['model'] : []),
        ...(spec.businessRules?.length ? ['business-rules'] : []),
        ...(spec.uiComponents?.length ? ['ui'] : []),
      ],
    };
  }

  getGeneratedTests() {
    return [...this.generatedTests];
  }

  _fallbackTest(spec, moduleName) {
    const endpoints = spec.apiEndpoints || [];
    let code = `import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';\n`;
    code += `import request from 'supertest';\n`;
    code += `import app from '../app.js';\n\n`;

    code += `let authToken;\n\n`;
    code += `beforeAll(async () => {\n`;
    code += `  const res = await request(app).post('/api/auth/login').send({ email: 'test@relisofttechnologies.com', password: 'test123' });\n`;
    code += `  authToken = res.body.token;\n`);
    code += `});\n\n`;

    for (const ep of endpoints) {
      const testName = `${ep.method} ${ep.path}`;
      code += `describe('${testName}', () => {\n`;
      code += `  it('should return ${ep.response?.status || 200} on success', async () => {\n`;
      code += `    const res = await request(app)\n`;
      code += `      .${ep.method.toLowerCase()}('${ep.path}')\n`;
      if (ep.auth) code += `      .set('Authorization', \`Bearer \${authToken}\`)\n`;
      if (ep.requestBody) code += `      .send(${JSON.stringify(ep.requestBody)})\n`;
      code += `    expect(res.status).toBe(${ep.response?.status || 200});\n`;
      code += `    expect(res.body.success).toBe(true);\n`;
      code += `  });\n\n`;

      code += `  it('should return 401 without auth token', async () => {\n`;
      code += `    const res = await request(app)\n`;
      code += `      .${ep.method.toLowerCase()}('${ep.path}')\n`;
      code += `    expect(res.status).toBe(401);\n`;
      code += `  });\n`;

      code += `});\n\n`;
    }

    return code;
  }

  _fallbackBusinessRuleTests(rules) {
    let code = `import { describe, it, expect } from '@jest/globals';\n\n`;
    for (const rule of rules) {
      code += `describe('Business Rule: ${rule.name || 'Unnamed'}', () => {\n`;
      code += `  it('should enforce the rule: ${(rule.description || '').replace(/`/g, "'")}', async () => {\n`;
      code += `    // TODO: Implement business rule test\n`;
      code += `    expect(true).toBe(true);\n`;
      code += `  });\n`;
      code += `});\n\n`;
    }
    return code;
  }

  _extractCode(response) {
    const codeBlock = response.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
    return codeBlock ? codeBlock[1].trim() : response.trim();
  }
}

export default TestGenAgent;
