import { create } from 'zustand';

const useAppStore = create((set) => ({
  sidebarOpen: true,
  currentModule: 'dashboard',
  notifications: [],
  unreadCount: 0,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setCurrentModule: (module) => set({ currentModule: module }),
  setNotifications: (notifications) => set({ notifications }),
  setUnreadCount: (count) => set({ unreadCount: count }),
}));

export default useAppStore;
