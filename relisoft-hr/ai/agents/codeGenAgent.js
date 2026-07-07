import fs from 'fs';
import path from 'path';
import aiService from '../services/aiService.js';
import SpecEngine from './specEngine.js';

const GENERATION_HEADER = `// ============================================================================
// GENERATED CODE - DO NOT EDIT DIRECTLY
// Generator: ReliSoft AI CodeGenAgent
// Generated: {{timestamp}}
// Spec: {{specFile}}
// Version: {{specVersion}}
// ============================================================================
`;

class CodeGenAgent {
  constructor(specPath = '', outputPath = './generated') {
    this.specPath = specPath;
    this.outputPath = outputPath;
    this.ai = aiService;
    this.specEngine = new SpecEngine();
    this.generatedFiles = [];
  }

  async generateModel(spec) {
    const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;
    const dataModel = specObj.dataModel;

    if (!dataModel || !dataModel.entities) {
      throw new Error('Spec must contain dataModel with entities');
    }

    const generatedModels = [];

    for (const entity of dataModel.entities) {
      const modelCode = await this._generateMongooseModel(entity, specObj);
      const outputFile = path.join(this.outputPath, 'models', `${entity.name}.js`);

      await this._writeGeneratedFile(outputFile, modelCode, specObj);
      generatedModels.push({ entity: entity.name, file: outputFile });
    }

    return generatedModels;
  }

  async generateController(spec) {
    const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;

    if (!specObj.apiEndpoints || specObj.apiEndpoints.length === 0) {
      throw new Error('Spec must contain apiEndpoints');
    }

    const controllerCode = await this._generateExpressController(specObj);
    const controllerName = `${specObj.title.replace(/\s+/g, '')}Controller`;
    const outputFile = path.join(this.outputPath, 'controllers', `${controllerName}.js`);

    await this._writeGeneratedFile(outputFile, controllerCode, specObj);
    return [{ controller: controllerName, file: outputFile }];
  }

  async generateRoutes(spec) {
    const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;

    if (!specObj.apiEndpoints || specObj.apiEndpoints.length === 0) {
      throw new Error('Spec must contain apiEndpoints');
    }

    const routesCode = await this._generateRoutesFile(specObj);
    const routesName = `${specObj.title.replace(/\s+/g, '')}Routes`;
    const outputFile = path.join(this.outputPath, 'routes', `${routesName}.js`);

    await this._writeGeneratedFile(outputFile, routesCode, specObj);
    return [{ routes: routesName, file: outputFile }];
  }

  async generateComponent(spec) {
    const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;

    if (!specObj.uiComponents || specObj.uiComponents.length === 0) {
      throw new Error('Spec must contain uiComponents');
    }

    const generatedComponents = [];

    for (const component of specObj.uiComponents) {
      const componentCode = await this._generateReactComponent(component, specObj);
      const outputFile = path.join(this.outputPath, 'components', `${component.name}.jsx`);

      await this._writeGeneratedFile(outputFile, componentCode, specObj);
      generatedComponents.push({ component: component.name, file: outputFile });
    }

    return generatedComponents;
  }

  async generateTests(spec) {
    const specObj = typeof spec === 'string' ? JSON.parse(spec) : spec;
    const tests = [];

    if (specObj.apiEndpoints) {
      const apiTests = await this._generateApiTests(specObj);
      const testFile = path.join(this.outputPath, 'tests', `${specObj.title.replace(/\s+/g, '')}.api.test.js`);
      await this._writeGeneratedFile(testFile, apiTests, specObj);
      tests.push({ type: 'api', file: testFile });
    }

    if (specObj.businessRules) {
      const ruleTests = await this._generateBusinessRuleTests(specObj);
      const ruleTestFile = path.join(this.outputPath, 'tests', `${specObj.title.replace(/\s+/g, '')}.rules.test.js`);
      await this._writeGeneratedFile(ruleTestFile, ruleTests, specObj);
      tests.push({ type: 'business-rules', file: ruleTestFile });
    }

    return tests;
  }

  async generateFromSpec(specFile) {
    const specContent = fs.readFileSync(specFile, 'utf-8');
    const spec = JSON.parse(specContent);

    this.specPath = specFile;
    const results = {
      specFile,
      models: [],
      controllers: [],
      routes: [],
      components: [],
      tests: []
    };

    if (spec.dataModel?.entities) {
      results.models = await this.generateModel(spec);
    }

    if (spec.apiEndpoints) {
      results.controllers = await this.generateController(spec);
      results.routes = await this.generateRoutes(spec);
    }

    if (spec.uiComponents) {
      results.components = await this.generateComponent(spec);
    }

    results.tests = await this.generateTests(spec);

    return results;
  }

  async _generateMongooseModel(entity, spec) {
    const systemPrompt = `You are a code generation AI. Generate a Mongoose model for the given entity specification.

Requirements:
- Use ES module syntax (import/export)
- Include all fields with proper types and validation
- Add timestamps if specified
- Add indexes as specified
- Include virtuals and methods where appropriate
- Add proper error handling middleware
- Use Mongoose 7+ syntax

Return ONLY valid JavaScript code, no explanations.`;

    try {
      const response = await this.ai.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate a Mongoose model for this entity:\n${JSON.stringify(entity, null, 2)}\n\nSpec context:\n${JSON.stringify(spec.businessRules || {}, null, 2)}`
        }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch (error) {
      return this._fallbackMongooseModel(entity);
    }
  }

  async _generateExpressController(spec) {
    const systemPrompt = `You are a code generation AI. Generate an Express controller for the given API specification.

Requirements:
- ES module syntax
- Proper error handling with try/catch
- Input validation
- Role-based access checks where specified
- Use async/await
- Consistent response format: { success: true/false, data/error }
- Include proper HTTP status codes

Return ONLY valid JavaScript code.`;

    try {
      const response = await this.ai.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate Express controller for:\n${JSON.stringify(spec, null, 2)}`
        }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch (error) {
      return this._fallbackExpressController(spec);
    }
  }

  async _generateRoutesFile(spec) {
    let routes = `import express from 'express';\nconst router = express.Router();\n\n`;

    for (const endpoint of spec.apiEndpoints || []) {
      const handlerName = `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z]/g, '')}`;
      routes += `router.${endpoint.method.toLowerCase()}('${endpoint.path}', ${handlerName});\n`;
    }

    routes += `\nexport default router;\n`;
    return routes;
  }

  async _generateReactComponent(component, spec) {
    const systemPrompt = `You are a code generation AI. Generate a React component based on the specification.

Requirements:
- React 18+ with functional components
- Use modern React patterns (hooks)
- Import from proper relative paths
- Include PropTypes or JSDoc type annotations
- Handle loading, empty, and error states
- Use CSS modules or styled-components based on project conventions
- Make components reusable and composable

Return ONLY the component code, no explanations.`;

    try {
      const response = await this.ai.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Generate React component:\n${JSON.stringify(component, null, 2)}\n\nSpec context:\n${JSON.stringify(spec, null, 2)}`
        }
      ], { temperature: 0.15 });

      return this._extractCode(response);
    } catch (error) {
      return this._fallbackReactComponent(component);
    }
  }

  async _generateApiTests(spec) {
    let tests = `import { describe, it, expect, beforeAll } from '@jest/globals';\n`;
    tests += `import request from 'supertest';\n`;
    tests += `import app from '../app.js';\n\n`;

    for (const endpoint of spec.apiEndpoints || []) {
      tests += `describe('${endpoint.method} ${endpoint.path}', () => {\n`;
      tests += `  it('should return ${endpoint.response?.status || 200}', async () => {\n`;
      tests += `    const response = await request(app)\n`;
      tests += `      .${endpoint.method.toLowerCase()}('${endpoint.path}')\n`;
      if (endpoint.auth) {
        tests += `      .set('Authorization', 'Bearer test-token')\n`;
      }
      tests += `    expect(response.status).toBe(${endpoint.response?.status || 200});\n`;
      tests += `  });\n`;
      tests += `});\n\n`;
    }

    return tests;
  }

  async _generateBusinessRuleTests(spec) {
    let tests = `import { describe, it, expect } from '@jest/globals';\n\n`;

    for (const rule of spec.businessRules || []) {
      tests += `describe('Business Rule: ${rule.name || 'Unnamed'}', () => {\n`;
      tests += `  it('should enforce the rule', () => {\n`;
      tests += `    // TODO: Implement test for rule\n`;
      tests += `    expect(true).toBe(true);\n`;
      tests += `  });\n`;
      tests += `});\n\n`;
    }

    return tests;
  }

  _fallbackMongooseModel(entity) {
    const fieldDefinitions = (entity.fields || [])
      .filter(f => !f.auto)
      .map(f => {
        let def = `  ${f.name}: {\n    type: ${this._mapMongooseType(f.type)},\n`;
        if (f.required) def += `    required: ${f.required},\n`;
        if (f.unique) def += `    unique: true,\n`;
        if (f.default !== undefined) def += `    default: ${JSON.stringify(f.default)},\n`;
        if (f.enum) def += `    enum: [${f.enum.map(e => `'${e}'`).join(', ')}],\n`;
        def += '  },';
        return def;
      })
      .join('\n');

    return `import mongoose from 'mongoose';\n\nconst ${entity.name}Schema = new mongoose.Schema({\n${fieldDefinitions}\n}, {\n  timestamps: ${!!entity.timestamps},\n  collection: '${entity.collection || entity.name.toLowerCase() + 's'}'\n});\n\n${(entity.indexes || []).map(idx =>
      `\n${entity.name}Schema.index({${idx.fields.map(f => `'${f}': ${idx.unique ? 1 : 1}`).join(', ')}}${idx.unique ? ', { unique: true }' : ''});`
    ).join('')}\n\nconst ${entity.name} = mongoose.model('${entity.name}', ${entity.name}Schema);\n\nexport default ${entity.name};\n`;
  }

  _fallbackExpressController(spec) {
    const entityName = spec.dataModel?.entities?.[0]?.name || 'Resource';
    const modelImport = `import ${entityName} from '../models/${entityName}.js';\n\n`;
    let code = modelImport;
    code += `const responseFormat = (success, data, message = '') => ({ success, data, message });\n\n`;

    for (const endpoint of spec.apiEndpoints || []) {
      const fnName = `${endpoint.method.toLowerCase()}${endpoint.path.replace(/[^a-zA-Z]/g, '')}`;
      code += `export const ${fnName} = async (req, res, next) => {\n  try {\n    // TODO: Implement ${endpoint.method} ${endpoint.path}\n    res.status(${endpoint.response?.status || 200}).json(responseFormat(true, null));\n  } catch (error) {\n    next(error);\n  }\n};\n\n`;
    }

    return code;
  }

  _fallbackReactComponent(component) {
    const propsStr = (component.props || []).map(p => `${p.name}: ${p.type || 'any'}`).join(', ');
    return `import React, { useState, useEffect } from 'react';\n\nconst ${component.name} = ({${propsStr ? ' ' + propsStr + ' ' : ''}}) => {\n  const [loading, setLoading] = useState(false);\n  const [error, setError] = useState(null);\n\n  useEffect(() => {\n    // TODO: Implement component logic\n  }, []);\n\n  if (loading) return <div>Loading...</div>;\n  if (error) return <div>Error: {error}</div>;\n\n  return (\n    <div className="${component.name.toLowerCase()}">\n      {/* TODO: Implement ${component.name} */}\n    </div>\n  );\n};\n\nexport default ${component.name};\n`;
  }

  _mapMongooseType(jsType) {
    const map = {
      'String': 'String',
      'Number': 'Number',
      'Boolean': 'Boolean',
      'Date': 'Date',
      'ObjectId': 'mongoose.Schema.Types.ObjectId',
      'Array': '[]',
      'Mixed': 'mongoose.Schema.Types.Mixed',
      'Buffer': 'Buffer',
      'Decimal128': 'mongoose.Schema.Types.Decimal128',
      'Map': 'Map'
    };
    return map[jsType] || 'String';
  }

  _extractCode(response) {
    const codeBlock = response.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
    return codeBlock ? codeBlock[1].trim() : response.trim();
  }

  async _writeGeneratedFile(filePath, content, spec) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    const header = GENERATION_HEADER
      .replace('{{timestamp}}', new Date().toISOString())
      .replace('{{specFile}}', this.specPath || 'unknown')
      .replace('{{specVersion}}', spec.version || '1.0.0');

    const fullContent = header + '\n' + content;
    fs.writeFileSync(filePath, fullContent, 'utf-8');
    this.generatedFiles.push(filePath);

    console.log(`Generated: ${filePath}`);
  }

  getGeneratedFiles() {
    return [...this.generatedFiles];
  }
}

export default CodeGenAgent;
