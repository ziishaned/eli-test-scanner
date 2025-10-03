import { create } from 'zustand';
import { TestSubmission } from '../types';

interface AppStore {
  submissions: TestSubmission[];
  isOnline: boolean;
  isSubmitting: boolean;

  // Actions
  addSubmission: (submission: TestSubmission) => void;
  updateSubmission: (id: string, updates: Partial<TestSubmission>) => void;
  removeSubmission: (id: string) => void;
  setOnlineStatus: (isOnline: boolean) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  clearSubmissions: () => void;
}

export const useAppStore = create<AppStore>(set => ({
  submissions: [],
  isOnline: true,
  isSubmitting: false,

  addSubmission: (submission: TestSubmission) =>
    set(state => ({
      submissions: [submission, ...state.submissions],
    })),

  updateSubmission: (id: string, updates: Partial<TestSubmission>) =>
    set(state => ({
      submissions: state.submissions.map(submission =>
        submission.id === id ? { ...submission, ...updates } : submission,
      ),
    })),

  removeSubmission: (id: string) =>
    set(state => ({
      submissions: state.submissions.filter(submission => submission.id !== id),
    })),

  setOnlineStatus: (isOnline: boolean) => set(() => ({ isOnline })),

  setSubmitting: (isSubmitting: boolean) => set(() => ({ isSubmitting })),

  clearSubmissions: () => set(() => ({ submissions: [] })),
}));
