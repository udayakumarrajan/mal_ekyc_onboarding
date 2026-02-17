import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';
import { log } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const correlationId = req.correlationId;

  if (err instanceof AppError) {
    log.warn('Application error', {
      correlationId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    const errorResponse: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
    return res.status(err.statusCode).json(errorResponse);
  }

  // Log unexpected errors
  log.error('Unexpected error', {
    correlationId,
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Default error response (don't leak error details)
  const errorResponse: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  };

  res.status(500).json(errorResponse);
};
