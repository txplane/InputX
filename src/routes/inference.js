import { runInference } from '../services/openai.js';
import { trackUsage } from '../utils/tokenTracker.js';
import { validateInferenceRequest, createErrorResponse, handleAsyncError } from '../utils/validation.js';

export default async function (fastify, options) {
  fastify.post('/inference', async (request, reply) => {
    try {
      // Authentication check
      const authHeader = request.headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send(createErrorResponse(401, 'Unauthorized: No API key provided'));
      }

      const apiKey = authHeader.split(' ')[1];
      const allowedKeys = process.env.ALLOWED_API_KEYS?.split(',') || [];

      if (!allowedKeys.includes(apiKey)) {
        return reply.code(403).send(createErrorResponse(403, 'Forbidden: Invalid API key'));
      }

      // Validate request body
      const validation = validateInferenceRequest(request.body);
      if (!validation.isValid) {
        return reply.code(400).send(createErrorResponse(400, 'Validation failed', validation.errors));
      }

      const { prompt, model = 'gpt-4o', temperature, max_tokens } = request.body;

      // Run inference
      const output = await runInference(prompt, model, { temperature, max_tokens });

      // Track usage
      trackUsage({
        apiKey,
        model,
        prompt,
        response: output
      });

      reply.send({ 
        result: output,
        model,
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(output.length / 4),
          total_tokens: Math.ceil((prompt.length + output.length) / 4)
        }
      });
    } catch (error) {
      return handleAsyncError(error, reply);
    }
  });

  // Add schema for request validation
  fastify.addSchema({
    $id: 'inferenceRequest',
    type: 'object',
    required: ['prompt'],
    properties: {
      prompt: { type: 'string', minLength: 1, maxLength: 10000 },
      model: { type: 'string' },
      temperature: { type: 'number', minimum: 0, maximum: 2 },
      max_tokens: { type: 'integer', minimum: 1, maximum: 4000 }
    }
  });
}
