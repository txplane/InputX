import { runInference } from '../services/openai.js';
import { trackUsage } from '../utils/tokenTracker.js';

export default async function (fastify, options) {
  fastify.post('/inference', async (request, reply) => {
    const { prompt, model } = request.body;

    if (!prompt) {
      reply.code(400).send({ error: 'Missing prompt in request body' });
      return;
    }

    try {
      const output = await runInference(prompt, model);

      const apiKey = request.headers['authorization']?.split(' ')[1];
      trackUsage({
        apiKey,
        model: model || 'default',
        prompt,
        response: output
      });

      reply.send({ result: output });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ error: 'Inference failed' });
    }
  });
}
