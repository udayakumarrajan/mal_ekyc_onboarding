// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
}

// Session types
export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// Onboarding types
export type DocumentType = 'PASSPORT' | 'DRIVERS_LICENSE' | 'NATIONAL_ID';

export interface OnboardingDraft {
  profile: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
  };
  document: {
    documentType: DocumentType;
    documentNumber: string;
  };
  address: {
    addressLine1: string;
    city: string;
    country: string;
  };
  consents: {
    termsAccepted: boolean;
  };
}

// Verification types
export type VerificationStatusType = 'NOT_STARTED' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW';

export interface VerificationStatus {
  status: VerificationStatusType;
  updatedAt: string;
  details: {
    reasons: string[];
  };
}

// API Error types
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: {
      fieldErrors?: Record<string, string>;
    };
  };
}
