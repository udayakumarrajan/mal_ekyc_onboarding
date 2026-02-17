import { Session } from '../types';

// In-memory session storage
const sessions: Map<string, Session> = new Map();
const refreshTokens: Map<string, string> = new Map(); // refreshToken -> userId

export class SessionRepository {
  async create(session: Session): Promise<Session> {
    sessions.set(session.userId, session);
    refreshTokens.set(session.refreshToken, session.userId);
    return session;
  }

  async findByUserId(userId: string): Promise<Session | null> {
    return sessions.get(userId) || null;
  }

  async findByRefreshToken(refreshToken: string): Promise<Session | null> {
    const userId = refreshTokens.get(refreshToken);
    if (!userId) return null;
    return sessions.get(userId) || null;
  }

  async update(userId: string, session: Session): Promise<Session> {
    // Remove old refresh token
    const oldSession = sessions.get(userId);
    if (oldSession) {
      refreshTokens.delete(oldSession.refreshToken);
    }
    
    // Add new session
    sessions.set(userId, session);
    refreshTokens.set(session.refreshToken, userId);
    return session;
  }

  async delete(userId: string): Promise<void> {
    const session = sessions.get(userId);
    if (session) {
      refreshTokens.delete(session.refreshToken);
      sessions.delete(userId);
    }
  }
}
