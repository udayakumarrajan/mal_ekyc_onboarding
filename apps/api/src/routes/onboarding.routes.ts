import { Router, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { OnboardingService } from '../services/onboarding.service';
import { OnboardingRepository } from '../repositories/onboarding.repository';
import { AuthRequest } from '../types';

const router = Router();
const onboardingService = new OnboardingService(new OnboardingRepository());

// POST /v1/onboarding/submit
router.post(
  '/submit',
  authenticate,
  [
    body('draft').isObject().withMessage('Draft is required'),
    body('draft.profile.fullName').notEmpty().withMessage('Full name is required'),
    body('draft.profile.dateOfBirth').notEmpty().withMessage('Date of birth is required'),
    body('draft.profile.nationality').notEmpty().withMessage('Nationality is required'),
    body('draft.document.documentType').isIn(['PASSPORT', 'DRIVERS_LICENSE', 'NATIONAL_ID']).withMessage('Valid document type is required'),
    body('draft.document.documentNumber').notEmpty().withMessage('Document number is required'),
    body('draft.address.addressLine1').notEmpty().withMessage('Address is required'),
    body('draft.address.city').notEmpty().withMessage('City is required'),
    body('draft.address.country').notEmpty().withMessage('Country is required'),
    body('draft.consents.termsAccepted').isBoolean().equals('true').withMessage('Terms must be accepted'),
    validate
  ],
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { draft } = req.body;
      const result = await onboardingService.submitOnboarding(req.user.id, draft);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
