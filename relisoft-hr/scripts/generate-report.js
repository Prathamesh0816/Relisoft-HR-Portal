import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REQUIRED_SECTIONS = ['Overview', 'Features', 'Data Model', 'API Endpoints', 'Business Rules'];
const ENDPOINT_REGEX = /`(GET|POST|PUT|PATCH|DELETE)`\s+`(\/[^`]+)`/g;

function readSpecFiles() {
  const modulesDir = path.join(rootDir, 'specs/modules');
  if (!fs.existsSync(modulesDir)) return [];
  return fs.readdirSync(modulesDir).filter(f => f.endsWith('.md'));
}

function analyzeSpec(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  const foundSections = {};
  for (const section of REQUIRED_SECTIONS) {
    const regex = new RegExp(`^## ${section}$`, 'm');
    foundSections[section] = regex.test(content);
  }

  const endpointMatches = [];
  let match;
  while ((match = ENDPOINT_REGEX.exec(content)) !== null) {
    endpointMatches.push({ method: match[1], path: match[2] });
  }

  const featureCount = (content.match(/^-\s+.+$/gm) || []).length;
  const ruleCount = (content.match(/^-\s+.+$/gm) || []).length;

  const modelHeaders = content.match(/^###\s+(.+)$/gm) || [];
  const modelCount = modelHeaders.length;

  const allSectionsFound = REQUIRED_SECTIONS.every(s => foundSections[s]);

  return {
    fileName,
    title: (content.match(/^#\s+(.+)$/m) || [])[1] || fileName,
    sections: foundSections,
    allSectionsFound,
    endpoints: endpointMatches,
    endpointCount: endpointMatches.length,
    modelCount,
    featureCount,
    ruleCount,
    contentLength: content.length,
  };
}

function checkImplementation(specFileName) {
  const moduleName = specFileName.replace('.md', '').replace(/-/g, '_');
  const modulePath = specFileName.replace('.md', '').replace(/_/g, '-');

  const modelFile = path.join(rootDir, 'server/models', `${modulePath}.js`);
  const controllerFile = path.join(rootDir, 'server/controllers', `${modulePath}Controller.js`);
  const routesFile = path.join(rootDir, 'server/routes', `${modulePath}Routes.js`);

  return {
    hasModel: fs.existsSync(modelFile),
    hasController: fs.existsSync(controllerFile),
    hasRoutes: fs.existsSync(routesFile),
    modelFile: fs.existsSync(modelFile) ? `server/models/${modulePath}.js` : null,
    controllerFile: fs.existsSync(controllerFile) ? `server/controllers/${modulePath}Controller.js` : null,
    routesFile: fs.existsSync(routesFile) ? `server/routes/${modulePath}Routes.js` : null,
  };
}

function readReviewStatus() {
  const reviewDbPath = path.join(rootDir, 'data', 'reviews.json');
  if (!fs.existsSync(reviewDbPath)) return { total: 0, pending: 0, approved: 0, rejected: 0, changesRequested: 0, items: [] };

  try {
    const data = JSON.parse(fs.readFileSync(reviewDbPath, 'utf-8'));
    return {
      total: data.length,
      pending: data.filter(r => r.status === 'pending').length,
      approved: data.filter(r => r.status === 'approved').length,
      rejected: data.filter(r => r.status === 'rejected').length,
      changesRequested: data.filter(r => r.status === 'changes_requested').length,
      items: data,
    };
  } catch {
    return { total: 0, pending: 0, approved: 0, rejected: 0, changesRequested: 0, items: [] };
  }
}

function readTestReport() {
  const testReportPath = path.join(rootDir, 'data', 'test-report.json');
  if (!fs.existsSync(testReportPath)) return null;

  try {
    return JSON.parse(fs.readFileSync(testReportPath, 'utf-8'));
  } catch {
    return null;
  }
}

function readAIGenerationHistory() {
  const historyPaths = [
    path.join(rootDir, 'logs', 'ai-audit.json'),
  ];

  if (fs.existsSync(historyPaths[0])) {
    try {
      const data = fs.readFileSync(historyPaths[0], 'utf-8');
      const lines = data.trim().split('\n').filter(Boolean);
      return lines.map(l => {
        try { return JSON.parse(l); } catch { return null; }
      }).filter(Boolean);
    } catch {
      return [];
    }
  }
  return [];
}

function generateModuleReport(specAnalyses) {
  console.log('\n--- Module Spec Completeness ---');
  console.log('='.repeat(80));
  console.log('Module'.padEnd(30) + 'Status'.padEnd(12) + 'Endpoints'.padEnd(12) + 'Models'.padEnd(10) + 'Sections');
  console.log('-'.repeat(80));

  let complete = 0;
  for (const spec of specAnalyses) {
    const status = spec.allSectionsFound ? 'COMPLETE' : 'INCOMPLETE';
    if (spec.allSectionsFound) complete++;
    const missingSections = REQUIRED_SECTIONS.filter(s => !spec.sections[s]);
    const sectionStr = missingSections.length > 0 ? `Missing: ${missingSections.join(', ')}` : 'All present';
    console.log(
      spec.title.substring(0, 28).padEnd(30) +
      status.padEnd(12) +
      String(spec.endpointCount).padEnd(12) +
      String(spec.modelCount).padEnd(10) +
      sectionStr
    );
  }
  console.log('-'.repeat(80));
  console.log(`Total: ${specAnalyses.length} modules, ${complete} complete, ${specAnalyses.length - complete} incomplete`);
  return { complete, incomplete: specAnalyses.length - complete };
}

function generateImplementationReport(specAnalyses) {
  console.log('\n--- Implementation Status ---');
  console.log('='.repeat(80));
  console.log('Module'.padEnd(30) + 'Model'.padEnd(10) + 'Controller'.padEnd(14) + 'Routes'.padEnd(10) + 'Status');
  console.log('-'.repeat(80));

  let implemented = 0;
  let partial = 0;
  let none = 0;

  for (const spec of specAnalyses) {
    const impl = checkImplementation(spec.fileName);
    const parts = [impl.hasModel, impl.hasController, impl.hasRoutes];
    const count = parts.filter(Boolean).length;

    const statusStr = count === 3 ? 'FULL' : count === 0 ? 'NONE' : 'PARTIAL';
    if (count === 3) implemented++;
    else if (count === 0) none++;
    else partial++;

    console.log(
      spec.title.substring(0, 28).padEnd(30) +
      (impl.hasModel ? 'YES' : 'NO').padEnd(10) +
      (impl.hasController ? 'YES' : 'NO').padEnd(14) +
      (impl.hasRoutes ? 'YES' : 'NO').padEnd(10) +
      statusStr
    );
  }
  console.log('-'.repeat(80));
  console.log(`Fully implemented: ${implemented}, Partial: ${partial}, Not implemented: ${none}`);
  return { implemented, partial, none };
}

function generateReviewReport(reviewStatus) {
  console.log('\n--- Review Status ---');
  console.log('='.repeat(80));

  if (reviewStatus.total === 0) {
    console.log('No reviews in queue.');
    return;
  }

  console.log(`Total Reviews:    ${reviewStatus.total}`);
  console.log(`Pending:          ${reviewStatus.pending}`);
  console.log(`Approved:         ${reviewStatus.approved}`);
  console.log(`Rejected:         ${reviewStatus.rejected}`);
  console.log(`Changes Requested: ${reviewStatus.changesRequested}`);

  if (reviewStatus.pending > 0) {
    console.log('\nPending Items (oldest first):');
    const pending = reviewStatus.items
      .filter(r => r.status === 'pending')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    for (const item of pending.slice(0, 10)) {
      console.log(`  #${item.id} - ${item.type} (${new Date(item.createdAt).toLocaleDateString()})`);
    }
    if (pending.length > 10) {
      console.log(`  ... and ${pending.length - 10} more`);
    }
  }
}

function generateTestReport(testReport) {
  console.log('\n--- Test Results ---');
  console.log('='.repeat(80));

  if (!testReport) {
    console.log('No test report found. Run node scripts/run-tests.js first.');
    return;
  }

  console.log(`Timestamp:   ${new Date(testReport.timestamp).toLocaleString()}`);
  console.log(`Total Tests: ${testReport.totalTests}`);
  console.log(`Passed:      ${testReport.passedTests}`);
  console.log(`Failed:      ${testReport.failedTests}`);
  console.log(`Skipped:     ${testReport.skippedTests}`);
  const pct = testReport.totalTests > 0 ? Math.round((testReport.passedTests / testReport.totalTests) * 100) : 0;
  console.log(`Score:       ${pct}%`);

  if (testReport.failures && testReport.failures.length > 0) {
    console.log('\nFailures:');
    for (const failure of testReport.failures.slice(0, 10)) {
      console.log(`  - [${failure.type}] ${failure.message}`);
    }
    if (testReport.failures.length > 10) {
      console.log(`  ... and ${testReport.failures.length - 10} more`);
    }
  }
}

function generateAIReport(aiHistory) {
  console.log('\n--- AI Generation History ---');
  console.log('='.repeat(80));

  if (aiHistory.length === 0) {
    console.log('No AI generation history found.');
    return;
  }

  console.log(`Total AI Interactions: ${aiHistory.length}`);

  const byType = {};
  for (const entry of aiHistory) {
    const type = entry.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  }

  console.log('By type:');
  for (const [type, count] of Object.entries(byType)) {
    console.log(`  ${type}: ${count}`);
  }

  const recentEntries = aiHistory.slice(-5).reverse();
  console.log('\nRecent activity:');
  for (const entry of recentEntries) {
    const date = new Date(entry.timestamp || entry.createdAt).toLocaleString();
    const summary = entry.prompt ? entry.prompt.substring(0, 80) : (entry.type || 'interaction');
    console.log(`  [${date}] ${summary}`);
  }
}

function generateComplianceScore(specAnalyses, reviewStatus, testReport) {
  console.log('\n--- Overall SDD Compliance Score ---');
  console.log('='.repeat(80));

  const specWeight = 0.4;
  const implWeight = 0.3;
  const testWeight = 0.2;
  const reviewWeight = 0.1;

  const specComplete = specAnalyses.filter(s => s.allSectionsFound).length;
  const specScore = specAnalyses.length > 0 ? specComplete / specAnalyses.length : 0;

  let implScores = 0;
  for (const spec of specAnalyses) {
    const impl = checkImplementation(spec.fileName);
    implScores += [impl.hasModel, impl.hasController, impl.hasRoutes].filter(Boolean).length;
  }
  const implScore = specAnalyses.length > 0 ? implScores / (specAnalyses.length * 3) : 0;

  let testScore = 0;
  if (testReport && testReport.totalTests > 0) {
    testScore = testReport.passedTests / testReport.totalTests;
  }

  let reviewScore = 0;
  if (reviewStatus.total > 0) {
    reviewScore = (reviewStatus.approved + reviewStatus.changesRequested) / reviewStatus.total;
  }

  const complianceScore = (specScore * specWeight + implScore * implWeight + testScore * testWeight + reviewScore * reviewWeight) * 100;

  console.log(`Spec Completeness:    ${(specScore * 100).toFixed(1)}% (weight: ${(specWeight * 100)}%)`);
  console.log(`Implementation:       ${(implScore * 100).toFixed(1)}% (weight: ${(implWeight * 100)}%)`);
  console.log(`Test Coverage:        ${(testScore * 100).toFixed(1)}% (weight: ${(testWeight * 100)}%)`);
  console.log(`Review Resolution:    ${(reviewScore * 100).toFixed(1)}% (weight: ${(reviewWeight * 100)}%)`);
  console.log('-'.repeat(80));
  console.log(`SDD Compliance Score: ${complianceScore.toFixed(1)}%`);

  let grade = 'F';
  if (complianceScore >= 90) grade = 'A';
  else if (complianceScore >= 80) grade = 'B';
  else if (complianceScore >= 70) grade = 'C';
  else if (complianceScore >= 60) grade = 'D';
  console.log(`Grade: ${grade}`);

  return { score: complianceScore, grade };
}

function main() {
  const args = process.argv.slice(2);
  const outputJson = args.includes('--json');
  const outputFile = args.find(a => a.startsWith('--output='));

  console.log('SDD Compliance Report');
  console.log('=====================\n');
  console.log(`Generated: ${new Date().toLocaleString()}\n`);

  const specFiles = readSpecFiles();
  const specAnalyses = specFiles.map(f => analyzeSpec(path.join(rootDir, 'specs/modules', f)));
  const reviewStatus = readReviewStatus();
  const testReport = readTestReport();
  const aiHistory = readAIGenerationHistory();

  if (specAnalyses.length === 0) {
    console.log('No spec files found in specs/modules/. Run init-sdd.js first.');
    process.exit(0);
  }

  const moduleResult = generateModuleReport(specAnalyses);
  const implResult = generateImplementationReport(specAnalyses);
  generateReviewReport(reviewStatus);
  generateTestReport(testReport);
  generateAIReport(aiHistory);
  const compliance = generateComplianceScore(specAnalyses, reviewStatus, testReport);

  const fullReport = {
    generatedAt: new Date().toISOString(),
    modules: specAnalyses,
    implementation: implResult,
    reviews: reviewStatus,
    tests: testReport,
    aiHistory: aiHistory.length,
    compliance,
  };

  if (outputJson) {
    console.log('\n--- JSON Output ---');
    console.log(JSON.stringify(fullReport, null, 2));
  }

  if (outputFile) {
    const filePath = path.resolve(rootDir, outputFile.split('=')[1]);
    fs.writeFileSync(filePath, JSON.stringify(fullReport, null, 2), 'utf-8');
    console.log(`\nReport saved to: ${path.relative(rootDir, filePath)}`);
  }

  const defaultReportPath = path.join(rootDir, 'data', 'sdd-report.json');
  const reportDir = path.dirname(defaultReportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  fs.writeFileSync(defaultReportPath, JSON.stringify(fullReport, null, 2), 'utf-8');
  console.log(`Report saved to: data/sdd-report.json`);

  const exitCode = compliance.score < 60 ? 1 : 0;
  process.exit(exitCode);
}

main();
