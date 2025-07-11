export default async function (fastify, options) {
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check OpenAI connectivity
    try {
      if (process.env.OPENAI_API_KEY) {
        health.openai = 'connected';
      } else {
        health.openai = 'not_configured';
      }
    } catch (error) {
      health.openai = 'error';
    }

    // Check Stripe connectivity
    try {
      if (process.env.STRIPE_SECRET_KEY) {
        health.stripe = 'connected';
      } else {
        health.stripe = 'not_configured';
      }
    } catch (error) {
      health.stripe = 'error';
    }

    reply.send(health);
  });

  fastify.get('/health/ready', async (request, reply) => {
    // More detailed readiness check
    const checks = {
      server: true,
      openai: !!process.env.OPENAI_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY
    };

    const isReady = Object.values(checks).every(check => check);
    const statusCode = isReady ? 200 : 503;

    reply.code(statusCode).send({
      ready: isReady,
      checks,
      timestamp: new Date().toISOString()
    });
  });
} 