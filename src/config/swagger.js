export const swaggerConfig = {
  swagger: {
    info: {
      title: 'InputX API',
      description: 'A high-speed API gateway for AI inference',
      version: '1.0.0',
      contact: {
        name: 'InputX Support',
        email: 'support@inputx.ai'
      }
    },
    host: 'localhost:3000',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Models', description: 'Model management endpoints' },
      { name: 'Inference', description: 'AI inference endpoints' }
    ],
    securityDefinitions: {
      apiKey: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'API key for authentication'
      }
    }
  },
  // Disable strict mode to allow example keywords
  ajv: {
    customOptions: {
      strict: false
    }
  }
};

export const swaggerUIConfig = {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    }
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => {
    return swaggerObject;
  },
  transformSpecificationClone: true
}; 