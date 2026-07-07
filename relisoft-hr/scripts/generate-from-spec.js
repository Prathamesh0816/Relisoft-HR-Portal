import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function loadAIService() {
  try {
    const mod = await import('../ai/services/aiService.js');
    return mod.default;
  } catch {
    console.warn('Warning: AI service not available. Using mock generation.');
    return null;
  }
}

function parseSpecFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const spec = {
    title: '',
    moduleName: '',
    overview: '',
    features: [],
    models: [],
    endpoints: [],
    businessRules: [],
  };

  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) spec.title = titleMatch[1].trim();

  const fileName = path.basename(filePath, '.md');
  spec.moduleName = fileName.replace(/-/g, '_').replace(/\s+/g, '_').toLowerCase();

  const sections = content.split(/^##\s+/m);

  for (const section of sections) {
    const lines = section.trim().split('\n');
    const sectionName = lines[0].trim();

    if (sectionName === 'Overview') {
      spec.overview = lines.slice(1).join('\n').trim();
    } else if (sectionName === 'Features') {
      spec.features = lines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.trim().replace(/^-\s*/, ''));
    } else if (sectionName === 'Data Model') {
      const modelRegex = /^###\s+(.+)$/gm;
      let modelMatch;
      while ((modelMatch = modelRegex.exec(section)) !== null) {
        spec.models.push(modelMatch[1].trim());
      }
    } else if (sectionName === 'API Endpoints') {
      const endpointRegex = /`(GET|POST|PUT|PATCH|DELETE)`\s+`(\/[^`]+)`/g;
      let epMatch;
      while ((epMatch = endpointRegex.exec(section)) !== null) {
        spec.endpoints.push({ method: epMatch[1], path: epMatch[2] });
      }
    } else if (sectionName === 'Business Rules') {
      spec.businessRules = lines
        .slice(1)
        .filter(l => l.trim().startsWith('-'))
        .map(l => l.trim().replace(/^-\s*/, ''));
    }
  }

  return spec;
}

async function generateMongooseModel(spec) {
  const modelName = spec.moduleName.replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase());
  const fileName = `${spec.moduleName.replace(/_/g, '-')}.js`;

  let schemaFields = '';
  const fieldExamples = {
    employee: "    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },\n",
    name: "    name: { type: String, required: true, trim: true },\n",
    email: "    email: { type: String, required: true, unique: true, lowercase: true, trim: true },\n",
    status: "    status: { type: String, enum: ['active', 'inactive'], default: 'active' },\n",
    date: "    date: { type: Date, required: true },\n",
  };

  const commonFields = ['employee', 'status', 'date'];
  for (const field of commonFields) {
    if (fieldExamples[field]) {
      schemaFields += fieldExamples[field];
    }
  }

  schemaFields += `    // TODO: Add spec-specific fields for ${spec.title}\n`;

  const code = `import mongoose from 'mongoose';

const ${spec.moduleName}Schema = new mongoose.Schema(
  {
${schemaFields}    createdAt: { type: Date },
    updatedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('${modelName}', ${spec.moduleName}Schema);
`;

  return { fileName, code, type: 'model' };
}

function generateController(spec) {
  const fileName = `${spec.moduleName.replace(/_/g, '-')}Controller.js`;
  const modelRef = spec.moduleName.replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase());

  let crudMethods = '';
  const endpointsByMethod = {};
  for (const ep of spec.endpoints) {
    if (!endpointsByMethod[ep.method]) endpointsByMethod[ep.method] = [];
    endpointsByMethod[ep.method].push(ep.path);
  }

  if (endpointsByMethod.GET) {
    crudMethods += `
export const getAll = async (req, res) => {
  try {
    const items = await ${modelRef}.find().sort('-createdAt');
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const item = await ${modelRef}.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
  }

  if (endpointsByMethod.POST) {
    crudMethods += `
export const create = async (req, res) => {
  try {
    const item = await ${modelRef}.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
  }

  if (endpointsByMethod.PUT || endpointsByMethod.PATCH) {
    crudMethods += `
export const update = async (req, res) => {
  try {
    const item = await ${modelRef}.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
  }

  if (endpointsByMethod.DELETE) {
    crudMethods += `
export const remove = async (req, res) => {
  try {
    const item = await ${modelRef}.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Not found' });
    }
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
`;
  }

  const code = `import ${modelRef} from '../models/${fileName.replace('Controller', '.js')}';

${crudMethods}
`;

  return { fileName, code, type: 'controller' };
}

function generateRoutes(spec) {
  const fileName = `${spec.moduleName.replace(/_/g, '-')}Routes.js`;
  const controllerFile = `${spec.moduleName.replace(/_/g, '-')}Controller.js`;

  let routeDefinitions = '';
  const specialEndpoints = [];
  const crudEndpoints = [];

  for (const ep of spec.endpoints) {
    const isSpecial = ep.path.includes(':') && !ep.path.endsWith('/:id');
    if (isSpecial) {
      specialEndpoints.push(ep);
    } else {
      crudEndpoints.push(ep);
    }
  }

  const hasGetAll = crudEndpoints.some(ep => ep.method === 'GET' && !ep.path.includes(':'));
  const hasGetById = crudEndpoints.some(ep => ep.method === 'GET' && ep.path.includes(':id'));
  const hasCreate = crudEndpoints.some(ep => ep.method === 'POST' && !ep.path.includes(':'));
  const hasUpdate = crudEndpoints.some(ep => (ep.method === 'PUT' || ep.method === 'PATCH') && ep.path.includes(':id'));
  const hasDelete = crudEndpoints.some(ep => ep.method === 'DELETE' && ep.path.includes(':id'));

  if (hasGetAll) routeDefinitions += "router.get('/', protect, getAll);\n";
  if (hasGetById) routeDefinitions += "router.get('/:id', protect, getById);\n";
  if (hasCreate) routeDefinitions += "router.post('/', protect, authorize('admin', 'hr'), create);\n";
  if (hasUpdate) routeDefinitions += "router.put('/:id', protect, authorize('admin', 'hr'), update);\n";
  if (hasDelete) routeDefinitions += "router.delete('/:id', protect, authorize('admin', 'hr'), remove);\n";

  for (const ep of specialEndpoints) {
    const routePath = ep.path.replace(/\/:([^/]+)/g, '/:$1');
    const handlerName = ep.path.split('/').pop().replace(/:/g, '');
    routeDefinitions += `router.${ep.method.toLowerCase()}('${routePath}', protect, ${handlerName});\n`;
  }

  const code = `import express from 'express';
import {
${crudEndpoints.length > 0 ? `  getAll,
  getById,
  create,
  update,
  remove,
` : ''}${specialEndpoints.map(ep => `  ${ep.path.split('/').pop().replace(/:/g, '')}`).join(',\n')}
} from '../controllers/${controllerFile}';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

${routeDefinitions}
export default router;
`;

  return { fileName, code, type: 'routes' };
}

async function generateReactComponent(spec) {
  const fileName = `${spec.moduleName.replace(/_/g, '-')}List.jsx`;
  const componentName = spec.moduleName.replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase());

  const code = `import { useState, useEffect } from 'react';
import axios from 'axios';

const ${componentName}List = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/${spec.moduleName.replace(/_/g, '-')}');
      setItems(data.data || data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">${spec.title}</h1>
      <p className="mb-4 text-gray-600">{spec.overview ? spec.overview.substring(0, 200) : ''}</p>
      <div className="grid gap-4">
        {items.length === 0 ? (
          <p className="text-gray-500">No items found</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className="border rounded p-4 shadow-sm">
              <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ${componentName}List;
`;

  return { fileName, code, type: 'component' };
}

async function generateTests(spec) {
  const fileName = `${spec.moduleName.replace(/_/g, '-')}.test.js`;
  const modelRef = spec.moduleName.replace(/(?:^|_)(\w)/g, (_, c) => c.toUpperCase());

  let endpointTests = '';
  for (const ep of spec.endpoints.slice(0, 5)) {
    const testName = ep.description || `${ep.method} ${ep.path}`;
    endpointTests += `
  it('should handle ${ep.method} ${ep.path}', async () => {
    // TODO: Implement test for ${testName}
    // const res = await request(app).${ep.method.toLowerCase()}('${ep.path}');
    // expect(res.status).toBe(200);
  });
`;
  }

  let rulesTests = '';
  for (const rule of spec.businessRules.slice(0, 3)) {
    rulesTests += `
  it('should enforce: ${rule}', async () => {
    // TODO: Implement test for this business rule
  });
`;
  }

  const code = `import { describe, it, expect } from '@jest/globals';
// import request from 'supertest';
// import app from '../server.js';
// import ${modelRef} from '../models/${spec.moduleName.replace(/_/g, '-')}.js';

describe('${spec.title}', () => {
  describe('API Endpoints', () => {${endpointTests}
  });

  describe('Business Rules', () => {${rulesTests}
  });

  describe('Data Model', () => {
    it('should have the correct model defined', () => {
      // expect(${modelRef}).toBeDefined();
    });
  });
});
`;

  return { fileName, code, type: 'test' };
}

async function generateWithAI(spec, aiService) {
  if (!aiService) return null;

  const prompt = `Generate code for an HR module based on this specification:

Title: ${spec.title}
Module: ${spec.moduleName}

Overview: ${spec.overview}

Features:
${spec.features.map(f => `- ${f}`).join('\n')}

Data Models:
${spec.models.join(', ')}

API Endpoints:
${spec.endpoints.map(e => `- ${e.method} ${e.path}`).join('\n')}

Business Rules:
${spec.businessRules.map(r => `- ${r}`).join('\n')}

Generate the following files:
1. A Mongoose model skeleton
2. An Express controller skeleton  
3. Express route definitions
4. A React component skeleton
5. Test file skeleton

Return the code as a JSON object with keys: model, controller, routes, component, tests`;

  try {
    const response = await aiService.generateResponse([
      { role: 'system', content: 'You are an expert code generator. Generate production-ready code from specifications. Return valid JSON only.' },
      { role: 'user', content: prompt }
    ], { temperature: 0.3 });

    if (typeof response === 'string') {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response);
    }
    return response;
  } catch (error) {
    console.warn('AI generation failed, using templates:', error.message);
    return null;
  }
}

async function main() {
  const aiService = await loadAIService();

  const args = process.argv.slice(2);
  const specArg = args.find(a => a.startsWith('--spec='));
  const outputArg = args.find(a => a.startsWith('--output='));

  if (!specArg) {
    console.error('Usage: node scripts/generate-from-spec.js --spec=specs/modules/leave-management.md --output=./generated');
    process.exit(1);
  }

  const specFilePath = path.resolve(rootDir, specArg.split('=')[1]);
  const outputDir = outputArg ? path.resolve(rootDir, outputArg.split('=')[1]) : path.resolve(rootDir, 'generated');

  if (!fs.existsSync(specFilePath)) {
    console.error(`Spec file not found: ${specFilePath}`);
    process.exit(1);
  }

  console.log(`Reading spec: ${specFilePath}\n`);
  const spec = parseSpecFile(specFilePath);

  console.log(`Module: ${spec.title}`);
  console.log(`Endpoints: ${spec.endpoints.length}`);
  console.log(`Business Rules: ${spec.businessRules.length}\n`);

  fs.mkdirSync(outputDir, { recursive: true });
  const modelDir = path.join(outputDir, 'models');
  const controllerDir = path.join(outputDir, 'controllers');
  const routesDir = path.join(outputDir, 'routes');
  const componentDir = path.join(outputDir, 'components');
  const testDir = path.join(outputDir, 'tests');

  [modelDir, controllerDir, routesDir, componentDir, testDir].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });

  console.log('Attempting AI-enhanced generation...');
  const aiResult = aiService ? await generateWithAI(spec, aiService) : null;

  if (aiResult) {
    console.log('AI generation successful!\n');

    const outputs = {
      model: { fileName: `${spec.moduleName.replace(/_/g, '-')}.js`, code: aiResult.model || aiResult.code, dir: modelDir },
      controller: { fileName: `${spec.moduleName.replace(/_/g, '-')}Controller.js`, code: aiResult.controller, dir: controllerDir },
      routes: { fileName: `${spec.moduleName.replace(/_/g, '-')}Routes.js`, code: aiResult.routes, dir: routesDir },
      component: { fileName: `${spec.moduleName.replace(/_/g, '-')}List.jsx`, code: aiResult.component, dir: componentDir },
      tests: { fileName: `${spec.moduleName.replace(/_/g, '-')}.test.js`, code: aiResult.tests, dir: testDir },
    };

    for (const [key, output] of Object.entries(outputs)) {
      if (output.code) {
        const filePath = path.join(output.dir, output.fileName);
        fs.writeFileSync(filePath, output.code, 'utf-8');
        console.log(`  Generated: ${path.relative(rootDir, filePath)}`);
      }
    }
  } else {
    console.log('Using template-based generation.\n');

    const model = await generateMongooseModel(spec);
    const modelPath = path.join(modelDir, model.fileName);
    fs.writeFileSync(modelPath, model.code, 'utf-8');
    console.log(`  Generated: ${path.relative(rootDir, modelPath)}`);

    const controller = generateController(spec);
    const controllerPath = path.join(controllerDir, controller.fileName);
    fs.writeFileSync(controllerPath, controller.code, 'utf-8');
    console.log(`  Generated: ${path.relative(rootDir, controllerPath)}`);

    const routes = generateRoutes(spec);
    const routesPath = path.join(routesDir, routes.fileName);
    fs.writeFileSync(routesPath, routes.code, 'utf-8');
    console.log(`  Generated: ${path.relative(rootDir, routesPath)}`);

    const component = await generateReactComponent(spec);
    const componentPath = path.join(componentDir, component.fileName);
    fs.writeFileSync(componentPath, component.code, 'utf-8');
    console.log(`  Generated: ${path.relative(rootDir, componentPath)}`);

    const tests = await generateTests(spec);
    const testsPath = path.join(testDir, tests.fileName);
    fs.writeFileSync(testsPath, tests.code, 'utf-8');
    console.log(`  Generated: ${path.relative(rootDir, testsPath)}`);
  }

  console.log(`\nAll generated files are in: ${path.relative(rootDir, outputDir)}`);
}

main().catch(err => {
  console.error('Generation failed:', err.message);
  process.exit(1);
});
