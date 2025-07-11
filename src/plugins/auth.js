export default async function (fastify, options) {
  // Add auth hook only to specific routes
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip auth for public routes
    const publicRoutes = ['/health', '/health/ready', '/models'];
    const currentPath = request.routerPath || request.url;
    
    console.log('Auth check for path:', currentPath);
    
    if (publicRoutes.includes(currentPath)) {
      console.log('Skipping auth for public route:', currentPath);
      return;
    }

    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.code(401).send({ error: 'Unauthorized: No API key provided' });
      return;
    }

    const apiKey = authHeader.split(' ')[1];
    const allowedKeys = process.env.ALLOWED_API_KEYS?.split(',') || [];

    if (!allowedKeys.includes(apiKey)) {
      reply.code(403).send({ error: 'Forbidden: Invalid API key' });
    }
  });
}
