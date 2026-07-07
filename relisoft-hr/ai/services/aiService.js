import axios from 'axios';

const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_WINDOW = 60;

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'openai';
    this.apiKey = process.env.AI_API_KEY || 'mock-key';
    this.model = process.env.AI_MODEL || 'gpt-4';
    this.baseUrl = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.mockMode = process.env.AI_MOCK_MODE === 'true' || !process.env.AI_API_KEY;

    this.rateLimitQueue = [];
    this.requestCount = 0;
    this.windowStart = Date.now();
  }

  async generateResponse(messages, options = {}) {
    return this._withRateLimit(async () => {
      const provider = options.provider || this.provider;

      if (this.mockMode) {
        return this._mockResponse(messages, options);
      }

      switch (provider) {
        case 'openai':
          return this._callOpenAI(messages, options);
        case 'anthropic':
          return this._callAnthropic(messages, options);
        case 'local':
          return this._callLocalLLM(messages, options);
        default:
          throw new Error(`Unknown provider: ${provider}`);
      }
    });
  }

  async generateEmbedding(text) {
    return this._withRateLimit(async () => {
      if (this.mockMode) {
        return this._mockEmbedding(text);
      }

      const response = await this._retry(() =>
        axios.post(
          `${this.baseUrl}/embeddings`,
          { input: text, model: 'text-embedding-ada-002' },
          { headers: this._getHeaders() }
        )
      );
      return response.data.data[0].embedding;
    });
  }

  async analyzeSentiment(text) {
    const messages = [
      { role: 'system', content: 'Analyze the sentiment of the following text. Return a JSON with sentiment (positive/negative/neutral), score (0-1), and key emotions detected.' },
      { role: 'user', content: text }
    ];
    const response = await this.generateResponse(messages, { temperature: 0.1 });
    return this._parseJSON(response);
  }

  async extractEntities(text, entityTypes) {
    const messages = [
      {
        role: 'system',
        content: `Extract the following entities from the text: ${entityTypes.join(', ')}. Return a JSON object with only the fields that were found.`
      },
      { role: 'user', content: text }
    ];
    const response = await this.generateResponse(messages, { temperature: 0.1 });
    return this._parseJSON(response);
  }

  async generateSummary(text, maxLength = 200) {
    const messages = [
      {
        role: 'system',
        content: `Summarize the following text in ${maxLength} words or less. Be concise and capture key points.`
      },
      { role: 'user', content: text }
    ];
    return this.generateResponse(messages, { temperature: 0.3 });
  }

  async matchCandidates(jobDescription, candidates) {
    const messages = [
      {
        role: 'system',
        content: `You are an HR recruitment AI. Given a job description and candidate profiles, rank candidates by fit. Return a JSON array of matches with candidateId, score (0-1), strengths, and gaps.`
      },
      {
        role: 'user',
        content: `Job Description:\n${jobDescription}\n\nCandidates:\n${JSON.stringify(candidates)}`
      }
    ];
    const response = await this.generateResponse(messages, { temperature: 0.2 });
    return this._parseJSON(response);
  }

  async generateDocument(template, data) {
    const messages = [
      {
        role: 'system',
        content: `Generate a document based on the following template and data. Fill in all placeholders and format professionally. Return the complete document as plain text.`
      },
      {
        role: 'user',
        content: `Template:\n${template}\n\nData:\n${JSON.stringify(data)}`
      }
    ];
    return this.generateResponse(messages, { temperature: 0.4 });
  }

  async chatCompletion(messages, context) {
    const systemMessage = {
      role: 'system',
      content: context.systemPrompt || 'You are a helpful HR assistant.'
    };

    if (context.policies) {
      systemMessage.content += `\n\nCompany Policies:\n${JSON.stringify(context.policies, null, 2)}`;
    }

    if (context.employeeData) {
      systemMessage.content += `\n\nEmployee Data:\n${JSON.stringify(context.employeeData, null, 2)}`;
    }

    const fullMessages = [systemMessage, ...messages];
    const response = await this.generateResponse(fullMessages, { temperature: 0.3 });
    return response;
  }

  async moderateContent(text) {
    if (this.mockMode) {
      return { flagged: false, categories: {}, scores: {} };
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/moderations`,
        { input: text },
        { headers: this._getHeaders() }
      );
      return response.data.results[0];
    } catch (error) {
      this._handleError(error);
      return { flagged: false, error: error.message };
    }
  }

  async _callOpenAI(messages, options) {
    const response = await this._retry(() =>
      axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: options.model || this.model,
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens || 2048,
          top_p: options.topP || 1
        },
        { headers: this._getHeaders() }
      )
    );
    return response.data.choices[0].message.content;
  }

  async _callAnthropic(messages, options) {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this._retry(() =>
      axios.post(
        process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1/messages',
        {
          model: options.model || process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229',
          system: systemMessage?.content || '',
          messages: userMessages.map(m => ({ role: m.role, content: m.content })),
          max_tokens: options.maxTokens || 2048,
          temperature: options.temperature ?? 0.7
        },
        {
          headers: {
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      )
    );
    return response.data.content[0].text;
  }

  async _callLocalLLM(messages, options) {
    const response = await this._retry(() =>
      axios.post(
        this.baseUrl,
        {
          model: options.model || 'local-model',
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens || 2048
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
    return response.data.choices?.[0]?.message?.content || response.data.content?.[0]?.text || response.data.response;
  }

  async _mockResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';

    if (lastMessage.toLowerCase().includes('leave') || lastMessage.toLowerCase().includes('vacation')) {
      return JSON.stringify({
        leaveType: 'EL',
        fromDate: '2026-07-01',
        toDate: '2026-07-05',
        reason: 'Planned vacation',
        status: 'eligible',
        balanceRemaining: 12
      });
    }

    if (lastMessage.toLowerCase().includes('attendance')) {
      return JSON.stringify({
        employeeId: 'EMP001',
        totalPresent: 22,
        totalAbsent: 1,
        totalLate: 1,
        attendancePercent: 95.8,
        month: 'June 2026'
      });
    }

    if (lastMessage.toLowerCase().includes('resume') || lastMessage.toLowerCase().includes('bio')) {
      return JSON.stringify({
        name: 'Jane Doe',
        email: 'jane.doe@relisofttechnologies.com',
        phone: '+1-555-0123',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        education: [
          { degree: 'B.S. Computer Science', institution: 'MIT', year: 2020 }
        ],
        experience: [
          { role: 'Software Engineer', company: 'Tech Corp', duration: '2020-2024' }
        ],
        certifications: ['AWS Certified Developer'],
        totalYearsExperience: 4
      });
    }

    if (lastMessage.toLowerCase().includes('sentiment') || lastMessage.toLowerCase().includes('feedback')) {
      return JSON.stringify({
        sentiment: 'positive',
        score: 0.85,
        emotions: ['satisfied', 'motivated'],
        keyPhrases: ['great work environment', 'good growth opportunities']
      });
    }

    if (lastMessage.toLowerCase().includes('match') || lastMessage.toLowerCase().includes('candidate')) {
      return JSON.stringify([
        { candidateId: 'C001', score: 0.92, strengths: ['React', 'Node.js', '10yr exp'], gaps: ['TypeScript'] },
        { candidateId: 'C002', score: 0.78, strengths: ['React', 'TypeScript'], gaps: ['Backend experience'] }
      ]);
    }

    return 'This is a mock AI response. Set AI_API_KEY to get real responses.';
  }

  _mockEmbedding(text) {
    const seed = text.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const embedding = new Array(1536).fill(0);
    for (let i = 0; i < embedding.length; i++) {
      embedding[i] = Math.sin(seed + i * 0.1) * 0.5;
    }
    return embedding;
  }

  async _retry(fn, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt >= this.maxRetries) {
        this._handleError(error);
        throw error;
      }

      const delay = this.retryDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      return this._retry(fn, attempt + 1);
    }
  }

  async _withRateLimit(fn) {
    const now = Date.now();

    if (now - this.windowStart > RATE_LIMIT_WINDOW) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    if (this.requestCount >= MAX_REQUESTS_PER_WINDOW) {
      const waitTime = this.windowStart + RATE_LIMIT_WINDOW - now;
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    this.requestCount++;
    return fn();
  }

  _getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  _parseJSON(response) {
    if (typeof response === 'object') return response;

    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    try {
      return JSON.parse(jsonStr);
    } catch {
      try {
        return JSON.parse(jsonStr.trim());
      } catch {
        throw new Error(`Failed to parse AI response as JSON: ${response}`);
      }
    }
  }

  _handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          console.error('AI Service: Authentication failed. Check API key.');
          break;
        case 429:
          console.error('AI Service: Rate limit exceeded. Retrying...');
          break;
        case 500:
          console.error('AI Service: Provider error.');
          break;
        default:
          console.error(`AI Service: HTTP ${status}`, data);
      }
    } else if (error.code === 'ECONNREFUSED') {
      console.error('AI Service: Connection refused. Check base URL.');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('AI Service: Request timed out.');
    } else {
      console.error('AI Service:', error.message);
    }
  }
}

const aiService = new AIService();
export default aiService;
