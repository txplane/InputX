import OpenAI from 'openai';
import { runLocalInference } from './local.js';

let cachedModels = null;
let lastFetched = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function runInference(prompt, model = 'gpt-4o') {
  const localModels = ['llama3', 'mistral', 'gemma', 'codellama'];
  if (localModels.includes(model)) {
    return await runLocalInference(prompt, model);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const models = await getSupportedModels(openai);
  if (!models.includes(model)) {
    throw new Error(`Unsupported model: ${model}`);
  }

  const response = await openai.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

export async function getSupportedModels(client = null) {
  const openai = client || new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const now = Date.now();
  if (cachedModels && now - lastFetched < CACHE_DURATION_MS) {
    return cachedModels;
  }

  const response = await openai.models.list();
  const modelIds = response.data.map(m => m.id);
  cachedModels = modelIds.filter(id => id.includes('gpt'));
  lastFetched = now;

  return cachedModels;
}
