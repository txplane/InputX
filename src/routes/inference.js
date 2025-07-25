import { runInference } from '../services/openai.js';
import { trackUsage } from '../utils/tokenTracker.js';
import { validateInferenceRequest, createErrorResponse, handleAsyncError } from '../utils/validation.js';

export default async function (fastify, options) {
  fastify.post('/inference', {
    schema: {
      tags: ['Inference'],
      summary: 'Run AI inference',
      description: 'Execute AI inference using the specified model and prompt',
      security: [{ apiKey: [] }],
      body: {
        type: 'object',
        required: ['prompt'],
        properties: {
          prompt: {
            type: 'string',
            minLength: 1,
            maxLength: 10000,
            description: 'The input prompt for the AI model'
          },
          model: {
            type: 'string',
            description: 'The AI model to use for inference',
            default: 'gpt-4o'
          },
          temperature: {
            type: 'number',
            minimum: 0,
            maximum: 2,
            description: 'Controls randomness in the response (0 = deterministic, 2 = very random)'
          },
          max_tokens: {
            type: 'integer',
            minimum: 1,
            maximum: 4000,
            description: 'Maximum number of tokens to generate'
          }
        }
      },
      response: {
        200: {
          description: 'Successful inference response',
          type: 'object',
          properties: {
            result: {
              type: 'string',
              description: 'The AI model response'
            },
            model: {
              type: 'string',
              description: 'The model used for inference'
            },
            usage: {
              type: 'object',
              properties: {
                prompt_tokens: { type: 'integer' },
                completion_tokens: { type: 'integer' },
                total_tokens: { type: 'integer' }
              }
            }
          }
        },
        400: {
          description: 'Bad request - validation error',
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'integer' },
            details: { type: 'array', items: { type: 'string' } }
          }
        },
        401: {
          description: 'Unauthorized - missing API key',
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        },
        403: {
          description: 'Forbidden - invalid API key',
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        },
        429: {
          description: 'Rate limit exceeded',
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'boolean' },
            message: { type: 'string' },
            statusCode: { type: 'integer' }
          }
        }
      }
    }
  }, async (request, reply) => {
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
}
