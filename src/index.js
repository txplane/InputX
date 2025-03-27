import Fastify from 'fastify';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth.js';
import inferenceRoute from './routes/inference.js';
import { rateLimiter } from './utils/rateLimiter.js';
import { logRequest } from './utils/logger.js';
import modelsRoute from './routes/models.js';


dotenv.config();
const fastify = Fastify({ logger: true });

// Register models
fastify.register(modelsRoute);

// Register global hooks
fastify.addHook('onRequest', rateLimiter);
fastify.addHook('onRequest', logRequest);

// Register plugins and routes
fastify.register(authPlugin);
fastify.register(inferenceRoute);

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log('Server running...');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
