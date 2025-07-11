import OpenAI from 'openai';
import { runLocalInference } from './local.js';

let cachedModels = null;
let lastFetched = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function runInference(prompt, model = 'gpt-4o', options = {}) {
  const { temperature, max_tokens } = options;
  const localModels = ['llama3', 'mistral', 'gemma', 'codellama'];
  
  if (localModels.includes(model)) {
    return await runLocalInference(prompt, model, options);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const models = await getSupportedModels(openai);
    if (!models.includes(model)) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const completionOptions = {
      model,
      messages: [{ role: 'user', content: prompt }],
    };

    if (temperature !== undefined) {
      completionOptions.temperature = temperature;
    }

    if (max_tokens !== undefined) {
      completionOptions.max_tokens = max_tokens;
    }

    const response = await openai.chat.completions.create(completionOptions);
    return response.choices[0].message.content;
  } catch (error) {
    if (error.code === 'insufficient_quota') {
      throw new Error('OpenAI quota exceeded');
    }
    if (error.code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key');
    }
    if (error.code === 'model_not_found') {
      throw new Error(`Model ${model} not found`);
    }
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function getSupportedModels(client = null) {
  const openai = client || new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const now = Date.now();
  if (cachedModels && now - lastFetched < CACHE_DURATION_MS) {
    return cachedModels;
  }

  try {
    const response = await openai.models.list();
    const modelIds = response.data.map(m => m.id);
    cachedModels = modelIds.filter(id => id.includes('gpt'));
    lastFetched = now;
    return cachedModels;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    // Return default models if API call fails
    return ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];
  }
}
