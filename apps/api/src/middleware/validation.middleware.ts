import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './error.middleware';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const fieldErrors: Record<string, string> = {};
    
    errors.array().forEach(error => {
      if (error.type === 'field') {
        fieldErrors[error.path] = error.msg;
      }
    });

    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', { fieldErrors });
  }
  
  next();
};
