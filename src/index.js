import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';

import inferenceRoute from './routes/inference.js';
import modelsRoute from './routes/models.js';
import healthRoute from './routes/health.js';
import { rateLimiter } from './utils/rateLimiter.js';
import { logRequest } from './utils/logger.js';

dotenv.config();

const fastify = Fastify({ 
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development'
  }
});

// Register security plugins
fastify.register(helmet);
fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
});

// Register rate limiting
fastify.register(rateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000
});

// Register routes
fastify.register(healthRoute);
fastify.register(modelsRoute);
fastify.register(inferenceRoute);

// Register global hooks
fastify.addHook('onRequest', rateLimiter);
fastify.addHook('onRequest', logRequest);

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  console.error('Unhandled error:', error);
  reply.code(500).send({
    error: true,
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    const host = '0.0.0.0';
    
    await fastify.listen({ port, host });
    console.log(`🚀 InputX server running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
