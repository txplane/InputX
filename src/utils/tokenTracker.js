import fs from 'fs';
import path from 'path';
import { reportUsageToStripe } from '../services/billing.js';
import { logUsage, logError } from './logger.js';

const usageFile = './logs/usage.log';

export function trackUsage({ apiKey, model, prompt, response }) {
  const tokensUsed = Math.ceil((prompt.length + response.length) / 4);
  const usageEntry = {
    timestamp: new Date().toISOString(),
    apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'unknown',
    model,
    tokensUsed,
    promptLength: prompt.length,
    responseLength: response.length
  };

  // Log to Winston
  logUsage(usageEntry);

  // Write to usage log file
  const logLine = JSON.stringify(usageEntry) + '\n';
  fs.appendFile(path.resolve(usageFile), logLine, err => {
    if (err) {
      logError(err, { context: 'tokenTracker', action: 'writeUsageLog' });
    }
  });

  // Report to Stripe (async, don't block)
  reportUsageToStripe(apiKey, model, tokensUsed).catch(error => {
    logError(error, { context: 'tokenTracker', action: 'reportToStripe' });
  });
}
