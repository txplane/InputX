const rateLimitWindow = 60 * 1000; // 1 minute
const maxRequestsPerKey = 60;

const requestCounts = new Map();

export function rateLimiter(request, reply, done) {
  // Robust public route check for documentation and static assets
  const url = request.url;
  if (
    url === '/documentation' ||
    url === '/documentation/' ||
    url.startsWith('/documentation/') ||
    url.startsWith('/documentation?') ||
    url.startsWith('/documentation%2F') ||
    url.startsWith('/documentation%3F') ||
    url === '/health' ||
    url === '/health/ready' ||
    url === '/models'
  ) {
    return done();
  }

  const apiKey = request.headers['authorization']?.split(' ')[1];

  if (!apiKey) {
    reply.code(401).send({ error: 'Unauthorized: Missing API key' });
    return;
  }

  const now = Date.now();
  const record = requestCounts.get(apiKey) || { count: 0, startTime: now };

  if (now - record.startTime < rateLimitWindow) {
    if (record.count >= maxRequestsPerKey) {
      reply.code(429).send({ error: 'Rate limit exceeded. Try again later.' });
      return;
    }
    record.count += 1;
  } else {
    record.count = 1;
    record.startTime = now;
  }

  requestCounts.set(apiKey, record);
  done();
}
