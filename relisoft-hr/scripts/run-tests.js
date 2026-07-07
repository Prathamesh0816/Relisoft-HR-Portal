import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const failures = [];
const coverage = { modules: {}, total: { endpoints: 0, models: 0, rules: 0 } };

const ENDPOINT_REGEX = /`(GET|POST|PUT|PATCH|DELETE)`\s+`(\/[^`]+)`/g;
const MODEL_REGEX = /^###\s+(.+)$/m;
const RULE_REGEX = /^-\s+(.+)$/m;

function getSpecFiles() {
  const modulesDir = path.join(rootDir, 'specs/modules');
  if (!fs.existsSync(modulesDir)) {
    console.error('Error: specs/modules directory not found');
    process.exit(1);
  }
  return fs.readdirSync(modulesDir).filter(f => f.endsWith('.md'));
}

function getActualEndpoints() {
  const routesDir = path.join(rootDir, 'server/routes');
  if (!fs.existsSync(routesDir)) return [];

  const endpoints = [];
  const routeFiles = fs.readdirSync(routesDir).filter(f => f.endsWith('Routes.js'));

  for (const file of routeFiles) {
    const content = fs.readFileSync(path.join(routesDir, file), 'utf-8');
    const routePrefixMatch = content.match(/app\.use\('(\/api\/[^']+)'/);
    const routerMatches = content.matchAll(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/gi);

    let prefix = '';
    if (routePrefixMatch) {
      prefix = routePrefixMatch[1];
    } else {
      const controllerName = file.replace('Routes.js', '').replace(/-/g, '/');
      prefix = `/api/${controllerName}`;
    }

    for (const match of routerMatches) {
      const method = match[1].toUpperCase();
      let routePath = match[2];
      if (!routePath.startsWith('/')) routePath = `/${routePath}`;
      endpoints.push({ method, path: `${prefix}${routePath}`, file });
    }
  }

  return endpoints;
}

function getActualModels() {
  const modelsDir = path.join(rootDir, 'server/models');
  if (!fs.existsSync(modelsDir)) return [];

  return fs.readdirSync(modelsDir).filter(f => f.endsWith('.js')).map(f => f.replace('.js', ''));
}

async function test(endpoint, path, description) {
  totalTests++;

  try {
    if (endpoint === 'api') {
      const actualEndpoints = getActualEndpoints();
      const specEndpoints = [];

      const files = getSpecFiles();
      for (const file of files) {
        const content = fs.readFileSync(path.join(rootDir, 'specs/modules', file), 'utf-8');
        let match;
        while ((match = ENDPOINT_REGEX.exec(content)) !== null) {
          specEndpoints.push({ method: match[1], path: match[2], specFile: file });
        }
      }

      for (const specEp of specEndpoints) {
        const found = actualEndpoints.some(
          actual => actual.method === specEp.method && actual.path === specEp.path
        );
        if (found) {
          passedTests++;
          coverage.total.endpoints++;
        } else {
          failedTests++;
          failures.push({ type: 'endpoint', message: `Endpoint ${specEp.method} ${specEp.path} not found in server routes (from ${specEp.specFile})` });
        }
      }

      const apiPaths = actualEndpoints.map(e => `${e.method} ${e.path}`);
      const specPaths = specEndpoints.map(e => `${e.method} ${e.path}`);
      for (const actual of apiPaths) {
        if (!specPaths.includes(actual)) {
          console.warn(`  Note: Route ${actual} exists in server but not documented in specs`);
        }
      }
    } else if (endpoint === 'models') {
      const actualModels = getActualModels();

      for (const file of getSpecFiles()) {
        const content = fs.readFileSync(path.join(rootDir, 'specs/modules', file), 'utf-8');
        const modelMatch = content.match(MODEL_REGEX);
        if (modelMatch) {
          const specModelName = modelMatch[1].trim();
          const modelFileName = file.replace('.md', '').replace(/-/g, '_');
          const possibleNames = [
            modelFileName,
            modelFileName.replace(/_/g, ''),
            modelFileName.charAt(0).toUpperCase() + modelFileName.slice(1),
            specModelName,
          ];

          const found = possibleNames.some(name =>
            actualModels.some(actual => actual.toLowerCase() === name.toLowerCase())
          );

          if (found) {
            passedTests++;
            coverage.total.models++;
          } else {
            failedTests++;
            failures.push({ type: 'model', message: `Model for spec "${file}" not found. Expected one of: ${possibleNames.join(', ')}. Available: ${actualModels.join(', ')}` });
          }
        } else {
          skippedTests++;
        }
      }
    } else if (endpoint === 'specInternal') {
      const content = fs.readFileSync(path, 'utf-8');

      const checks = [
        { name: 'Has title', test: () => /^#\s+.+$/m.test(content) },
        { name: 'Has overview', test: () => /^## Overview$/m.test(content) },
        { name: 'Has features', test: () => /^## Features$/m.test(content) },
        { name: 'Has data model', test: () => /^## Data Model$/m.test(content) },
        { name: 'Has api endpoints', test: () => /^## API Endpoints$/m.test(content) },
        { name: 'Has business rules', test: () => /^## Business Rules$/m.test(content) },
        { name: 'Has endpoint definitions', test: () => ENDPOINT_REGEX.test(content) },
      ];

      let allPass = true;
      for (const check of checks) {
        check.test.lastIndex = 0;
        const result = check.test();
        if (!result) {
          allPass = false;
          failedTests++;
          failures.push({ type: 'specStructure', message: `${path.basename(path)}: ${check.name}` });
        } else {
          passedTests++;
        }
        totalTests++;
      }

      if (allPass) {
        coverage.modules[path.basename(path)] = true;
      } else {
        coverage.modules[path.basename(path)] = false;
      }
    }
  } catch (error) {
    failedTests++;
    failures.push({ type: 'error', message: `${description}: ${error.message}` });
  }
}

function generateCoverageReport() {
  console.log('\n--- Coverage Report ---\n');

  const specFiles = getSpecFiles();
  const modulesComplete = Object.entries(coverage.modules);

  if (modulesComplete.length > 0) {
    console.log('Module Spec Completeness:');
    console.log('-'.repeat(50));
    let complete = 0;
    for (const [file, isComplete] of modulesComplete) {
      const status = isComplete ? 'COMPLETE' : 'INCOMPLETE';
      if (isComplete) complete++;
      console.log(`  ${file.padEnd(35)} ${status}`);
    }
    console.log(`  ${'-'.repeat(50)}`);
    console.log(`  Total: ${complete}/${modulesComplete.length} modules complete`);
  }

  console.log('\nAPI Endpoint Coverage:');
  console.log('-'.repeat(50));
  const actualEndpoints = getActualEndpoints();
  const specFilesForEndpoints = getSpecFiles();
  let specEndpointCount = 0;
  for (const file of specFilesForEndpoints) {
    const content = fs.readFileSync(path.join(rootDir, 'specs/modules', file), 'utf-8');
    let match;
    while ((match = ENDPOINT_REGEX.exec(content)) !== null) {
      specEndpointCount++;
    }
  }
  console.log(`  Spec-defined endpoints: ${specEndpointCount}`);
  console.log(`  Server route endpoints: ${actualEndpoints.length}`);
  console.log(`  Matching: ${coverage.total.endpoints || 0}`);
  const pctEndpoints = specEndpointCount > 0 ? Math.round((coverage.total.endpoints / specEndpointCount) * 100) : 0;
  console.log(`  Coverage: ${pctEndpoints}%`);

  console.log('\nModel Coverage:');
  console.log('-'.repeat(50));
  const actualModels = getActualModels();
  console.log(`  Server models: ${actualModels.length}`);
  console.log(`  Matching specs: ${coverage.total.models || 0}`);

  console.log('\n--- Test Summary ---');
  console.log(`Total:  ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Skipped: ${skippedTests}`);
  const pct = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  console.log(`Score:  ${pct}%`);

  const reportPath = path.join(rootDir, 'data', 'test-report.json');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const report = {
    timestamp: new Date().toISOString(),
    totalTests,
    passedTests,
    failedTests,
    skippedTests,
    coverage,
    failures,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nReport saved to: data/test-report.json`);
}

async function main() {
  console.log('SDD Spec-Driven Tests');
  console.log('=====================\n');

  console.log('1. Testing Spec Internal Structure...');
  const specFiles = getSpecFiles();
  for (const file of specFiles) {
    const filePath = path.join(rootDir, 'specs/modules', file);
    await test('specInternal', filePath, `Structure: ${file}`);
    process.stdout.write('.');
  }
  console.log(` done (${specFiles.length} files)`);

  console.log('\n2. Testing API Endpoint Consistency...');
  await test('api', '', '');
  console.log(' done');

  console.log('\n3. Testing Model Definitions...');
  await test('models', '', '');
  console.log(' done');

  generateCoverageReport();

  const exitCode = failedTests > 0 ? 1 : 0;
  process.exit(exitCode);
}

main().catch(err => {
  console.error('Test run failed:', err.message);
  process.exit(1);
});
