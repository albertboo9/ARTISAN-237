import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isCommandBarOpen: boolean;
  hasCompletedOnboarding: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCommandBarOpen: (open: boolean) => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isSidebarOpen: true,
  isCommandBarOpen: false,
  hasCompletedOnboarding: false,

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setCommandBarOpen: (open) => set({ isCommandBarOpen: open }),

  completeOnboarding: () => {
    localStorage.setItem('artisan237-onboarded', 'true');
    set({ hasCompletedOnboarding: true });
  },

  skipOnboarding: () => {
    localStorage.setItem('artisan237-onboarded', 'true');
    set({ hasCompletedOnboarding: true });
  },

  resetOnboarding: () => {
    localStorage.removeItem('artisan237-onboarded');
    set({ hasCompletedOnboarding: false });
  },
}));