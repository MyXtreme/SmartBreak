import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { id, name, email, role }
      token: null,

      login: (userData, token) => {
        set({ user: userData, token });
      },

      logout: () => {
        set({ user: null, token: null });
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },
    }),
    {
      name: "auth-storage", // localStorage key
    },
  ),
);

export default useAuthStore;
