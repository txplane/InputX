import { getSupportedModels } from '../services/openai.js';

export default async function (fastify, options) {
  fastify.get('/models', async (request, reply) => {
    const models = getSupportedModels();
    reply.send({ models });
  });
}
