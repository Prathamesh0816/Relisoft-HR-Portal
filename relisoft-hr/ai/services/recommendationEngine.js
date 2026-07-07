import aiService from './aiService.js';

class RecommendationEngine {
  constructor() {
    this.recommendationCache = new Map();
    this.cacheTTL = 3600000;
  }

  async getJobRecommendations(candidateProfile, openPositions) {
    const cacheKey = `job_${candidateProfile.id || candidateProfile.email}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const systemPrompt = `You are an AI recruitment advisor. Match the candidate to suitable job positions.

For each position, analyze:
- Skills match (weight: 0.4)
- Experience match (weight: 0.3)
- Education match (weight: 0.15)
- Domain/Industry match (weight: 0.15)

Return a JSON array sorted by overall score descending:
[{
  "positionId": "id",
  "title": "Job Title",
  "score": 0.0-1.0,
  "skillMatch": 0.0-1.0,
  "experienceMatch": 0.0-1.0,
  "educationMatch": 0.0-1.0,
  "strengths": ["strength for this role"],
  "gaps": ["skill gaps"],
  "reason": "Why this role is a good fit"
}]`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Candidate Profile:\n${JSON.stringify(candidateProfile, null, 2)}\n\nOpen Positions:\n${JSON.stringify(openPositions, null, 2)}`
        }
      ], { temperature: 0.2 });

      const recommendations = typeof response === 'object' ? response : JSON.parse(response);
      this._setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('RecommendationEngine: Failed to get job recommendations', error.message);
      return this._fallbackJobMatch(candidateProfile, openPositions);
    }
  }

  async getTrainingRecommendations(employeeProfile, performanceData, availableCourses) {
    const cacheKey = `training_${employeeProfile.id || employeeProfile.email}`;
    const cached = this._getFromCache(cacheKey);
    if (cached) return cached;

    const systemPrompt = `You are an AI learning & development advisor. Recommend training courses based on employee performance gaps and career goals.

Analyze:
1. Performance gaps (areas where score < target)
2. Missing skills for current role
3. Skills needed for next career level
4. Employee's learning preferences

Return JSON array:
[{
  "courseId": "id",
  "title": "Course Name",
  "reason": "Why this course is recommended",
  "priority": "high" | "medium" | "low",
  "gapAddressed": "Which gap this fills",
  "estimatedDuration": "X hours/days",
  "type": "technical" | "soft_skill" | "leadership" | "compliance"
}]`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Employee: ${JSON.stringify(employeeProfile)}\nPerformance: ${JSON.stringify(performanceData)}\nAvailable Courses: ${JSON.stringify(availableCourses)}`
        }
      ], { temperature: 0.2 });

      const recommendations = typeof response === 'object' ? response : JSON.parse(response);
      this._setCache(cacheKey, recommendations);
      return recommendations;
    } catch (error) {
      console.error('RecommendationEngine: Failed to get training recommendations', error.message);
      return this._fallbackTrainingRecommendation(employeeProfile, performanceData, availableCourses);
    }
  }

  async getCareerPathSuggestions(employeeProfile, careerPaths) {
    const systemPrompt = `You are an AI career development advisor. Suggest career progression paths for the employee.

Analyze:
- Current role and level
- Skills and competencies
- Performance history
- Career aspirations
- Available career paths in the organization

Return JSON:
{
  "currentRole": "Current Position",
  "suggestedPaths": [{
    "pathName": "e.g., Technical Leadership",
    "nextRole": "Next recommended role",
    "timeline": "6-12 months",
    "gapAnalysis": { "skills": ["missing skills"], "experience": ["missing experience"] },
    "developmentPlan": ["step1", "step2"],
    "probability": 0.0-1.0
  }],
  "longTermPotential": ["CTO", "VP Engineering"]
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Employee Profile:\n${JSON.stringify(employeeProfile, null, 2)}\n\nCareer Paths:\n${JSON.stringify(careerPaths, null, 2)}`
        }
      ], { temperature: 0.3 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('RecommendationEngine: Career path suggestion failed', error.message);
      return { currentRole: employeeProfile.position, suggestedPaths: [], longTermPotential: [] };
    }
  }

  async getSuccessionPlanning(role, potentialCandidates) {
    const systemPrompt = `You are an AI succession planning advisor. Evaluate candidates for succession to a critical role.

For each candidate analyze:
- Readiness level (Now / 6-12 months / 1-2 years / 2+ years)
- Skill alignment with target role
- Leadership potential
- Risk of departure
- Development needed before promotion

Return JSON:
{
  "targetRole": "Role Name",
  "riskLevel": "low" | "medium" | "high",
  "successors": [{
    "candidateId": "id",
    "name": "Name",
    "readiness": "Now" | "6-12 months" | "1-2 years",
    "score": 0.0-1.0,
    "strengths": [],
    "developmentAreas": [],
    "recommendedAction": "Action plan"
  }],
  "gapAnalysis": "Overall talent gap assessment"
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Target Role:\n${JSON.stringify(role, null, 2)}\n\nPotential Candidates:\n${JSON.stringify(potentialCandidates, null, 2)}`
        }
      ], { temperature: 0.2 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('RecommendationEngine: Succession planning failed', error.message);
      return { targetRole: role.title, riskLevel: 'medium', successors: [], gapAnalysis: '' };
    }
  }

  async getLearningRecommendations(employeeProfile, learningHistory, contentLibrary) {
    const systemPrompt = `You are an AI learning content curator. Recommend specific learning content from the library.

Consider:
- Employee's current role and skills
- Past learning history (avoid repeats)
- Learning style preferences
- Career goals
- Content quality and relevance

Return JSON array:
[{
  "contentId": "id",
  "title": "Content Title",
  "type": "video" | "article" | "course" | "book" | "workshop",
  "relevanceScore": 0.0-1.0,
  "estimatedTime": "X mins",
  "reason": "Why this content"
}]`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Employee:\n${JSON.stringify(employeeProfile)}\n\nLearning History:\n${JSON.stringify(learningHistory)}\n\nContent Library:\n${JSON.stringify(contentLibrary)}`
        }
      ], { temperature: 0.25 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('RecommendationEngine: Learning recommendations failed', error.message);
      return [];
    }
  }

  _fallbackJobMatch(candidate, positions) {
    const candidateSkills = new Set((candidate.skills || []).map(s => s.toLowerCase()));
    return positions.map(pos => {
      const requiredSkills = new Set((pos.requiredSkills || []).map(s => s.toLowerCase()));
      let matches = 0;
      for (const skill of requiredSkills) {
        if (candidateSkills.has(skill)) matches++;
      }
      const score = requiredSkills.size > 0 ? matches / requiredSkills.size : 0;
      return {
        positionId: pos.id,
        title: pos.title,
        score: Math.min(score + 0.1, 1.0),
        strengths: [...candidateSkills].filter(s => requiredSkills.has(s)),
        gaps: [...requiredSkills].filter(s => !candidateSkills.has(s))
      };
    }).sort((a, b) => b.score - a.score);
  }

  _fallbackTrainingRecommendation(employee, performance, courses) {
    const weakAreas = (performance.gaps || [])
      .filter(g => g.score < (g.target || 3))
      .map(g => g.area?.toLowerCase());

    return (courses || [])
      .filter(c => weakAreas.some(wa => (c.tags || []).some(t => t.toLowerCase().includes(wa))))
      .map(c => ({
        courseId: c.id,
        title: c.title,
        priority: 'medium',
        gapAddressed: c.tags?.join(', ') || 'General improvement',
        estimatedDuration: c.duration || 'Self-paced'
      }));
  }

  clearCache() {
    this.recommendationCache.clear();
  }

  _getFromCache(key) {
    const cached = this.recommendationCache.get(key);
    if (cached && (Date.now() - cached.timestamp < this.cacheTTL)) {
      return cached.data;
    }
    this.recommendationCache.delete(key);
    return null;
  }

  _setCache(key, data) {
    this.recommendationCache.set(key, { data, timestamp: Date.now() });
  }
}

export default new RecommendationEngine();
