import { create } from 'zustand';
import api from '../utils/api';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  register: async (name, email, password, role) => {
    set({ loading: true, error: null });
    try {
      const data = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, loading: false });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}));

export default useAuthStore;
