import aiService from './aiService.js';

class RAGService {
  constructor() {
    this.documents = [];
    this.embeddings = [];
    this.isInitialized = false;
  }

  async initialize(documents) {
    this.documents = documents.map((doc, i) => ({ ...doc, id: doc.id || `doc_${i}` }));
    this.embeddings = await Promise.all(
      this.documents.map(doc => aiService.generateEmbedding(this._docToText(doc)))
    );
    this.isInitialized = true;
  }

  addDocuments(documents) {
    this.documents.push(...documents.map((doc, i) => ({
      ...doc,
      id: doc.id || `doc_${this.documents.length + i}`
    })));
    this.isInitialized = false;
  }

  async ensureInitialized() {
    if (!this.isInitialized && this.documents.length > 0) {
      this.embeddings = await Promise.all(
        this.documents.map(doc => aiService.generateEmbedding(this._docToText(doc)))
      );
      this.isInitialized = true;
    }
  }

  async retrieve(query, topK = 5) {
    await this.ensureInitialized();
    if (this.documents.length === 0) return [];

    const queryEmbedding = await aiService.generateEmbedding(query);
    const scored = this.embeddings.map((emb, i) => ({
      document: this.documents[i],
      score: this._cosineSimilarity(queryEmbedding, emb),
      index: i,
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(r => r.score > 0.5);
  }

  async query(query, context = {}) {
    const relevantDocs = await this.retrieve(query);

    if (relevantDocs.length === 0) {
      return {
        answer: "I couldn't find relevant policy information to answer your question. Please contact HR for assistance.",
        sources: [],
        confidence: 0,
      };
    }

    const contextText = relevantDocs
      .map(r => `[Source: ${r.document.title || r.document.name || 'Policy'}]\n${this._docToText(r.document)}`)
      .join('\n\n---\n\n');

    const systemPrompt = `You are an HR policy expert assistant. Answer the user's question based SOLELY on the provided policy documents.
If the answer cannot be found in the documents, say so clearly.
Cite specific policy sections when possible.
Keep answers concise and accurate.

Policy Context:
${contextText}`;

    try {
      const answer = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ], { temperature: 0.2 });

      return {
        answer,
        sources: relevantDocs.map(r => ({
          title: r.document.title || r.document.name || 'Policy',
          score: r.score,
          excerpt: this._docToText(r.document).substring(0, 200),
        })),
        confidence: relevantDocs.reduce((sum, r) => sum + r.score, 0) / relevantDocs.length,
      };
    } catch {
      return {
        answer: "I encountered an error processing your query. Please try again or contact HR.",
        sources: [],
        confidence: 0,
      };
    }
  }

  async enhancedPredictAttrition(employeeData, historicalData, departmentData) {
    const systemPrompt = `You are a sophisticated HR attrition prediction AI. Analyze employee data holistically.

Risk Factor Analysis (weighted):
1. Tenure & Stability (15%) - Short tenure, frequent job changes = higher risk
2. Performance Trajectory (20%) - Declining performance = red flag, improving = buffer
3. Compensation Parity (20%) - Below market, no recent revision = higher risk
4. Career Progression (15%) - No promotion in 3+ years, skill stagnation = higher risk
5. Work Patterns (10%) - Increasing sick leave, disengagement = warning
6. Engagement Indicators (10%) - Low survey scores, low recognition = higher risk
7. Team Stability (5%) - High team attrition = contagion risk
8. Life Events (5%) - Relocation, new family = neutral (can go either way)

Return JSON:
{
  "riskScore": 0-100,
  "riskLevel": "critical|high|medium|low",
  "primaryFactors": [{"factor": "name", "weight": %, "impact": "positive|negative"}],
  "secondaryFactors": [{"factor": "name", "impact": "positive|negative"}],
  "confidenceInterval": {"low": 0, "high": 0},
  "predictedTimeline": "immediate|3_months|6_months|12_months|stable",
  "retentionStrategies": [{"strategy": "", "cost": "low|medium|high", "effectiveness": 0-100}],
  "comparableEmployees": {"atRisk": 0, "stable": 0},
  "historicalContext": "How this compares to similar employees who left/stayed",
  "recommendedAction": "Specific immediate action if critical"
}`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ employeeData, historicalData, departmentData }) },
    ], { temperature: 0.15 });
  }

  async enhancedTrainingRecommendations(employeeProfile, availableCourses, skillGaps) {
    const systemPrompt = `You are a sophisticated learning & development AI. Recommend training with multi-factor analysis.

Analysis dimensions:
1. Skill Gap Urgency (30%) - How critical is the gap for current role?
2. Career Path Alignment (25%) - Does training support career goals?
3. Business Need (20%) - Does this skill benefit the organization?
4. Employee Interest (15%) - Would employee engage with this training?
5. Cost-Benefit (10%) - ROI of training investment

Return JSON:
{
  "recommendations": [{
    "course": "Course Name",
    "provider": "Provider",
    "type": "technical|soft_skill|leadership|compliance",
    "relevance": 0-100,
    "priority": "critical|high|medium|low",
    "estimatedDuration": "hours/days/weeks",
    "cost": "free|paid",
    "skillAddressed": "skill name",
    "gapSeverity": "critical|moderate|minor",
    "careerImpact": "How this helps career growth",
    "recommendedTimeline": "immediate|this_quarter|next_quarter|next_year"
  }],
  "learningPath": {
    "shortTerm": ["immediate courses"],
    "mediumTerm": ["3-6 month courses"],
    "longTerm": ["year+ development"],
    "totalEstimatedHours": 0
  },
  "skillGapClosure": {
    "currentProficiency": 0-100,
    "targetProficiency": 0-100,
    "estimatedTimeToClose": "months",
    "difficulty": "easy|moderate|challenging"
  }
}`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ employeeProfile, availableCourses, skillGaps }) },
    ], { temperature: 0.2 });
  }

  async batchResumeMatching(candidates, jobDescriptions) {
    const systemPrompt = `You are an advanced recruitment AI for batch resume matching.

For each candidate-job pair, compute a weighted match score:

Skills Match (40%):
- Required skills present: full score
- Preferred skills present: 0.7x weight
- Missing critical skills: penalty
- Bonus for rare/in-demand skills

Experience Match (30%):
- Years of experience vs required: ratio capped at 1.0
- Relevant industry experience: bonus
- Leadership experience for senior roles: bonus

Education Match (15%):
- Degree level match
- Field of study relevance
- Institution prestige (minor factor)

Cultural Indicators (15%):
- Communication style match
- Career progression pattern
- Stability (tenure patterns)
- Growth mindset indicators

Return JSON:
{
  "matches": [{
    "candidateId": "",
    "jobId": "",
    "overallScore": 0-100,
    "breakdown": {
      "skills": 0-100,
      "experience": 0-100,
      "education": 0-100,
      "cultural": 0-100
    },
    "matchedSkills": ["skill"],
    "missingSkills": ["skill"],
    "experienceAssessment": "summary",
    "fitLevel": "excellent|good|partial|poor",
    "recommendation": "interview|review|reject",
    "interviewQuestions": ["Suggested interview questions"],
    "strengths": ["strength1", "strength2"],
    "risks": ["risk1", "risk2"]
  }],
  "summary": {
    "totalCandidates": 0,
    "totalJobs": 0,
    "topCandidates": ["top candidate info"],
    "easiestToFill": "which role has best pool",
    "hardestToFill": "which role has weakest pool"
  }
}`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ candidates, jobDescriptions }) },
    ], { temperature: 0.15 });
  }

  async analyzeSentimentWithContext(texts, context) {
    if (!Array.isArray(texts)) texts = [texts];

    const systemPrompt = `You are an advanced employee sentiment analysis AI. Analyze the following feedback/survey responses.

For each response, analyze:
1. Overall sentiment (positive/negative/neutral) with score 0-1
2. Detected emotions (up to 3 primary emotions)
3. Key topics/themes mentioned
4. Urgency level (if issue needs immediate attention)
5. Actionability (can HR act on this?)

Aggregate Analysis:
1. Overall sentiment distribution
2. Most common themes
3. Department/team level patterns (if identifiable)
4. Critical issues requiring immediate attention
5. Positive highlights and strengths
6. Sentiment trend (if multiple time periods provided)

Return JSON:
{
  "responses": [{
    "index": 0,
    "sentiment": "positive|negative|neutral",
    "score": 0-1,
    "emotions": ["emotion1", "emotion2"],
    "themes": ["theme1", "theme2"],
    "urgency": "none|low|medium|high|critical",
    "actionable": true|false,
    "keyPhrase": "representative quote"
  }],
  "aggregate": {
    "totalResponses": 0,
    "positive": 0,
    "negative": 0,
    "neutral": 0,
    "averageScore": 0-1,
    "topThemes": [{"theme": "", "count": 0, "sentiment": 0}],
    "criticalIssues": [{"issue": "", "affectedCount": 0}],
    "positiveHighlights": ["highlight1"],
    "recommendations": ["actionable recommendation"]
  }
}`;

    return aiService.generateResponse([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify({ texts, context }) },
    ], { temperature: 0.15 });
  }

  _docToText(doc) {
    if (typeof doc === 'string') return doc;
    return doc.content || doc.text || doc.description || JSON.stringify(doc);
  }

  _cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    const denom = Math.sqrt(magA) * Math.sqrt(magB);
    return denom === 0 ? 0 : dot / denom;
  }
}

export default new RAGService();
