import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const REVIEW_DB_PATH = path.join(rootDir, 'data', 'reviews.json');

function ensureDb() {
  const dir = path.dirname(REVIEW_DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(REVIEW_DB_PATH)) {
    fs.writeFileSync(REVIEW_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

function readReviews() {
  ensureDb();
  const data = fs.readFileSync(REVIEW_DB_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeReviews(reviews) {
  fs.writeFileSync(REVIEW_DB_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
}

function generateId(reviews) {
  const ids = reviews.map(r => r.id);
  let id = 1;
  while (ids.includes(id)) id++;
  return id;
}

function listPending() {
  const reviews = readReviews();
  const pending = reviews.filter(r => r.status === 'pending');

  if (pending.length === 0) {
    console.log('No pending reviews.');
    return;
  }

  console.log(`\nPending Reviews (${pending.length}):\n`);
  console.log('ID'.padEnd(6) + 'Type'.padEnd(18) + 'Requested By'.padEnd(22) + 'Date');
  console.log('-'.repeat(70));
  for (const review of pending) {
    const date = new Date(review.createdAt).toLocaleDateString();
    console.log(
      String(review.id).padEnd(6) +
      (review.type || 'N/A').padEnd(18) +
      (review.requestedBy || 'system').padEnd(22) +
      date
    );
  }
  console.log();
}

function listAll() {
  const reviews = readReviews();

  if (reviews.length === 0) {
    console.log('No reviews found.');
    return;
  }

  console.log(`\nAll Reviews (${reviews.length}):\n`);
  console.log('ID'.padEnd(6) + 'Type'.padEnd(18) + 'Status'.padEnd(16) + 'Requested By'.padEnd(22) + 'Date');
  console.log('-'.repeat(80));
  for (const review of reviews) {
    const date = new Date(review.createdAt).toLocaleDateString();
    console.log(
      String(review.id).padEnd(6) +
      (review.type || 'N/A').padEnd(18) +
      (review.status || 'N/A').padEnd(16) +
      (review.requestedBy || 'system').padEnd(22) +
      date
    );
  }
  console.log();
}

function approveReview(id) {
  const reviews = readReviews();
  const review = reviews.find(r => r.id === id);
  if (!review) {
    console.error(`Review with ID ${id} not found.`);
    process.exit(1);
  }
  if (review.status !== 'pending') {
    console.error(`Review ${id} is not pending (current status: ${review.status}).`);
    process.exit(1);
  }

  review.status = 'approved';
  review.reviewedAt = new Date().toISOString();
  writeReviews(reviews);
  console.log(`Review ${id} approved successfully.`);
  showReview(id);
}

function rejectReview(id, reason) {
  if (!reason) {
    console.error('Reason is required for rejection.');
    console.error('Usage: node scripts/review-workflow.js reject <id> <reason>');
    process.exit(1);
  }

  const reviews = readReviews();
  const review = reviews.find(r => r.id === id);
  if (!review) {
    console.error(`Review with ID ${id} not found.`);
    process.exit(1);
  }
  if (review.status !== 'pending') {
    console.error(`Review ${id} is not pending (current status: ${review.status}).`);
    process.exit(1);
  }

  review.status = 'rejected';
  review.reviewComments = reason;
  review.reviewedAt = new Date().toISOString();
  writeReviews(reviews);
  console.log(`Review ${id} rejected. Reason: ${reason}`);
  showReview(id);
}

function requestChanges(id, feedback) {
  if (!feedback) {
    console.error('Feedback is required for change requests.');
    console.error('Usage: node scripts/review-workflow.js request-changes <id> <feedback>');
    process.exit(1);
  }

  const reviews = readReviews();
  const review = reviews.find(r => r.id === id);
  if (!review) {
    console.error(`Review with ID ${id} not found.`);
    process.exit(1);
  }
  if (review.status !== 'pending') {
    console.error(`Review ${id} is not pending (current status: ${review.status}).`);
    process.exit(1);
  }

  review.status = 'changes_requested';
  review.reviewComments = feedback;
  review.reviewedAt = new Date().toISOString();
  writeReviews(reviews);
  console.log(`Changes requested for review ${id}. Feedback: ${feedback}`);
  showReview(id);
}

function showReview(id) {
  const reviews = readReviews();
  const review = reviews.find(r => r.id === id);
  if (!review) {
    console.error(`Review with ID ${id} not found.`);
    process.exit(1);
  }

  console.log('\n--- Review Details ---');
  console.log(`ID:            ${review.id}`);
  console.log(`Type:          ${review.type || 'N/A'}`);
  console.log(`Status:        ${review.status}`);
  console.log(`Requested By:  ${review.requestedBy || 'system'}`);
  console.log(`Created:       ${new Date(review.createdAt).toLocaleString()}`);
  console.log(`Reviewed At:   ${review.reviewedAt ? new Date(review.reviewedAt).toLocaleString() : 'N/A'}`);
  console.log(`Comments:      ${review.reviewComments || 'N/A'}`);

  if (review.aiPrompt) {
    console.log(`\nAI Prompt:     ${review.aiPrompt.substring(0, 200)}...`);
  }
  if (review.aiResponse) {
    const responseStr = typeof review.aiResponse === 'string' ? review.aiResponse : JSON.stringify(review.aiResponse);
    console.log(`AI Response:   ${responseStr.substring(0, 200)}...`);
  }
  if (review.generatedCode) {
    console.log(`Generated Code: ${Object.keys(review.generatedCode).join(', ')}`);
  }
  console.log();
}

function addReview({ type, specId, specFile, generatedCode, aiPrompt, aiResponse, requestedBy }) {
  const reviews = readReviews();
  const review = {
    id: generateId(reviews),
    type: type || 'ai_output',
    status: 'pending',
    specId: specId || null,
    specFile: specFile || null,
    generatedCode: generatedCode || null,
    aiPrompt: aiPrompt || null,
    aiResponse: aiResponse || null,
    requestedBy: requestedBy || 'system',
    reviewedBy: null,
    reviewComments: null,
    reviewedAt: null,
    createdAt: new Date().toISOString(),
  };
  reviews.push(review);
  writeReviews(reviews);
  return review;
}

function printUsage() {
  console.log('SDD Review Workflow CLI');
  console.log('');
  console.log('Commands:');
  console.log('  list-pending                    List items awaiting human review');
  console.log('  list-all                        List all reviews');
  console.log('  approve <id>                    Approve a pending review');
  console.log('  reject <id> <reason>            Reject with feedback');
  console.log('  request-changes <id> <feedback> Request modifications');
  console.log('  status <id>                     Get review status');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/review-workflow.js list-pending');
  console.log('  node scripts/review-workflow.js approve 1');
  console.log('  node scripts/review-workflow.js reject 1 "Missing endpoint documentation"');
  console.log('  node scripts/review-workflow.js request-changes 1 "Please add validation rules"');
  console.log('  node scripts/review-workflow.js status 1');
}

function main() {
  const command = process.argv[2];
  const arg1 = process.argv[3];
  const arg2 = process.argv.slice(4).join(' ');

  if (!command) {
    printUsage();
    process.exit(0);
  }

  switch (command) {
    case 'list-pending':
      listPending();
      break;
    case 'list-all':
      listAll();
      break;
    case 'approve':
      if (!arg1) {
        console.error('Usage: node scripts/review-workflow.js approve <id>');
        process.exit(1);
      }
      approveReview(parseInt(arg1));
      break;
    case 'reject':
      if (!arg1) {
        console.error('Usage: node scripts/review-workflow.js reject <id> <reason>');
        process.exit(1);
      }
      rejectReview(parseInt(arg1), arg2);
      break;
    case 'request-changes':
      if (!arg1) {
        console.error('Usage: node scripts/review-workflow.js request-changes <id> <feedback>');
        process.exit(1);
      }
      requestChanges(parseInt(arg1), arg2);
      break;
    case 'status':
      if (!arg1) {
        console.error('Usage: node scripts/review-workflow.js status <id>');
        process.exit(1);
      }
      showReview(parseInt(arg1));
      break;
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

export { addReview, readReviews, listPending };

main();
