import aiService from './aiService.js';

class ResumeParser {
  constructor() {
    this.skillsDatabase = this._loadSkillsDatabase();
  }

  async parse(resumeText, jobDescription = null) {
    const extracted = await this._extractWithAI(resumeText);
    const enriched = this._enrichWithSkillDatabase(extracted);
    let matchResult = null;

    if (jobDescription) {
      matchResult = await this.calculateMatchScore(enriched, jobDescription);
    }

    return {
      parsed: enriched,
      match: matchResult,
      summary: this._generateSummary(enriched, matchResult),
      raw: resumeText.substring(0, 1000)
    };
  }

  async _extractWithAI(text) {
    const systemPrompt = `You are a resume parsing AI. Extract structured data from the resume text below.

Return a JSON object with these fields:
- name (string): Full name of the candidate
- email (string): Email address
- phone (string): Phone number
- skills (array of strings): Technical and soft skills
- education (array of objects): Each with degree, institution, year, gpa (if available)
- experience (array of objects): Each with role, company, startDate, endDate, duration, responsibilities (array), technologies (array)
- certifications (array of objects): Each with name, issuer, year
- languages (array of strings): Languages spoken
- totalYearsExperience (number): Total years of professional experience
- location (string): City, State
- linkedIn (string): LinkedIn URL if present
- portfolio (string): Portfolio URL if present
- summary (string): Professional summary/objective from resume

If a field is not found, omit it rather than using null. Extract everything you can find.`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ], { temperature: 0.1 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('ResumeParser: AI extraction failed', error.message);
      return this._basicParse(text);
    }
  }

  _basicParse(text) {
    const result = {};

    const nameMatch = text.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/m);
    if (nameMatch) result.name = nameMatch[1];

    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) result.email = emailMatch[0];

    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) result.phone = phoneMatch[0];

    const skillKeywords = ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS',
      'Docker', 'Kubernetes', 'TypeScript', 'Go', 'Rust', 'C++', 'Ruby', 'PHP', 'Angular',
      'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST', 'Git', 'CI/CD'];
    const foundSkills = skillKeywords.filter(s => text.toLowerCase().includes(s.toLowerCase()));
    if (foundSkills.length > 0) result.skills = foundSkills;

    return result;
  }

  _enrichWithSkillDatabase(parsed) {
    if (!parsed.skills) return parsed;

    const enriched = { ...parsed };
    enriched.skills = parsed.skills.map(skill => {
      const dbEntry = this.skillsDatabase[skill.toLowerCase()];
      return dbEntry ? { name: skill, category: dbEntry.category, level: 'unknown' } : { name: skill, category: 'unknown' };
    });

    return enriched;
  }

  async calculateMatchScore(candidate, jobDescription) {
    const systemPrompt = `You are a recruitment AI. Compare the candidate profile against the job description and return a match analysis.

Return JSON:
{
  "overallScore": 0.0-1.0,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "experienceMatch": { "required": 5, "has": 3, "score": 0.6 },
  "educationMatch": { "required": "Bachelor's", "has": "Master's", "score": 1.0 },
  "certificationMatch": { "required": [], "has": [], "score": 0.0 },
  "strengths": ["strength1"],
  "gaps": ["gap1"],
  "recommendation": "Strong Match" | "Good Match" | "Partial Match" | "Weak Match"
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Job Description:\n${jobDescription}\n\nCandidate Profile:\n${JSON.stringify(candidate, null, 2)}`
        }
      ], { temperature: 0.15 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      return this._calculateBasicMatch(candidate, jobDescription);
    }
  }

  _calculateBasicMatch(candidate, jobDescription) {
    const jdLower = jobDescription.toLowerCase();
    const skills = (candidate.skills || []).map(s => typeof s === 'string' ? s : s.name);
    const matchedSkills = skills.filter(s => jdLower.includes(s.toLowerCase()));
    const allJdSkills = this._extractSkillsFromText(jdLower);
    const missingSkills = allJdSkills.filter(s => !skills.some(cs => cs.toLowerCase().includes(s.toLowerCase())));

    return {
      overallScore: skills.length > 0 ? matchedSkills.length / Math.max(allJdSkills.length, 1) : 0,
      matchedSkills,
      missingSkills,
      experienceMatch: { required: 0, has: candidate.totalYearsExperience || 0, score: 0.5 },
      educationMatch: { required: '', has: candidate.education?.[0]?.degree || '', score: 0.5 },
      certificationMatch: { required: [], has: candidate.certifications || [], score: 0.5 },
      strengths: matchedSkills.slice(0, 3),
      gaps: missingSkills.slice(0, 3),
      recommendation: matchedSkills.length / Math.max(allJdSkills.length, 1) > 0.7 ? 'Strong Match' : 'Partial Match'
    };
  }

  _extractSkillsFromText(text) {
    const commonSkills = ['javascript', 'python', 'java', 'react', 'node.js', 'node', 'sql', 'aws',
      'docker', 'kubernetes', 'typescript', 'go', 'rust', 'c++', 'ruby', 'php', 'angular',
      'vue', 'vue.js', 'mongodb', 'postgresql', 'postgres', 'redis', 'graphql', 'rest',
      'git', 'ci/cd', 'machine learning', 'ai', 'data science', 'agile', 'scrum',
      'html', 'css', 'sass', 'less', 'webpack', 'babel', 'jest', 'mocha', 'cypress',
      'redux', 'express', 'django', 'flask', 'spring', 'hibernate', 'terraform'];
    return commonSkills.filter(s => text.includes(s));
  }

  _generateSummary(parsed, match) {
    const parts = [];
    if (parsed.name) parts.push(parsed.name);
    if (parsed.totalYearsExperience) parts.push(`has ${parsed.totalYearsExperience} years of experience`);
    if (parsed.skills?.length) {
      const skillNames = parsed.skills.map(s => typeof s === 'string' ? s : s.name);
      parts.push(`skilled in ${skillNames.slice(0, 5).join(', ')}`);
    }
    if (parsed.education?.length) {
      parts.push(`educated at ${parsed.education[0].institution}`);
    }
    if (match) {
      parts.push(`match score: ${(match.overallScore * 100).toFixed(0)}%`);
    }
    return parts.join('. ') + '.';
  }

  _loadSkillsDatabase() {
    return {
      'javascript': { category: 'language' },
      'python': { category: 'language' },
      'java': { category: 'language' },
      'typescript': { category: 'language' },
      'react': { category: 'frontend' },
      'angular': { category: 'frontend' },
      'vue': { category: 'frontend' },
      'node.js': { category: 'backend' },
      'express': { category: 'backend' },
      'django': { category: 'backend' },
      'sql': { category: 'database' },
      'mongodb': { category: 'database' },
      'postgresql': { category: 'database' },
      'aws': { category: 'cloud' },
      'docker': { category: 'devops' },
      'kubernetes': { category: 'devops' },
      'git': { category: 'tools' },
      'machine learning': { category: 'data science' },
      'project management': { category: 'management' },
      'agile': { category: 'methodology' },
      'scrum': { category: 'methodology' }
    };
  }
}

export default new ResumeParser();
