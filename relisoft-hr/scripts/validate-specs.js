import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_SECTIONS = ['Overview', 'Features', 'Data Model', 'API Endpoints', 'Business Rules'];

const VALID_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const ENDPOINT_PATTERN = /^\s*[-*]\s*`(GET|POST|PUT|PATCH|DELETE)`\s+(\/\S+)\s*-/;
const CROSS_REF_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const report = [];

function reportPass(specFile, message) {
  passedChecks++;
  report.push(`  PASS: ${specFile} - ${message}`);
}

function reportFail(specFile, message) {
  failedChecks++;
  report.push(`  FAIL: ${specFile} - ${message}`);
}

function getSpecFiles() {
  const modulesDir = path.join(rootDir, 'specs/modules');
  if (!fs.existsSync(modulesDir)) {
    console.error('Error: specs/modules directory not found');
    process.exit(1);
  }
  return fs.readdirSync(modulesDir).filter(f => f.endsWith('.md'));
}

function extractSections(content) {
  const sections = {};
  const sectionRegex = /^##\s+(.+)$/gm;
  let match;
  const sectionPositions = [];

  while ((match = sectionRegex.exec(content)) !== null) {
    sectionPositions.push({ name: match[1].trim(), index: match.index });
  }

  for (let i = 0; i < sectionPositions.length; i++) {
    const current = sectionPositions[i];
    const next = sectionPositions[i + 1];
    const start = content.indexOf('\n', current.index) + 1;
    const end = next ? content.lastIndexOf('\n', next.index - 1) : content.length;
    sections[current.name] = content.slice(start, end).trim();
  }

  return sections;
}

function validateRequiredSections(specFile, content) {
  const sections = extractSections(content);

  for (const section of REQUIRED_SECTIONS) {
    totalChecks++;
    if (sections[section]) {
      reportPass(specFile, `Section "${section}" found`);

      if (section === 'Overview' && sections[section].length < 20) {
        reportFail(specFile, `Section "Overview" is too short (${sections[section].length} chars)`);
      }
      if (section === 'Features' && sections[section].split('\n').filter(l => l.trim().startsWith('-')).length < 3) {
        reportFail(specFile, `Section "Features" has fewer than 3 features listed`);
      }
      if (section === 'API Endpoints' && sections[section].split('\n').filter(l => l.includes('`')).length < 2) {
        reportFail(specFile, `Section "API Endpoints" has fewer than 2 endpoints defined`);
      }
      if (section === 'Business Rules' && sections[section].split('\n').filter(l => l.trim().startsWith('-')).length < 3) {
        reportFail(specFile, `Section "Business Rules" has fewer than 3 rules defined`);
      }
    } else {
      reportFail(specFile, `Missing required section: "${section}"`);
    }
  }

  return sections;
}

function validateEndpointFormat(specFile, content) {
  totalChecks++;
  const endpointLines = content.split('\n').filter(line => ENDPOINT_PATTERN.test(line.trim()));

  if (endpointLines.length === 0) {
    reportFail(specFile, 'No API endpoints found in expected format');
    return [];
  }

  const endpoints = [];

  for (const line of endpointLines) {
    const match = line.trim().match(ENDPOINT_PATTERN);
    if (match) {
      const method = match[1];
      const epPath = match[2];

      if (!VALID_METHODS.includes(method)) {
        reportFail(specFile, `Invalid HTTP method "${method}" in endpoint: ${epPath}`);
      }
      if (!epPath.startsWith('/')) {
        reportFail(specFile, `Endpoint path must start with /: ${epPath}`);
      }

      endpoints.push({ method, path: epPath });
    }
  }

  if (endpointLines.length > 0) {
    const uniqueEndpoints = new Set(endpoints.map(e => `${e.method}:${e.path}`));
    if (uniqueEndpoints.size < endpoints.length) {
      reportFail(specFile, `Duplicate endpoints found (${endpoints.length} lines, ${uniqueEndpoints.size} unique)`);
    }
  }

  reportPass(specFile, `${endpoints.length} API endpoints defined`);
  return endpoints;
}

function validateDataModel(specFile, content, sections) {
  totalChecks++;
  const dataModelSection = sections['Data Model'];
  if (!dataModelSection) return [];

  const modelHeaders = dataModelSection.match(/^###\s+(.+)$/gm);
  if (!modelHeaders || modelHeaders.length === 0) {
    reportFail(specFile, 'Data Model section has no model definitions (use ### ModelName)');
    return [];
  }

  const modelNames = modelHeaders.map(h => h.replace(/^###\s+/, '').trim());
  reportPass(specFile, `${modelNames.length} data models defined: ${modelNames.join(', ')}`);

  const tableRows = dataModelSection.split('\n').filter(l => l.includes('|') && l.startsWith('|'));
  if (tableRows.length < 3) {
    reportFail(specFile, 'Data Model tables appear incomplete or missing field definitions');
  }

  return modelNames;
}

function validateCrossReferences(specFile, content) {
  totalChecks++;
  const refs = [];
  let match;

  while ((match = CROSS_REF_PATTERN.exec(content)) !== null) {
    refs.push({ text: match[1], url: match[2] });
  }

  if (refs.length === 0) {
    reportPass(specFile, 'No cross-references to validate');
    return;
  }

  for (const ref of refs) {
    const refPath = ref.url.replace(/^\.\//, '').replace(/^\/+/, '');
    let resolvedPath;

    if (refPath.startsWith('specs/') || refPath.startsWith('../specs/')) {
      resolvedPath = path.resolve(rootDir, refPath.replace(/^\.\.\//, ''));
    } else if (refPath.startsWith('#')) {
      continue;
    } else {
      resolvedPath = path.resolve(rootDir, 'specs', refPath);
    }

    if (fs.existsSync(resolvedPath)) {
      reportPass(specFile, `Cross-reference resolves: ${ref.url}`);
    } else {
      reportFail(specFile, `Cross-reference not found: ${ref.url}`);
    }
  }
}

function validateEndpointConsistency(specFile, content, allEndpoints) {
  totalChecks++;
  const endpointSection = content.match(/## API Endpoints([\s\S]*?)(?=## |$)/);
  if (!endpointSection) return;

  const lines = endpointSection[1].split('\n');
  for (const line of lines) {
    const methodMatch = line.match(/`(GET|POST|PUT|PATCH|DELETE)`/);
    const pathMatch = line.match(/`(\/api\/[^`]+)`/);
    if (methodMatch && pathMatch) {
      const ep = `${methodMatch[1]} ${pathMatch[1]}`;
      if (!allEndpoints.has(ep)) {
        reportFail(specFile, `Endpoint "${ep}" defined but may not match actual API routes`);
      }
    }
  }
}

function validateSpec(specFile) {
  const filePath = path.join(rootDir, 'specs/modules', specFile);
  const content = fs.readFileSync(filePath, 'utf-8');

  console.log(`\nValidating: ${specFile}`);

  const sections = validateRequiredSections(specFile, content);
  const endpoints = validateEndpointFormat(specFile, content);
  validateDataModel(specFile, content, sections);
  validateCrossReferences(specFile, content);

  return { file: specFile, endpoints, sections };
}

function main() {
  console.log('SDD Spec Validation Report');
  console.log('=========================\n');

  const specFiles = getSpecFiles();
  console.log(`Found ${specFiles.length} spec file(s) to validate\n`);

  const allEndpoints = new Map();
  const results = [];

  for (const specFile of specFiles) {
    const result = validateSpec(specFile);
    results.push(result);
    const fileLabel = result.file.padEnd(30);
    const finalStatus = report.some(r => r.startsWith(`  FAIL: ${result.file}`)) ? 'FAIL' : 'PASS';
    console.log(`  ${fileLabel} [${finalStatus}]`);
  }

  const apiRoutesPath = path.join(rootDir, 'server/routes');
  if (fs.existsSync(apiRoutesPath)) {
    const routeFiles = fs.readdirSync(apiRoutesPath).filter(f => f.endsWith('Routes.js'));
    for (const routeFile of routeFiles) {
      const routeContent = fs.readFileSync(path.join(apiRoutesPath, routeFile), 'utf-8');
      const routeMatches = routeContent.matchAll(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/gi);
      for (const match of routeMatches) {
        const method = match[1].toUpperCase();
        const route = match[2];
        const fullPath = route.startsWith('/') ? route : `/${route}`;
        const key = `${method} ${fullPath}`;
        if (!allEndpoints.has(key)) {
          allEndpoints.set(key, routeFile);
        }
      }
    }

    console.log(`\nFound ${allEndpoints.size} actual API routes defined in server`);

    for (const result of results) {
      validateEndpointConsistency(result.file, fs.readFileSync(path.join(rootDir, 'specs/modules', result.file), 'utf-8'), allEndpoints);
    }
  }

  console.log('\n--- Summary ---');
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed: ${passedChecks}`);
  console.log(`Failed: ${failedChecks}`);
  console.log(`Spec Files: ${specFiles.length} (${results.filter(r => !report.some(rep => rep.startsWith(`  FAIL: ${r.file}`))).length} passed, ${results.filter(r => report.some(rep => rep.startsWith(`  FAIL: ${r.file}`))).length} failed)`);

  console.log('\n--- Detailed Report ---');
  for (const line of report) {
    console.log(line);
  }

  const exitCode = failedChecks > 0 ? 1 : 0;
  process.exit(exitCode);
}

main();
