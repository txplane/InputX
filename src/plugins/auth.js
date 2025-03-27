export default async function (fastify, options) {
  fastify.addHook('onRequest', async (request, reply) => {
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
