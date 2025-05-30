import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000", // Set your API base URL
});

// Add a request interceptor to attach the token
axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = useAuthStore.getState().token; // Get the token from the global state
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;