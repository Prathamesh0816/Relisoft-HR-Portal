import dotenv from 'dotenv';
dotenv.config();

export const aiConfig = {
  provider: process.env.AI_PROVIDER || 'openai',
  apiKey: process.env.AI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4',
  baseUrl: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
  enabled: process.env.AI_ENABLED === 'true',
  humanReviewRequired: process.env.HUMAN_REVIEW_REQUIRED !== 'false',
  maxRetries: 3,
  timeout: 30000,
};
