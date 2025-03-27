import fs from 'fs';
import path from 'path';

const logDir = './logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

export function logRequest(request, reply, done) {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const logFile = path.join(logDir, `access-${dateStr}.log`);

  const { method, url, headers, body } = request;
  const tokenUsage = body?.max_tokens || body?.maxTokens || 'N/A';
  const logEntry = {
    time: now.toISOString(),
    method,
    url,
    ip: request.ip,
    userAgent: headers['user-agent'],
    apiKeyPrefix: headers['authorization']?.slice(0, 10) + '...',
    promptPreview: body?.prompt?.slice(0, 40) + '...',
    model: body?.model || 'default',
    tokenUsage
  };

  const logLine = JSON.stringify(logEntry, null, 2) + '\n';

  fs.appendFile(logFile, logLine, (err) => {
    if (err) console.error('Failed to write log:', err);
  });

  done();
}
