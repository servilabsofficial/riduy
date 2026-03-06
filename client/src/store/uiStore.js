import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarCollapsed: false,
  darkMode: localStorage.getItem('darkMode') === 'true',

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.darkMode;
      localStorage.setItem('darkMode', newMode.toString());
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { darkMode: newMode };
    }),

  initDarkMode: () => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
    set({ darkMode });
  },
}));

export default useUIStore;
