import aiService from '../../ai/services/aiService.js';
import { aiConfig } from '../config/ai.js';
import Review from '../models/Review.js';
import ragService from '../../ai/services/ragService.js';
import Employee from '../models/Employee.js';
import Training from '../models/Training.js';
import Survey from '../models/Survey.js';

function requireAI(req, res, next) {
  if (!aiConfig.enabled) {
    return res.status(503).json({ success: false, message: 'AI service is disabled. Set AI_ENABLED=true and configure AI_API_KEY in .env' });
  }
  next();
}

async function addToReviewQueue({ type, specId, specFile, generatedCode, aiPrompt, aiResponse, requestedBy }) {
  try {
    const review = await Review.create({
      type,
      specId: specId || null,
      specFile: specFile || null,
      generatedCode: generatedCode || null,
      aiPrompt: aiPrompt || null,
      aiResponse: aiResponse || null,
      requestedBy: requestedBy || null,
      status: 'pending',
    });
    return review;
  } catch (error) {
    console.error('Failed to add review to queue:', error.message);
    return null;
  }
}

function wrapAI(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      return result;
    } catch (error) {
      console.error('AI Controller Error:', error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export const chat = wrapAI(async (req, res) => {
  const { messages, context } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'messages array is required' });
  }

  const response = await aiService.chatCompletion(messages, context || {});

  if (aiConfig.humanReviewRequired) {
    await addToReviewQueue({
      type: 'ai_output',
      aiPrompt: JSON.stringify(messages),
      aiResponse: response,
      requestedBy: req.user?._id,
    });
  }

  res.status(200).json({ success: true, data: response });
});

export const parseResume = wrapAI(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'resume text is required' });
  }

  const response = await aiService.generateResponse([
    { role: 'system', content: 'You are a resume parser. Extract structured information from the resume text. Return a JSON object with name, email, phone, skills (array), experience (array of {role, company, duration}), education (array of {degree, institution, year}), and certifications.' },
    { role: 'user', content: text },
  ], { temperature: 0.1 });

  let parsed;
  if (typeof response === 'object') {
    parsed = response;
  } else {
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1] : response);
    } catch {
      parsed = { raw: response };
    }
  }

  if (aiConfig.humanReviewRequired) {
    await addToReviewQueue({
      type: 'ai_output',
      aiPrompt: 'Resume parsing: ' + text.substring(0, 200),
      aiResponse: parsed,
      requestedBy: req.user?._id,
    });
  }

  res.status(200).json({ success: true, data: parsed });
});

export const matchCandidates = wrapAI(async (req, res) => {
  const { jobDescription, candidates } = req.body;
  if (!jobDescription || !candidates) {
    return res.status(400).json({ success: false, message: 'jobDescription and candidates are required' });
  }

  const matches = await aiService.matchCandidates(jobDescription, candidates);

  res.status(200).json({ success: true, data: matches });
});

export const generateDocument = wrapAI(async (req, res) => {
  const { template, data, documentType } = req.body;
  if (!template || !data) {
    return res.status(400).json({ success: false, message: 'template and data are required' });
  }

  const response = await aiService.generateDocument(template, data);

  const result = {
    content: response,
    documentType: documentType || 'general',
    generatedAt: new Date().toISOString(),
  };

  if (aiConfig.humanReviewRequired) {
    await addToReviewQueue({
      type: 'ai_output',
      specFile: documentType || 'document',
      aiPrompt: `Generate document of type: ${documentType || 'general'}`,
      aiResponse: result,
      requestedBy: req.user?._id,
    });
  }

  res.status(200).json({ success: true, data: result });
});

export const analyzeSentiment = wrapAI(async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ success: false, message: 'text is required' });
  }

  const result = await aiService.analyzeSentiment(text);

  res.status(200).json({ success: true, data: result });
});

export const generateInsights = wrapAI(async (req, res) => {
  const { data, insightType } = req.body;
  if (!data) {
    return res.status(400).json({ success: false, message: 'data is required' });
  }

  const systemPrompt = insightType
    ? `You are an HR analytics AI. Generate insights about ${insightType} from the provided data. Return a JSON with key findings, trends, and recommendations.`
    : 'You are an HR analytics AI. Generate insights from the provided HR data. Return a JSON with key findings, trends, and recommendations.';

  const response = await aiService.generateResponse([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: typeof data === 'string' ? data : JSON.stringify(data) },
  ], { temperature: 0.3 });

  let insights;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    insights = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    insights = { findings: response };
  }

  res.status(200).json({ success: true, data: insights });
});

export const predictAttrition = wrapAI(async (req, res) => {
  const { employeeData } = req.body;
  if (!employeeData) {
    return res.status(400).json({ success: false, message: 'employeeData is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an HR analytics AI specializing in employee attrition prediction. Analyze the employee data and return a JSON with: riskScore (0-1), riskLevel (low/medium/high), keyFactors (array of factors contributing to risk), and recommendations (array of retention strategies).',
    },
    { role: 'user', content: JSON.stringify(employeeData) },
  ], { temperature: 0.2 });

  let prediction;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    prediction = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    prediction = { riskScore: 0.5, riskLevel: 'medium', rawAnalysis: response };
  }

  res.status(200).json({ success: true, data: prediction });
});

export const recommendTraining = wrapAI(async (req, res) => {
  const { employeeSkills, role, careerGoals } = req.body;
  if (!employeeSkills) {
    return res.status(400).json({ success: false, message: 'employeeSkills is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are a learning and development AI. Recommend training programs based on employee skills, role, and career goals. Return a JSON with recommendations (array of {course, provider, relevance, priority, estimatedDuration}).',
    },
    { role: 'user', content: JSON.stringify({ employeeSkills, role, careerGoals }) },
  ], { temperature: 0.3 });

  let recommendations;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    recommendations = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    recommendations = { recommendations: [{ course: response, provider: 'TBD', relevance: 'high', priority: 'medium', estimatedDuration: '2 weeks' }] };
  }

  res.status(200).json({ success: true, data: recommendations });
});

export const generateSpec = wrapAI(async (req, res) => {
  const { description, moduleName } = req.body;
  if (!description) {
    return res.status(400).json({ success: false, message: 'description is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an SDD specification writer. Generate a complete specification document from the description. Include: Overview, Features (as a list), Data Model (with MongoDB schemas), API Endpoints (RESTful), and Business Rules. Return as structured markdown.',
    },
    { role: 'user', content: `Generate a specification for the HR module: ${moduleName || 'Unnamed Module'}\n\nDescription: ${description}` },
  ], { temperature: 0.4 });

  const specContent = typeof response === 'string' ? response : response.content || JSON.stringify(response);

  await addToReviewQueue({
    type: 'spec_review',
    specFile: moduleName ? `specs/modules/${moduleName.toLowerCase().replace(/\s+/g, '-')}.md` : 'specs/modules/generated.md',
    aiPrompt: description,
    aiResponse: specContent,
    requestedBy: req.user?._id,
  });

  res.status(200).json({
    success: true,
    data: {
      spec: specContent,
      moduleName: moduleName || 'generated',
      requiresReview: aiConfig.humanReviewRequired,
    },
  });
});

export const generateCode = wrapAI(async (req, res) => {
  const { spec, moduleName, target } = req.body;
  if (!spec) {
    return res.status(400).json({ success: false, message: 'spec content is required' });
  }

  const targetLayers = target || ['model', 'controller', 'routes', 'component', 'tests'];
  const layersStr = targetLayers.join(', ');

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an expert code generator. Generate production-ready code based on the provided specification. Return a JSON object with keys for each target layer (model, controller, routes, component, tests). Each value should be the complete file content.',
    },
    { role: 'user', content: `Generate code for module "${moduleName || 'Generated'}" targeting: ${layersStr}\n\nSpecification:\n${spec}` },
  ], { temperature: 0.3 });

  let generatedCode;
  if (typeof response === 'object') {
    generatedCode = response;
  } else {
    try {
      const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
      generatedCode = jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(response);
    } catch {
      generatedCode = { raw: response };
    }
  }

  await addToReviewQueue({
    type: 'code_review',
    specFile: moduleName ? `specs/modules/${moduleName.toLowerCase().replace(/\s+/g, '-')}.md` : 'specs/modules/generated.md',
    generatedCode,
    aiPrompt: `Generate ${layersStr} for ${moduleName || 'Generated'}`,
    aiResponse: generatedCode,
    requestedBy: req.user?._id,
  });

  res.status(200).json({
    success: true,
    data: {
      code: generatedCode,
      moduleName: moduleName || 'generated',
      targets: targetLayers,
      requiresReview: aiConfig.humanReviewRequired,
    },
  });
});

export const reviewCode = wrapAI(async (req, res) => {
  const { code, language, context } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'code is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are a senior code reviewer. Review the provided code and return a JSON with: overallScore (0-100), issues (array of {severity: critical/major/minor, line, description, suggestion}), strengths (array), and recommendations (array).',
    },
    { role: 'user', content: `Review this ${language || 'JavaScript'} code:\n\n${code}\n\nContext: ${context || 'No additional context'}` },
  ], { temperature: 0.2 });

  let review;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    review = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));

    if (review.issues && review.issues.length > 0 && aiConfig.humanReviewRequired) {
      await addToReviewQueue({
        type: 'code_review',
        aiPrompt: `Code review request:\n${code.substring(0, 500)}`,
        aiResponse: review,
        requestedBy: req.user?._id,
      });
    }
  } catch {
    review = { overallScore: 50, rawReview: response };
  }

  res.status(200).json({ success: true, data: review });
});

export const listPendingReviews = async (req, res) => {
  try {
    const { type, status } = req.query;
    const filter = { status: status || 'pending' };
    if (type) filter.type = type;

    const reviews = await Review.find(filter)
      .populate('requestedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort('-createdAt');

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateInterviewQuestions = wrapAI(async (req, res) => {
  const { jobTitle, skills, experienceLevel, roleType } = req.body;
  if (!jobTitle) {
    return res.status(400).json({ success: false, message: 'jobTitle is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an interview question generator. Generate role-specific interview questions. Return a JSON with: technical (array of {question, expectedAnswer, difficulty}), behavioral (array of {question, context}), situational (array of {scenario, question}), and roleSpecific (array of {question, rationale}).',
    },
    { role: 'user', content: JSON.stringify({ jobTitle, skills: skills || [], experienceLevel: experienceLevel || 'mid', roleType: roleType || 'individual-contributor' }) },
  ], { temperature: 0.4 });

  let questions;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    questions = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    questions = { technical: [], behavioral: [], situational: [], roleSpecific: [] };
  }

  res.status(200).json({ success: true, data: questions });
});

export const generatePerformanceSummary = wrapAI(async (req, res) => {
  const { employeeName, role, ratings, kras, feedback, period } = req.body;
  if (!employeeName || !ratings) {
    return res.status(400).json({ success: false, message: 'employeeName and ratings are required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an HR performance review writer. Generate a professional performance summary. Return a JSON with: summary (paragraph), strengths (array), areasForImprovement (array), overallRating (number), and recommendations (array).',
    },
    { role: 'user', content: JSON.stringify({ employeeName, role, ratings, kras, feedback, period: period || 'Annual' }) },
  ], { temperature: 0.3 });

  let summary;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    summary = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    summary = { summary: typeof response === 'string' ? response : 'Performance summary generated', strengths: [], areasForImprovement: [], overallRating: 3, recommendations: [] };
  }

  res.status(200).json({ success: true, data: summary });
});

export const salaryRecommendation = wrapAI(async (req, res) => {
  const { role, experience, currentCtc, performanceRating, marketData } = req.body;
  if (!role || !experience) {
    return res.status(400).json({ success: false, message: 'role and experience are required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are a compensation analyst AI. Recommend salary ranges based on role, experience, and market data. Return a JSON with: recommendedRange ({min, max, median}), marketPercentile, adjustmentPercentage, rationale, and equityAnalysis (internal parity note).',
    },
    { role: 'user', content: JSON.stringify({ role, experience, currentCtc, performanceRating, marketData: marketData || {} }) },
  ], { temperature: 0.2 });

  let recommendation;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    recommendation = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    recommendation = { recommendedRange: { min: 0, max: 0, median: 0 }, marketPercentile: 50, adjustmentPercentage: 0, rationale: 'Unable to compute', equityAnalysis: '' };
  }

  res.status(200).json({ success: true, data: recommendation });
});

export const analyzeAttendanceAnomalies = wrapAI(async (req, res) => {
  const { attendanceRecords, employeeName, department } = req.body;
  if (!attendanceRecords) {
    return res.status(400).json({ success: false, message: 'attendanceRecords is required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are an attendance analyst AI. Detect anomalies in attendance patterns. Return a JSON with: anomalies (array of {type, severity, description, dates, recommendation}), patterns (array of observed patterns), and overallAssessment (string).',
    },
    { role: 'user', content: JSON.stringify({ attendanceRecords, employeeName, department }) },
  ], { temperature: 0.2 });

  let analysis;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    analysis = { anomalies: [], patterns: [], overallAssessment: 'Analysis could not be completed' };
  }

  res.status(200).json({ success: true, data: analysis });
});

export const skillGapAnalysis = wrapAI(async (req, res) => {
  const { employeeSkills, targetRole, departmentSkills, employeeName } = req.body;
  if (!employeeSkills || !targetRole) {
    return res.status(400).json({ success: false, message: 'employeeSkills and targetRole are required' });
  }

  const response = await aiService.generateResponse([
    {
      role: 'system',
      content: 'You are a workforce skills analyst AI. Analyze skill gaps for career progression or department readiness. Return a JSON with: gaps (array of {skill, currentLevel, requiredLevel, gap}), strengths (array of {skill, level}), recommendedTraining (array of {course, priority, estimatedDuration}), and overallReadiness (percentage).',
    },
    { role: 'user', content: JSON.stringify({ employeeSkills, targetRole, departmentSkills: departmentSkills || [], employeeName }) },
  ], { temperature: 0.3 });

  let analysis;
  try {
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof response === 'object' ? response : JSON.parse(response));
  } catch {
    analysis = { gaps: [], strengths: [], recommendedTraining: [], overallReadiness: 0 };
  }

  res.status(200).json({ success: true, data: analysis });
});

export const policyChatbotQuery = wrapAI(async (req, res) => {
  const { query, documents } = req.body;
  if (!query) {
    return res.status(400).json({ success: false, message: 'query is required' });
  }

  if (documents) {
    ragService.addDocuments(documents);
  } else {
    const existingDocs = await Document?.find({ type: 'policy', status: 'published' }).limit(50) || [];
    if (existingDocs.length > 0 && !ragService.isInitialized) {
      ragService.initialize(existingDocs.map(d => ({
        id: d._id,
        title: d.title || d.name,
        content: d.content || d.description,
        category: d.category,
        department: d.department,
      })));
    }
  }

  const result = await ragService.query(query);
  res.status(200).json({ success: true, data: result });
});

export const batchAttritionPrediction = wrapAI(async (req, res) => {
  const { employees, historicalData, departmentData } = req.body;
  if (!employees || !Array.isArray(employees)) {
    return res.status(400).json({ success: false, message: 'employees array is required' });
  }

  const results = await Promise.all(
    employees.map(emp => ragService.enhancedPredictAttrition(emp, historicalData, departmentData))
  );

  const parsed = results.map(r => {
    try {
      const jsonMatch = r.match(/```(?:json)?\s*([\s\S]*?)```/);
      return jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof r === 'object' ? r : JSON.parse(r));
    } catch {
      return { riskScore: 50, riskLevel: 'medium' };
    }
  });

  const avgRisk = parsed.reduce((sum, p) => sum + (p.riskScore || 50), 0) / parsed.length;
  const critical = parsed.filter(p => p.riskLevel === 'critical' || p.riskLevel === 'high').length;

  res.status(200).json({
    success: true,
    data: {
      predictions: parsed,
      summary: { total: parsed.length, averageRisk: Math.round(avgRisk), highRiskCount: critical, riskDistribution: {
        critical: parsed.filter(p => p.riskLevel === 'critical').length,
        high: parsed.filter(p => p.riskLevel === 'high').length,
        medium: parsed.filter(p => p.riskLevel === 'medium').length,
        low: parsed.filter(p => p.riskLevel === 'low').length,
      }},
    },
  });
});

export const advancedTrainingRecommendations = wrapAI(async (req, res) => {
  const { employeeProfile, skillGaps } = req.body;
  if (!employeeProfile) {
    return res.status(400).json({ success: false, message: 'employeeProfile is required' });
  }

  let availableCourses = req.body.availableCourses;
  if (!availableCourses) {
    availableCourses = await Training.find({ status: 'active' }).limit(30) || [];
  }

  const result = await ragService.enhancedTrainingRecommendations(employeeProfile, availableCourses, skillGaps || []);

  let recommendations;
  try {
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    recommendations = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof result === 'object' ? result : JSON.parse(result));
  } catch {
    recommendations = { recommendations: [{ course: 'Analysis completed', relevance: 50 }] };
  }

  res.status(200).json({ success: true, data: recommendations });
});

export const batchResumeMatcher = wrapAI(async (req, res) => {
  const { candidates, jobDescriptions } = req.body;
  if (!candidates || !jobDescriptions) {
    return res.status(400).json({ success: false, message: 'candidates and jobDescriptions are required' });
  }

  const result = await ragService.batchResumeMatching(candidates, jobDescriptions);

  let matches;
  try {
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    matches = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof result === 'object' ? result : JSON.parse(result));
  } catch {
    matches = { matches: [], summary: { totalCandidates: candidates.length, totalJobs: jobDescriptions.length }};
  }

  res.status(200).json({ success: true, data: matches });
});

export const batchSentimentAnalysis = wrapAI(async (req, res) => {
  const { texts, context } = req.body;
  if (!texts) {
    return res.status(400).json({ success: false, message: 'texts (array or string) is required' });
  }

  let inputTexts = Array.isArray(texts) ? texts : [texts];

  if (inputTexts.length === 0) {
    const surveys = await Survey.find({ status: 'completed' }).sort('-createdAt').limit(100) || [];
    inputTexts = surveys.map(s => s.feedback || s.comments || s.response || '').filter(Boolean);
  }

  const result = await ragService.analyzeSentimentWithContext(inputTexts, context);

  let analysis;
  try {
    const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)```/);
    analysis = jsonMatch ? JSON.parse(jsonMatch[1]) : (typeof result === 'object' ? result : JSON.parse(result));
  } catch {
    analysis = { aggregate: { totalResponses: inputTexts.length, averageScore: 0.5 }};
  }

  res.status(200).json({ success: true, data: analysis });
});

export const processReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, comments } = req.body;

    if (!action || !['approve', 'reject', 'request-changes'].includes(action)) {
      return res.status(400).json({ success: false, message: 'action must be approve, reject, or request-changes' });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    if (review.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Review is already ${review.status}` });
    }

    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      'request-changes': 'changes_requested',
    };

    review.status = statusMap[action];
    review.reviewedBy = req.user?._id || review.reviewedBy;
    review.reviewComments = comments || review.reviewComments;
    review.reviewedAt = new Date();
    await review.save();

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
