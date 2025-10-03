import { create } from "zustand";
import { AppState, TestSubmission } from "../types";

interface AppStore extends AppState {
  addSubmission: (submission: Omit<TestSubmission, "id">) => void;
  updateSubmission: (id: string, updates: Partial<TestSubmission>) => void;
  setOfflineStatus: (isOffline: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  submissions: [],
  isOffline: false,
  isLoading: false,
  error: null,

  addSubmission: (submission) =>
    set((state) => ({
      submissions: [
        {
          ...submission,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        },
        ...state.submissions,
      ],
    })),

  updateSubmission: (id, updates) =>
    set((state) => ({
      submissions: state.submissions.map((submission) =>
        submission.id === id ? { ...submission, ...updates } : submission
      ),
    })),

  setOfflineStatus: (isOffline) => set({ isOffline }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
