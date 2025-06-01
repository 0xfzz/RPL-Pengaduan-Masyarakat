import { create } from "zustand";
import axiosInstance from "@/utils/axiosConfig";
import toast from 'react-hot-toast';

interface AuthState {
  token: string | null;
  user: any;
  setToken: (token: string) => void;
  clearToken: () => void;
  getUser: () => any;
  logout: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
  user: null,
  
  setToken: (token) => {
    localStorage.setItem("token", token);
    const payload = JSON.parse(atob(token.split('.')[1]));
    set({ token, user: payload });
  },
  
  clearToken: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
  
  getUser: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return payload;
        } catch (error) {
          console.error("Error parsing token:", error);
          localStorage.removeItem("token");
          set({ token: null, user: null });
          return null;
        }
      }
    }
    return null;
  },

  validateToken: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    try {
      const response: any = await axiosInstance.post("/api/auth/validate", { token });
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  },

  logout: async () => {
      toast.success("Logged out successfully!");
      localStorage.removeItem("token");
      set({ token: null, user: null });
      
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
      }, 1000);
  }
}));