import { OnboardingSubmission, VerificationStatus, VerificationStatusType } from '../types';

// In-memory onboarding storage
const submissions: Map<string, OnboardingSubmission> = new Map();
const verificationStatuses: Map<string, VerificationStatus> = new Map();

export class OnboardingRepository {
  async createSubmission(submission: OnboardingSubmission): Promise<OnboardingSubmission> {
    submissions.set(submission.userId, submission);
    return submission;
  }

  async findSubmissionByUserId(userId: string): Promise<OnboardingSubmission | null> {
    return submissions.get(userId) || null;
  }

  async getVerificationStatus(userId: string): Promise<VerificationStatus> {
    const existing = verificationStatuses.get(userId);
    if (existing) {
      return existing;
    }

    // Default status if not found
    const defaultStatus: VerificationStatus = {
      status: 'NOT_STARTED',
      updatedAt: new Date().toISOString(),
      details: {
        reasons: []
      }
    };
    return defaultStatus;
  }

  async updateVerificationStatus(userId: string, status: VerificationStatusType): Promise<VerificationStatus> {
    const verificationStatus: VerificationStatus = {
      status,
      updatedAt: new Date().toISOString(),
      details: {
        reasons: []
      }
    };
    verificationStatuses.set(userId, verificationStatus);
    return verificationStatus;
  }
}
