import { create } from 'zustand';
import { apiClient } from '../services/api/client';
import { VerificationStatus } from '../types';

interface VerificationState {
  status: VerificationStatus | null;
  loading: boolean;
  error: string | null;
  isPolling: boolean;
  pollInterval: number;
  
  // Actions
  fetchStatus: () => Promise<void>;
  startPolling: (callback: () => void) => void;
  stopPolling: () => void;
  resetPollInterval: () => void;
}

let pollTimer: NodeJS.Timeout | null = null;

export const useVerificationStore = create<VerificationState>((set, get) => ({
  status: null,
  loading: false,
  error: null,
  isPolling: false,
  pollInterval: 2000, // Start with 2 seconds

  fetchStatus: async () => {
    try {
      set({ loading: true, error: null });
      
      console.log('[VerificationStore] Fetching status...');
      const response = await apiClient.get('/v1/verification/status');
      const status = response.data;
      console.log('[VerificationStore] Status fetched:', status);

      set({ status, loading: false });
      
      return status;
    } catch (error: any) {
      console.error('[VerificationStore] Failed to fetch status:', error);
      const errorMessage = error?.error?.message || 'Failed to fetch status';
      set({ error: errorMessage, loading: false });
    }
  },

  startPolling: (callback: () => void) => {
    const state = get();
    
    // Don't start if already polling
    if (state.isPolling) return;
    
    set({ isPolling: true });
    
    const poll = async () => {
      const currentState = get();
      
      // Fetch status
      await currentState.fetchStatus();
      
      const newStatus = get().status;
      
      // Check if we should continue polling
      const shouldContinuePolling = 
        newStatus?.status === 'IN_PROGRESS' || 
        newStatus?.status === 'MANUAL_REVIEW';
      
      if (!shouldContinuePolling) {
        // Final status reached, stop polling
        get().stopPolling();
        return;
      }
      
      // Exponential backoff: 2s → 4s → 8s (max 10s)
      const currentInterval = get().pollInterval;
      const nextInterval = Math.min(currentInterval * 2, 10000);
      set({ pollInterval: nextInterval });
      
      // Schedule next poll
      if (get().isPolling) {
        pollTimer = setTimeout(poll, nextInterval);
      }
      
      // Call callback for UI updates
      callback();
    };
    
    // Start first poll
    poll();
  },

  stopPolling: () => {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
    set({ isPolling: false });
  },

  resetPollInterval: () => {
    set({ pollInterval: 2000 });
  },
}));
