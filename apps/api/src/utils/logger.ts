import winston from 'winston';

// Sanitize sensitive data from logs
const sanitize = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  const sensitiveKeys = [
    'password',
    'passwordHash',
    'accessToken',
    'refreshToken',
    'token',
    'authorization',
    'cookie',
    'secret',
  ];

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }

  return sanitized;
};

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ekyc-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(sanitize(meta), null, 2) : '';
          const corrId = correlationId ? `[${correlationId}]` : '';
          return `${timestamp} ${level} ${corrId}: ${message} ${metaStr}`;
        })
      ),
    }),
  ],
});

// Helper methods
export const log = {
  info: (message: string, meta?: any) => {
    logger.info(message, sanitize(meta));
  },
  
  warn: (message: string, meta?: any) => {
    logger.warn(message, sanitize(meta));
  },
  
  error: (message: string, meta?: any) => {
    logger.error(message, sanitize(meta));
  },
  
  debug: (message: string, meta?: any) => {
    logger.debug(message, sanitize(meta));
  },
};

export default logger;
