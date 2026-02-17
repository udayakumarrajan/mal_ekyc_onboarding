import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/api/client';
import { OnboardingDraft } from '../types';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

interface OnboardingState {
  draft: OnboardingDraft | null;
  currentStep: number; // 0-4
  submissionState: SubmissionState;
  error: string | null;
  
  // Actions
  updateDraft: (data: Partial<OnboardingDraft>) => void;
  nextStep: () => void;
  previousStep: () => void;
  submitOnboarding: () => Promise<void>;
  loadDraft: () => Promise<void>;
  resetDraft: () => void;
}

const initialDraft: OnboardingDraft = {
  profile: {
    fullName: '',
    dateOfBirth: '',
    nationality: '',
  },
  document: {
    documentType: 'PASSPORT',
    documentNumber: '',
  },
  address: {
    addressLine1: '',
    city: '',
    country: '',
  },
  consents: {
    termsAccepted: false,
  },
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  draft: initialDraft,
  currentStep: 0,
  submissionState: 'idle',
  error: null,

  updateDraft: async (data: Partial<OnboardingDraft>) => {
    const currentDraft = get().draft || initialDraft;
    const newDraft = { ...currentDraft, ...data };
    set({ draft: newDraft });
    
    // Persist draft
    await AsyncStorage.setItem('@onboarding_draft', JSON.stringify(newDraft));
  },

  nextStep: async () => {
    const currentStep = get().currentStep;
    if (currentStep < 4) {
      const newStep = currentStep + 1;
      set({ currentStep: newStep });
      await AsyncStorage.setItem('@onboarding_step', String(newStep));
    }
  },

  previousStep: async () => {
    const currentStep = get().currentStep;
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      set({ currentStep: newStep });
      await AsyncStorage.setItem('@onboarding_step', String(newStep));
    }
  },

  submitOnboarding: async () => {
    try {
      set({ submissionState: 'submitting', error: null });
      
      const draft = get().draft;
      if (!draft) {
        throw new Error('No draft data available');
      }

      console.log('[OnboardingStore] Submitting onboarding...');
      const response = await apiClient.post('/v1/onboarding/submit', { draft });
      console.log('[OnboardingStore] Onboarding submitted successfully:', response);
      
      set({ submissionState: 'success' });
      
      // Clear draft after successful submission
      get().resetDraft();
    } catch (error: any) {
      console.error('[OnboardingStore] Submission failed:', error);
      const errorMessage = error?.error?.message || 'Submission failed';
      set({ submissionState: 'error', error: errorMessage });
      throw error;
    }
  },

  loadDraft: async () => {
    try {
      const draftData = await AsyncStorage.getItem('@onboarding_draft');
      const stepData = await AsyncStorage.getItem('@onboarding_step');

      if (draftData) {
        const draft = JSON.parse(draftData);
        set({ draft });
      }

      if (stepData) {
        const step = parseInt(stepData, 10);
        set({ currentStep: step });
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  },

  resetDraft: async () => {
    set({ draft: initialDraft, currentStep: 0, submissionState: 'idle', error: null });
    await AsyncStorage.removeItem('@onboarding_draft');
    await AsyncStorage.removeItem('@onboarding_step');
  },
}));
