import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, PublicUser } from '../types';
import { AppError } from './error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'TOKEN_INVALID', 'No token provided');
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as PublicUser;
      req.user = decoded;
      next();
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AppError(401, 'TOKEN_EXPIRED', 'Token has expired');
      }
      throw new AppError(401, 'TOKEN_INVALID', 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};
