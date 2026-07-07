import aiService from '../services/aiService.js';

class ReviewBot {
  constructor() {
    this.reviewHistory = new Map();
    this.severityLevels = ['critical', 'high', 'medium', 'low', 'info'];
  }

  async reviewCode(codeContent, specContent, options = {}) {
    const review = {
      reviewedAt: new Date().toISOString(),
      summary: '',
      score: 0,
      comments: [],
      specCompliance: { score: 0, issues: [] },
      securityIssues: [],
      bugs: [],
      styleIssues: [],
      suggestions: [],
      passed: false
    };

    const [specCompliance, bugs, security, style, suggestions] = await Promise.all([
      this._checkSpecCompliance(codeContent, specContent),
      this._findBugs(codeContent),
      this._checkSecurity(codeContent),
      this._checkStyle(codeContent),
      this._getSuggestions(codeContent)
    ]);

    review.specCompliance = specCompliance;
    review.bugs = bugs;
    review.securityIssues = security;
    review.styleIssues = style;
    review.suggestions = suggestions;

    const allIssues = [...bugs, ...security, ...style];
    review.score = this._calculateScore(codeContent, allIssues);
    review.summary = this._generateSummary(review);
    review.passed = review.score >= (options.passThreshold || 0.7);
    review.comments = this._generateReviewComments(review);

    return review;
  }

  async reviewGeneratedCode(generatedFile, specFile) {
    const fs = require('fs');
    const codeContent = fs.readFileSync(generatedFile, 'utf-8');
    const specContent = fs.readFileSync(specFile, 'utf-8');

    const review = await this.reviewCode(codeContent, specContent);

    review.fileReviewed = generatedFile;
    review.specFile = specFile;

    this.reviewHistory.set(generatedFile, review);
    return review;
  }

  async _checkSpecCompliance(code, spec) {
    const systemPrompt = `You are a spec compliance checker. Compare the generated code against the specification.

Analyze:
1. Does the code implement all entities/endpoints from the spec?
2. Are all fields from the spec present in the code?
3. Are the data types correct?
4. Are the business rules implemented?
5. Are the validation rules followed?
6. Are the security requirements met?

Return JSON:
{
  "score": 0.0-1.0,
  "issues": [{
    "severity": "critical"|"high"|"medium"|"low",
    "type": "missing_implementation"|"type_mismatch"|"missing_field"|"rule_not_implemented",
    "specReference": "section/field",
    "description": "What's wrong",
    "suggestion": "How to fix"
  }]
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Specification:\n${spec}\n\nGenerated Code:\n${code}`
        }
      ], { temperature: 0.1 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch {
      return { score: 0.5, issues: [{ severity: 'medium', type: 'review_error', description: 'AI review failed, manual review needed' }] };
    }
  }

  async _findBugs(code) {
    const systemPrompt = `You are a code review AI specialized in finding bugs. Analyze the code for:

1. Logic errors (off-by-one, incorrect conditions, etc.)
2. Runtime errors (null reference, undefined access, etc.)
3. Async issues (missing await, unhandled promises, etc.)
4. Data flow issues (incorrect transformations, etc.)
5. Error handling gaps (uncaught exceptions, etc.)
6. Race conditions

Return a JSON array:
[{
  "severity": "critical"|"high"|"medium"|"low",
  "type": "logic_error"|"runtime_error"|"async_issue"|"data_flow"|"error_handling",
  "lineNumber": number,
  "code": "relevant code snippet",
  "description": "What the bug is",
  "fix": "How to fix it",
  "impact": "What could go wrong"
}]`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ], { temperature: 0.1 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch {
      return [];
    }
  }

  async _checkSecurity(code) {
    const systemPrompt = `You are a security code review AI. Check for security vulnerabilities:

1. SQL/NoSQL injection risks
2. XSS vulnerabilities
3. Authentication/authorization flaws
4. Sensitive data exposure (keys, passwords in code)
5. Insecure direct object references (IDOR)
6. Mass assignment vulnerabilities
7. CSRF vulnerabilities
8. Insecure deserialization
9. Path traversal
10. Command injection

Return a JSON array:
[{
  "severity": "critical"|"high"|"medium"|"low",
  "type": "injection"|"xss"|"auth"|"exposure"|"idor"|"mass_assignment"|"csrf"|"other",
  "lineNumber": number,
  "code": "relevant code",
  "cwe": "CWE-XX",
  "description": "Security issue description",
  "fix": "How to remediate",
  "owaspTop10": "Corresponding OWASP Top 10 category"
}]`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ], { temperature: 0.1 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch {
      return [];
    }
  }

  async _checkStyle(code) {
    const issues = [];

    if (code.includes('console.log')) {
      issues.push({ severity: 'low', type: 'debug_code', description: 'Remove console.log statements before production', lineNumber: this._findLineNumber(code, 'console.log') });
    }

    if (code.includes('TODO')) {
      issues.push({ severity: 'info', type: 'incomplete', description: 'There are TODO items that need implementation', lineNumber: this._findLineNumber(code, 'TODO') });
    }

    if (code.includes('var ')) {
      issues.push({ severity: 'medium', type: 'style', description: 'Use const/let instead of var', lineNumber: this._findLineNumber(code, 'var ') });
    }

    if (code.includes('any ') || code.includes(': any')) {
      issues.push({ severity: 'low', type: 'typing', description: 'Avoid using "any" type, use specific types instead' });
    }

    const functionLengths = this._getFunctionLengths(code);
    for (const [name, length] of Object.entries(functionLengths)) {
      if (length > 50) {
        issues.push({ severity: 'medium', type: 'long_function', description: `Function "${name}" is ${length} lines long. Consider breaking it down.` });
      }
    }

    return issues;
  }

  async _getSuggestions(code) {
    const systemPrompt = `You are a code review AI. Suggest improvements for the following code.

Focus on:
1. Performance improvements
2. Code readability
3. Maintainability
4. Best practices
5. Modern language features

Return a JSON array of suggestion strings.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: code }
      ], { temperature: 0.3 });

      const parsed = typeof response === 'object' ? response : JSON.parse(response);
      return Array.isArray(parsed) ? parsed : (parsed.suggestions || []);
    } catch {
      return [];
    }
  }

  _calculateScore(code, issues) {
    const severityWeights = { critical: 0.4, high: 0.25, medium: 0.15, low: 0.05, info: 0 };
    let totalPenalty = 0;

    for (const issue of issues) {
      totalPenalty += severityWeights[issue.severity] || 0.05;
    }

    const baseScore = 1.0 - Math.min(totalPenalty, 0.8);
    const codeLines = code.split('\n').length;
    const complexityBonus = Math.min(codeLines > 50 ? 0.05 : 0, 0.05);

    return Math.round(Math.min(baseScore + complexityBonus, 1.0) * 100) / 100;
  }

  _generateSummary(review) {
    const totalIssues = review.bugs.length + review.securityIssues.length + review.styleIssues.length + review.specCompliance.issues.length;
    const criticalCount = [...review.bugs, ...review.securityIssues, ...review.specCompliance.issues].filter(i => i.severity === 'critical').length;

    if (criticalCount > 0) {
      return `Review failed with ${criticalCount} critical issue(s). Score: ${(review.score * 100).toFixed(0)}%. Requires fixes before approval.`;
    }
    if (totalIssues === 0) {
      return `Code looks clean. No issues found. Score: ${(review.score * 100).toFixed(0)}%.`;
    }
    return `Review complete. Found ${totalIssues} issue(s) (${criticalCount} critical). Score: ${(review.score * 100).toFixed(0)}%. ${review.passed ? 'Passed.' : 'Needs improvements.'}`;
  }

  _generateReviewComments(review) {
    const comments = [];

    if (review.score >= 0.9) {
      comments.push('Excellent code quality. Few improvements suggested.');
    } else if (review.score >= 0.7) {
      comments.push('Good code quality. Address the medium and low severity issues.');
    } else {
      comments.push('Code needs significant improvements. Review all issues carefully.');
    }

    if (review.specCompliance.score < 0.8) {
      comments.push('Spec compliance is below threshold. Verify all spec requirements are implemented.');
    }

    for (const bug of review.bugs.slice(0, 3)) {
      comments.push(`[BUG-${bug.severity}] ${bug.description} (line ${bug.lineNumber || 'N/A'})`);
    }

    for (const sec of review.securityIssues.slice(0, 3)) {
      comments.push(`[SEC-${sec.severity}] ${sec.description} (${sec.owaspTop10 || 'security'})`);
    }

    return comments;
  }

  _findLineNumber(code, pattern) {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) return i + 1;
    }
    return -1;
  }

  _getFunctionLengths(code) {
    const lengths = {};
    const funcRegex = /(?:async\s+)?(?:function\s+(\w+)|(\w+)\s*=\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/g;
    const lines = code.split('\n');
    let match;

    while ((match = funcRegex.exec(code)) !== null) {
      const name = match[1] || match[2];
      const startLine = code.substring(0, match.index).split('\n').length;
      let braceCount = 0;
      let funcStarted = false;
      let endLine = startLine;

      for (let i = startLine - 1; i < lines.length; i++) {
        for (const ch of lines[i]) {
          if (ch === '{') { braceCount++; funcStarted = true; }
          if (ch === '}') braceCount--;
        }
        if (funcStarted && braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }

      lengths[name] = endLine - startLine + 1;
    }

    return lengths;
  }

  getReviewHistory() {
    return Object.fromEntries(this.reviewHistory);
  }
}

export default ReviewBot;
