import fs from 'fs';
import path from 'path';
import aiService from '../services/aiService.js';

class DocGenAgent {
  constructor(outputPath = './docs') {
    this.outputPath = outputPath;
  }

  async generateAPIDocumentation(codeFiles, options = {}) {
    const systemPrompt = `You are a technical documentation generator. Generate comprehensive API documentation.

For each endpoint, document:
- HTTP method and path
- Description and purpose
- Request headers (auth, content-type)
- Request body schema with field descriptions
- Response format with status codes
- Example requests and responses
- Error responses
- Authentication requirements
- Rate limiting info

Format as Markdown.`;

    const docs = [];

    for (const file of codeFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const fileName = path.basename(file, '.js');

      try {
        const response = await aiService.generateResponse([
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate API documentation for this Express route/controller file:\n\n${content}`
          }
        ], { temperature: 0.15 });

        const outputFile = path.join(this.outputPath, 'api', `${fileName}.md`);
        await this._writeDoc(outputFile, response);
        docs.push({ file: outputFile, source: file });
      } catch (error) {
        console.error(`DocGenAgent: Failed to document ${file}`, error.message);
      }
    }

    return docs;
  }

  async generateUserGuide(specs, options = {}) {
    const systemPrompt = `You are a technical writer. Generate a user guide from the feature specification.

Include:
1. Feature overview and purpose
2. Prerequisites and access requirements
3. Step-by-step usage instructions
4. Screenshot descriptions (mark placeholders)
5. Common use cases
6. Troubleshooting section
7. FAQ
8. Related features

Format as clean Markdown suitable for end users.`;

    const guide = [];

    for (const spec of specs) {
      const specContent = typeof spec === 'string' ? fs.readFileSync(spec, 'utf-8') : JSON.stringify(spec, null, 2);

      try {
        const response = await aiService.generateResponse([
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Generate a user guide for this feature:\n\n${specContent}`
          }
        ], { temperature: 0.25 });

        const title = typeof spec === 'string' ? path.basename(spec, '.json') : (spec.title || 'feature');
        const outputFile = path.join(this.outputPath, 'guides', `${title}-guide.md`);
        await this._writeDoc(outputFile, response);
        guide.push({ file: outputFile, title });
      } catch (error) {
        console.error('DocGenAgent: User guide generation failed', error.message);
      }
    }

    return guide;
  }

  async generateChangelog(gitLog, options = {}) {
    const systemPrompt = `You are a release notes writer. Generate a changelog from the git commit history.

Group changes by type:
- Features: New functionality
- Improvements: Enhancements to existing features
- Bug Fixes: Defect resolutions
- Performance: Performance optimizations
- Security: Security patches
- Deprecations: Features being removed
- Documentation: Doc changes

For each entry, write a concise, user-friendly description.

Format as Markdown with version headings and dates.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Git commit history:\n\n${gitLog}`
        }
      ], { temperature: 0.2 });

      const outputFile = path.join(this.outputPath, 'CHANGELOG.md');
      await this._writeDoc(outputFile, response);
      return [{ file: outputFile }];
    } catch (error) {
      console.error('DocGenAgent: Changelog generation failed', error.message);

      const basic = this._fallbackChangelog(gitLog);
      const outputFile = path.join(this.outputPath, 'CHANGELOG.md');
      await this._writeDoc(outputFile, basic);
      return [{ file: outputFile }];
    }
  }

  async generateInlineDocs(codeFile, options = {}) {
    const content = fs.readFileSync(codeFile, 'utf-8');
    const fileName = path.basename(codeFile);

    const systemPrompt = `You are a code documentation AI. Add JSDoc comments to the following code.

For each function/class/method add:
- Description of what it does
- @param tags with types and descriptions
- @returns tag with type and description
- @throws tags if applicable
- @example for complex functions

Return the COMPLETE file with JSDoc comments added. Do not skip any code.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: content }
      ], { temperature: 0.1 });

      const documentedCode = this._extractCode(response);
      const backupFile = path.join(this.outputPath, 'inline', `${fileName}.documented.js`);

      await this._writeDoc(backupFile, documentedCode);
      return [{ file: backupFile, original: codeFile }];
    } catch (error) {
      console.error(`DocGenAgent: Inline docs generation failed for ${fileName}`, error.message);
      return [];
    }
  }

  async generateReadme(projectInfo, fileTree, options = {}) {
    const systemPrompt = `You are a technical writer. Generate a comprehensive README.md for the project.

Include:
1. Project title and description
2. Table of contents
3. Features
4. Tech stack
5. Prerequisites
6. Installation instructions
7. Configuration (environment variables)
8. Usage guide (with examples)
9. API documentation section
10. Project structure
11. Testing instructions
12. Deployment guide
13. Contributing guidelines
14. License

Adapt the level of detail to the project size indicated by the file tree.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Project Information:\n${JSON.stringify(projectInfo, null, 2)}\n\nFile Structure:\n${fileTree}`
        }
      ], { temperature: 0.25 });

      const outputFile = path.join(this.outputPath, 'README.md');
      await this._writeDoc(outputFile, response);
      return [{ file: outputFile }];
    } catch (error) {
      console.error('DocGenAgent: README generation failed', error.message);
      return [];
    }
  }

  async _writeDoc(filePath, content) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });

    const header = `<!-- Auto-generated by ReliSoft DocGenAgent -->\n<!-- Generated: ${new Date().toISOString()} -->\n\n`;
    fs.writeFileSync(filePath, header + content, 'utf-8');
    console.log(`Documentation generated: ${filePath}`);
  }

  _extractCode(response) {
    const codeBlock = response.match(/```(?:javascript|js)?\s*([\s\S]*?)```/);
    return codeBlock ? codeBlock[1].trim() : response.trim();
  }

  _fallbackChangelog(gitLog) {
    const lines = gitLog.split('\n').filter(l => l.trim());
    let changelog = '# Changelog\n\n';

    const date = new Date().toISOString().split('T')[0];
    changelog += `## [Unreleased] - ${date}\n\n`;

    for (const line of lines) {
      if (line.startsWith('commit ')) continue;
      if (line.startsWith('Author:')) continue;
      if (line.startsWith('Date:')) continue;
      if (line.startsWith('    ')) {
        changelog += `- ${line.trim()}\n`;
      }
    }

    return changelog;
  }
}

export default DocGenAgent;
