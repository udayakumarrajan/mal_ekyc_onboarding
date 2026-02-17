import { OnboardingRepository } from '../repositories/onboarding.repository';
import { OnboardingDraft, OnboardingSubmission, VerificationStatus } from '../types';
import { AppError } from '../middleware/error.middleware';

export class OnboardingService {
  constructor(private onboardingRepository: OnboardingRepository) {}

  async submitOnboarding(userId: string, draft: OnboardingDraft): Promise<{ submissionId: string; status: string }> {
    // Validate draft (basic validation)
    this.validateDraft(draft);

    const submission: OnboardingSubmission = {
      id: `SUB-${Date.now()}`,
      userId,
      draft,
      submittedAt: new Date().toISOString()
    };

    await this.onboardingRepository.createSubmission(submission);
    await this.onboardingRepository.updateVerificationStatus(userId, 'IN_PROGRESS');

    return {
      submissionId: submission.id,
      status: 'RECEIVED'
    };
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    return await this.onboardingRepository.getVerificationStatus(userId);
  }

  async processVerification(userId: string): Promise<VerificationStatus> {
    // Get current status
    const currentStatus = await this.onboardingRepository.getVerificationStatus(userId);

    // Only process if status is IN_PROGRESS
    if (currentStatus.status !== 'IN_PROGRESS') {
      throw new AppError(400, 'INVALID_STATUS', 'Verification can only be processed when status is IN_PROGRESS');
    }

    // Simulate processing delay (2-5 seconds)
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Random outcome based on probability
    // 70% APPROVED, 20% MANUAL_REVIEW, 10% REJECTED
    const random = Math.random();
    let newStatus: 'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED';
    
    if (random < 0.7) {
      newStatus = 'APPROVED';
    } else if (random < 0.9) {
      newStatus = 'MANUAL_REVIEW';
    } else {
      newStatus = 'REJECTED';
    }

    // Update status
    const updatedStatus = await this.onboardingRepository.updateVerificationStatus(userId, newStatus);
    
    return updatedStatus;
  }

  private validateDraft(draft: OnboardingDraft): void {
    const errors: Record<string, string> = {};

    // Profile validation
    if (!draft.profile?.fullName) {
      errors['profile.fullName'] = 'Full name is required';
    }
    if (!draft.profile?.dateOfBirth) {
      errors['profile.dateOfBirth'] = 'Date of birth is required';
    }
    if (!draft.profile?.nationality) {
      errors['profile.nationality'] = 'Nationality is required';
    }

    // Document validation
    if (!draft.document?.documentType) {
      errors['document.documentType'] = 'Document type is required';
    }
    if (!draft.document?.documentNumber) {
      errors['document.documentNumber'] = 'Document number is required';
    }

    // Address validation
    if (!draft.address?.addressLine1) {
      errors['address.addressLine1'] = 'Address is required';
    }
    if (!draft.address?.city) {
      errors['address.city'] = 'City is required';
    }
    if (!draft.address?.country) {
      errors['address.country'] = 'Country is required';
    }

    // Consents validation
    if (!draft.consents?.termsAccepted) {
      errors['consents.termsAccepted'] = 'Terms must be accepted';
    }

    if (Object.keys(errors).length > 0) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid input', { fieldErrors: errors });
    }
  }
}
