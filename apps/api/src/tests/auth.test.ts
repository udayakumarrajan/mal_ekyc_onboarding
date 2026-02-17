import request from 'supertest';
import app from '../app';

describe('Auth Endpoints', () => {
  describe('POST /v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'udayakumar.rajan@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('session');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('email', 'udayakumar.rajan@example.com');
      expect(response.body.session).toHaveProperty('accessToken');
      expect(response.body.session).toHaveProperty('refreshToken');
      expect(response.body.session).toHaveProperty('expiresAt');
    });

    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'udayakumar.rajan@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'INVALID_CREDENTIALS');
      expect(response.body.error).toHaveProperty('message');
    });

    it('should return validation error for missing email', async () => {
      const response = await request(app)
        .post('/v1/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toHaveProperty('fieldErrors');
    });
  });

  describe('POST /v1/auth/refresh', () => {
    let refreshToken: string;

    beforeAll(async () => {
      // Login first to get a refresh token
      const loginResponse = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'udayakumar.rajan@example.com',
          password: 'password123',
        });

      refreshToken = loginResponse.body.session.refreshToken;
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('session');
      expect(response.body.session).toHaveProperty('accessToken');
      expect(response.body.session).toHaveProperty('refreshToken');
    });

    it('should return 401 with invalid refresh token', async () => {
      const response = await request(app)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_INVALID');
    });
  });

  describe('GET /v1/me', () => {
    let accessToken: string;

    beforeAll(async () => {
      // Login first to get an access token
      const loginResponse = await request(app)
        .post('/v1/auth/login')
        .send({
          email: 'udayakumar.rajan@example.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.session.accessToken;
    });

    it('should return user info with valid token', async () => {
      const response = await request(app)
        .get('/v1/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', 'udayakumar.rajan@example.com');
      expect(response.body).toHaveProperty('fullName');
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/v1/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_INVALID');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/v1/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'TOKEN_INVALID');
    });
  });
});
