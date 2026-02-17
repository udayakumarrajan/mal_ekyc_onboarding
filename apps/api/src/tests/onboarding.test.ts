import request from 'supertest';
import app from '../app';

describe('Onboarding Endpoints', () => {
  let accessToken: string;

  beforeAll(async () => {
    // Login to get access token
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'udayakumar.rajan@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.session.accessToken;
  });

  describe('POST /v1/onboarding/submit', () => {
    const validDraft = {
      draft: {
        profile: {
          fullName: 'John Doe',
          dateOfBirth: '1990-01-01',
          nationality: 'US',
        },
        document: {
          documentType: 'PASSPORT',
          documentNumber: 'P12345678',
        },
        address: {
          addressLine1: '123 Main St',
          city: 'Springfield',
          country: 'US',
        },
        consents: {
          termsAccepted: true,
        },
      },
    };

    it('should submit onboarding successfully with valid data', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(validDraft);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('submissionId');
      expect(response.body).toHaveProperty('status', 'RECEIVED');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/v1/onboarding/submit')
        .send(validDraft);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return validation error for missing profile.fullName', async () => {
      const invalidDraft = {
        draft: {
          ...validDraft.draft,
          profile: {
            ...validDraft.draft.profile,
            fullName: '',
          },
        },
      };

      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidDraft);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toHaveProperty('fieldErrors');
      expect(response.body.error.details.fieldErrors['draft.profile.fullName']).toBeDefined();
    });

    it('should return validation error for missing document.documentNumber', async () => {
      const invalidDraft = {
        draft: {
          ...validDraft.draft,
          document: {
            ...validDraft.draft.document,
            documentNumber: '',
          },
        },
      };

      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidDraft);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.body.error.details).toHaveProperty('fieldErrors');
    });

    it('should return validation error for invalid document type', async () => {
      const invalidDraft = {
        draft: {
          ...validDraft.draft,
          document: {
            ...validDraft.draft.document,
            documentType: 'INVALID_TYPE',
          },
        },
      };

      const response = await request(app)
        .post('/v1/onboarding/submit')
        .set('Authorization', `Bearer ${accessToken}`)
        .send(invalidDraft);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
    });
  });

  describe('GET /v1/verification/status', () => {
    it('should return verification status with valid token', async () => {
      const response = await request(app)
        .get('/v1/verification/status')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('updatedAt');
      expect(response.body).toHaveProperty('details');
      expect(['NOT_STARTED', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'MANUAL_REVIEW']).toContain(
        response.body.status
      );
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app).get('/v1/verification/status');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
