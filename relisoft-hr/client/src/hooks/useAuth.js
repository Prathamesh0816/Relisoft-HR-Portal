import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  login: async (credentials) => {
    set({ loading: true });
    try {
      const { data: res } = await authAPI.login(credentials);
      const userData = res.data || res;
      const token = userData.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true, loading: false });
      return userData;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  ssoLogin: async (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },
  logout: async () => {
    try {
      await authAPI.logout();
    } catch {
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await authAPI.getCurrentUser();
      set({ user: data, isAuthenticated: true });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, isAuthenticated: false });
    }
  },
  updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
}));

export default useAuth;
