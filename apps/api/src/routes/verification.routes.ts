import { Router, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { OnboardingService } from '../services/onboarding.service';
import { OnboardingRepository } from '../repositories/onboarding.repository';
import { AuthRequest } from '../types';
import { log } from '../utils/logger';

const router = Router();
const onboardingService = new OnboardingService(new OnboardingRepository());

// GET /v1/verification/status
router.get('/status', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const status = await onboardingService.getVerificationStatus(req.user.id);
    res.json(status);
  } catch (error) {
    next(error);
  }
});

// POST /v1/verification/process
router.post('/process', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    log.info('Starting verification processing', {
      correlationId: req.correlationId,
      userId: req.user.id,
    });

    const status = await onboardingService.processVerification(req.user.id);
    
    log.info('Verification processing completed', {
      correlationId: req.correlationId,
      userId: req.user.id,
      newStatus: status.status,
    });

    res.json(status);
  } catch (error) {
    next(error);
  }
});

export default router;
