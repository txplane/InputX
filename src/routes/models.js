import { getSupportedModels } from '../services/openai.js';

export default async function (fastify, options) {
  fastify.get('/models', {
    schema: {
      tags: ['Models'],
      summary: 'Get supported models',
      description: 'Returns a list of all supported AI models',
      response: {
        200: {
          description: 'List of supported models',
          type: 'object',
          properties: {
            models: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const models = await getSupportedModels();
    reply.send({ models });
  });
}
