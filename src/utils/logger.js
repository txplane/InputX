import winston from 'winston';
import path from 'path';

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = './logs';
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'inputx' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs with level 'info' and below to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

// Log request details
export function logRequest(request, reply, done) {
  logger.info('Request received', {
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });
  
  done();
}

// Log usage tracking
export function logUsage(usageData) {
  logger.info('Usage tracked', {
    apiKey: usageData.apiKey ? `${usageData.apiKey.substring(0, 8)}...` : 'unknown',
    model: usageData.model,
    tokensUsed: usageData.tokensUsed,
    timestamp: new Date().toISOString()
  });
}

// Log errors
export function logError(error, context = {}) {
  logger.error('Application error', {
    error: error.message,
    stack: error.stack,
    ...context
  });
}

// Log startup information
export function logStartup(port) {
  logger.info('InputX server starting', {
    port,
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
}

export default logger;
