import fs from 'fs';
import path from 'path';
import { reportUsageToStripe } from '../services/billing.js';

const usageFile = './logs/usage.log';

export function trackUsage({ apiKey, model, prompt, response }) {
  const tokensUsed = Math.ceil((prompt.length + response.length) / 4);
  const usageEntry = {
    timestamp: new Date().toISOString(),
    apiKey,
    model,
    tokensUsed
  };

  const logLine = JSON.stringify(usageEntry) + '\n';
  fs.appendFile(path.resolve(usageFile), logLine, err => {
    if (err) console.error('Failed to write usage log:', err);
  });

  reportUsageToStripe(apiKey, model, tokensUsed).catch(console.error);
}
