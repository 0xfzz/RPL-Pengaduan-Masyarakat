'use client'
import React, { useLayoutEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaClipboardList, FaUsers, FaUser } from "react-icons/fa";
import styles from "./SidebarDashboard.module.css";
import { useAuthStore } from "@/store/authStore";
import toast from 'react-hot-toast';
import axiosInstance from "@/utils/axiosConfig";

const SidebarDashboard: React.FC = () => {
  const { getUser, clearToken } = useAuthStore();
  const user = getUser();
  const userRole = user?.role || "";
  const pathname = usePathname();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  // Memoize the validation function to prevent recreating it on every render
  const validateToken = useCallback(async () => {
    if (hasValidated) return; // Prevent multiple validations
    
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("No authentication token found. Please login.");
      router.push("/auth/login");
      return;
    }

    try {
      // Client-side token expiry check first (faster)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (currentTime >= payload.exp) {
        toast.error("Your session has expired. Please login again.");
        clearToken();
        router.push("/auth/login");
        return;
      }

      // Show loading toast for server validation
      const loadingToast = toast.loading("Validating session...");

      // Server-side validation
      const response = await axiosInstance.post("/api/auth/validate", { token });
      
      toast.dismiss(loadingToast);
      
      if (response.status === 200) {
        setIsValidating(false);
        setHasValidated(true); // Mark as validated
        
        // Check if token expires soon (less than 5 minutes)
        const timeUntilExpiry = payload.exp - currentTime;
        if (timeUntilExpiry < 300) {
          const minutesLeft = Math.ceil(timeUntilExpiry / 60);
          toast(`⚠️ Session expires in ${minutesLeft} minute(s)`, {
            duration: 6000,
            style: {
              background: '#f59e0b',
              color: '#fff',
            },
          });
        }
      }
    } catch (error: any) {
      console.error("Token validation error:", error);
      
      // Clear invalid token
      clearToken();
      
      // Show appropriate error message
      if (error.response?.status === 401) {
        toast.error("Your session is invalid. Please login again.");
      } else {
        toast.error("Session validation failed. Please login again.");
      }
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    }
  }, [hasValidated, clearToken, router]);

  useLayoutEffect(() => {
    validateToken();
  }, []);

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          <img src="/images/PNG WARNA PUTIH.png" alt="Logo Portal Masyarakat" />
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <span className="ml-2 text-white text-sm">Validating...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <img src="/images/PNG WARNA PUTIH.png" alt="Logo Portal Masyarakat" />
      </div>
      <nav className={styles.navContainer}>
        <Link 
          href="/dashboard" 
          className={`${styles.navItem} ${pathname === "/dashboard" ? styles.active : ""}`}
        >
          <FaHome className="mr-2" /> Dashboard
        </Link>
        
        <Link 
          href="/dashboard/list-aduan" 
          className={`${styles.navItem} ${pathname === "/dashboard/list-aduan" ? styles.active : ""}`}
        >
          <FaClipboardList className="mr-2" /> 
          {userRole === "masyarakat" ? "Pengaduan Saya" : "List Pengaduan"}
        </Link>
      {userRole === "admin" ? (
        <Link 
          href="/dashboard/list-user" 
          className={`${styles.navItem} ${pathname === "/dashboard/list-user" ? styles.active : ""}`}
        >
          <FaUsers className="mr-2" />  Manajemen User
        </Link>
      ) : ""}
      </nav>
    </div>
  );
};

export default SidebarDashboard;