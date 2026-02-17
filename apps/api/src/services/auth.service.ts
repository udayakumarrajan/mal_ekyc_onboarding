import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { Session, PublicUser } from '../types';
import { AppError } from '../middleware/error.middleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-12345';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sessionRepository: SessionRepository
  ) {}

  async login(email: string, password: string): Promise<{ user: PublicUser; session: Session }> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };

    const accessToken = jwt.sign(publicUser, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions);
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY } as jwt.SignOptions);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes

    const session: Session = {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      userId: user.id
    };

    await this.sessionRepository.create(session);

    return { user: publicUser, session };
  }

  async refresh(refreshToken: string): Promise<Session> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: string };
      const session = await this.sessionRepository.findByRefreshToken(refreshToken);

      if (!session) {
        throw new AppError(401, 'TOKEN_INVALID', 'Invalid refresh token');
      }

      const user = await this.userRepository.findById(decoded.userId);
      
      if (!user) {
        throw new AppError(401, 'TOKEN_INVALID', 'User not found');
      }

      const publicUser: PublicUser = {
        id: user.id,
        email: user.email,
        fullName: user.fullName
      };

      const newAccessToken = jwt.sign(publicUser, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY } as jwt.SignOptions);
      const newRefreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY } as jwt.SignOptions);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      const newSession: Session = {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: expiresAt.toISOString(),
        userId: user.id
      };

      await this.sessionRepository.update(user.id, newSession);

      return newSession;
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(401, 'TOKEN_INVALID', 'Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName
    };
  }
}
