import aiService from './aiService.js';

class InsightEngine {
  constructor() {
    this.insightCache = new Map();
    this.cacheTTL = 1800000;
  }

  async generateInsights(dataType, data, timeRange = 'this month') {
    const cacheKey = `${dataType}_${timeRange}_${JSON.stringify(data).length}`;

    const systemPrompts = {
      attendance: `You are an HR data analyst. Analyze the following attendance data for ${timeRange}.

Provide insights about:
1. Overall attendance trends
2. Department-wise patterns
3. Notable absences or patterns
4. Comparison with previous periods
5. Recommendations for improvement

Return JSON:
{
  "summary": "2-3 sentence executive summary",
  "keyFindings": [{"finding": "text", "severity": "positive"|"neutral"|"negative", "impact": "high"|"medium"|"low"}],
  "trends": [{"trend": "text", "direction": "up"|"down"|"stable", "percentage": 0.0}],
  "recommendations": [{"action": "text", "priority": "high"|"medium"|"low", "expectedImpact": "text"}],
  "anomalies": [{"description": "text", "severity": "high"|"medium"|"low"}]
}`,
      leave: `You are an HR data analyst. Analyze the following leave data for ${timeRange}.

Provide insights about:
1. Leave usage patterns
2. Department/team leave trends
3. Popular leave types
4. Impact on operations
5. Recommendations for leave policy

Return JSON with summary, keyFindings, trends, recommendations, anomalies.`,
      performance: `You are an HR data analyst. Analyze the following performance review data for ${timeRange}.

Provide insights about:
1. Overall performance distribution
2. Top performers and trends
3. Areas needing improvement
4. Department comparisons
5. Training recommendations

Return JSON with summary, keyFindings, trends, recommendations, anomalies.`,
      feedback: `You are an HR data analyst. Analyze the following employee feedback/survey data for ${timeRange}.

Provide insights about:
1. Overall sentiment analysis
2. Key themes and concerns
3. Department-level patterns
4. Comparison with previous surveys
5. Actionable recommendations

Return JSON with summary, keyFindings, trends, recommendations, sentiment.`,
      default: `You are an HR data analyst. Analyze the following HR data for ${timeRange}.

Provide actionable insights and recommendations.

Return JSON with summary, keyFindings, trends, recommendations, anomalies.`
    };

    const systemPrompt = systemPrompts[dataType] || systemPrompts.default;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Data for analysis (${dataType}) for ${timeRange}:\n\n${JSON.stringify(data, null, 2)}`
        }
      ], { temperature: 0.2 });

      const insights = typeof response === 'object' ? response : JSON.parse(response);
      insights.generatedAt = new Date().toISOString();
      insights.dataType = dataType;
      insights.timeRange = timeRange;

      this.insightCache.set(cacheKey, { data: insights, timestamp: Date.now() });
      return insights;
    } catch (error) {
      console.error('InsightEngine: Generation failed', error.message);
      return this._fallbackInsight(dataType, data, timeRange);
    }
  }

  async predictAttrition(employeeData, historicalData) {
    const systemPrompt = `You are an AI HR analyst specializing in employee retention and attrition prediction.

Analyze the employee data and predict attrition risk. Consider:
1. Tenure and role changes
2. Performance trends
3. Leave patterns (increasing sick leaves, etc.)
4. Engagement survey scores
5. Compensation relative to market
6. Career progression
7. Work location/remote status
8. Department and manager

Return JSON:
{
  "employeeId": "id",
  "attritionRisk": "low" | "medium" | "high" | "critical",
  "riskScore": 0.0-1.0,
  "keyFactors": [{"factor": "text", "impact": "positive"|"negative", "weight": 0.0-1.0}],
  "prediction": "6-12 months" | "12-24 months" | "24+ months" | "immediate risk",
  "retentionStrategies": [{"strategy": "text", "expectedEffectiveness": "high"|"medium"|"low"}],
  "warningSignals": ["signal1", "signal2"]
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Employee Data:\n${JSON.stringify(employeeData, null, 2)}\n\nHistorical Context:\n${JSON.stringify(historicalData || {}, null, 2)}`
        }
      ], { temperature: 0.2 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('InsightEngine: Attrition prediction failed', error.message);
      return this._fallbackAttritionPrediction(employeeData);
    }
  }

  async generateReportSummary(reportData) {
    const systemPrompt = `You are an AI that generates concise executive summaries of HR reports.

Summarize the key points, highlight critical findings, and provide actionable takeaways.

Return JSON:
{
  "title": "Report Title",
  "executiveSummary": "2-3 paragraph executive summary",
  "keyMetrics": [{"metric": "name", "value": "value", "change": "change vs previous period"}],
  "criticalFindings": [{"finding": "text", "action": "text", "priority": "high"|"medium"|"low"}],
  "recommendations": "Overall recommendations section"
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Report Data:\n${JSON.stringify(reportData, null, 2)}`
        }
      ], { temperature: 0.25 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('InsightEngine: Report summary failed', error.message);
      return { title: reportData.title || 'HR Report', executiveSummary: 'Summary generation failed.', keyMetrics: [] };
    }
  }

  async getActionableRecommendations(insights) {
    const systemPrompt = `You are an AI HR strategy advisor. Based on the following HR insights, generate specific, actionable recommendations.

Each recommendation should include:
- Clear action item
- Owner (HR, Manager, Leadership)
- Timeline
- Expected impact
- Success metrics

Return JSON:
{
  "strategic": [{"action": "text", "owner": "text", "timeline": "text", "impact": "text", "metrics": ["metric"]}],
  "operational": [{"action": "text", "owner": "text", "timeline": "text", "impact": "text"}],
  "immediate": [{"action": "text", "owner": "text", "deadline": "text"}]
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `HR Insights:\n${JSON.stringify(insights, null, 2)}`
        }
      ], { temperature: 0.3 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch {
      return { strategic: [], operational: [], immediate: [] };
    }
  }

  async detectTrends(historicalData, dataType) {
    const systemPrompt = `You are an AI trend detection specialist for HR data. Analyze the historical data and identify significant trends.

Return JSON:
{
  "trends": [{
    "name": "Trend name",
    "description": "Description",
    "significance": 0.0-1.0,
    "direction": "increasing" | "decreasing" | "stable" | "cyclical",
    "period": "Q1-Q4 2026",
    "affectedGroups": ["group"],
    "recommendedAction": "text"
  }],
  "seasonalPatterns": [{"pattern": "text", "period": "monthly"|"quarterly"|"yearly"}],
  "outliers": [{"description": "text", "significance": "high"|"medium"}],
  "forecast": "Overall forecast narrative"
}`;

    try {
      const response = await aiService.generateResponse([
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Historical ${dataType} Data:\n${JSON.stringify(historicalData, null, 2)}`
        }
      ], { temperature: 0.2 });

      return typeof response === 'object' ? response : JSON.parse(response);
    } catch (error) {
      console.error('InsightEngine: Trend detection failed', error.message);
      return { trends: [], seasonalPatterns: [], outliers: [], forecast: '' };
    }
  }

  _fallbackInsight(dataType, data, timeRange) {
    const recordCount = Array.isArray(data) ? data.length : Object.keys(data).length;

    return {
      summary: `Analysis of ${dataType} data for ${timeRange}. Found ${recordCount} records.`,
      keyFindings: [
        { finding: `${recordCount} records analyzed`, severity: 'neutral', impact: 'medium' }
      ],
      trends: [],
      recommendations: [
        { action: `Review ${dataType} data for completeness`, priority: 'medium', expectedImpact: 'Better data quality' }
      ],
      anomalies: [],
      generatedAt: new Date().toISOString(),
      dataType,
      timeRange
    };
  }

  _fallbackAttritionPrediction(employee) {
    let riskScore = 0.5;
    const factors = [];

    if (employee.tenure < 12) {
      riskScore += 0.15;
      factors.push({ factor: 'Short tenure', impact: 'negative', weight: 0.15 });
    }
    if (employee.performanceScore && employee.performanceScore < 3) {
      riskScore += 0.2;
      factors.push({ factor: 'Low performance', impact: 'negative', weight: 0.2 });
    }
    if (employee.sickLeaves && employee.sickLeaves > 10) {
      riskScore += 0.1;
      factors.push({ factor: 'High sick leave usage', impact: 'negative', weight: 0.1 });
    }
    if (employee.satisfactionScore && employee.satisfactionScore > 4) {
      riskScore -= 0.2;
      factors.push({ factor: 'High satisfaction', impact: 'positive', weight: -0.2 });
    }

    return {
      employeeId: employee.id || employee.employeeId,
      attritionRisk: riskScore > 0.7 ? 'high' : riskScore > 0.4 ? 'medium' : 'low',
      riskScore: Math.min(Math.max(riskScore, 0), 1),
      keyFactors: factors,
      prediction: riskScore > 0.7 ? '6-12 months' : '12-24 months',
      retentionStrategies: riskScore > 0.5 ? [
        { strategy: 'Conduct stay interview', expectedEffectiveness: 'medium' },
        { strategy: 'Review compensation', expectedEffectiveness: 'high' }
      ] : [],
      warningSignals: []
    };
  }

  clearCache() {
    this.insightCache.clear();
  }
}

export default new InsightEngine();
