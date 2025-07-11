export const validateInferenceRequest = (body) => {
  const errors = [];

  if (!body.prompt) {
    errors.push('Missing required field: prompt');
  } else if (typeof body.prompt !== 'string') {
    errors.push('Prompt must be a string');
  } else if (body.prompt.trim().length === 0) {
    errors.push('Prompt cannot be empty');
  } else if (body.prompt.length > 10000) {
    errors.push('Prompt too long (max 10,000 characters)');
  }

  if (body.model && typeof body.model !== 'string') {
    errors.push('Model must be a string');
  }

  if (body.temperature !== undefined) {
    if (typeof body.temperature !== 'number') {
      errors.push('Temperature must be a number');
    } else if (body.temperature < 0 || body.temperature > 2) {
      errors.push('Temperature must be between 0 and 2');
    }
  }

  if (body.max_tokens !== undefined) {
    if (typeof body.max_tokens !== 'number' || !Number.isInteger(body.max_tokens)) {
      errors.push('Max tokens must be an integer');
    } else if (body.max_tokens < 1 || body.max_tokens > 4000) {
      errors.push('Max tokens must be between 1 and 4000');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const createErrorResponse = (statusCode, message, details = null) => {
  const error = {
    error: true,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (details) {
    error.details = details;
  }

  return error;
};

export const handleAsyncError = (error, reply) => {
  console.error('Request error:', error);

  if (error.code === 'FST_ERR_VALIDATION') {
    return reply.code(400).send(createErrorResponse(400, 'Validation error', error.validation));
  }

  if (error.code === 'FST_ERR_RATE_LIMIT') {
    return reply.code(429).send(createErrorResponse(429, 'Rate limit exceeded'));
  }

  if (error.message?.includes('Unauthorized')) {
    return reply.code(401).send(createErrorResponse(401, 'Unauthorized'));
  }

  if (error.message?.includes('Forbidden')) {
    return reply.code(403).send(createErrorResponse(403, 'Forbidden'));
  }

  // Default error
  return reply.code(500).send(createErrorResponse(500, 'Internal server error'));
}; 