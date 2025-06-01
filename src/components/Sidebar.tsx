'use client'
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Sidebar.module.css";
import { useAuthStore } from "@/store/authStore";
import toast from 'react-hot-toast';

const Sidebar: React.FC = () => {
  const { clearToken, validateToken, token } = useAuthStore();
  const router = useRouter();
  
  useLayoutEffect(() => {
    const checkAuthStatus = async () => {
      // If no token, user can stay on login/register page
      if (!token) {
        return;
      }

      const isValid = await validateToken();
      if (isValid) {

        toast.success("Welcome back!");
        router.push("/dashboard");
        return;
      }
      toast.error("Session expired. Please login again.");
      clearToken();
    };

    checkAuthStatus();
  }, [clearToken, validateToken, router]);

  return (
    <div className={styles.leftSide}>
      <div className="flex items-center justify-center h-16">
        <img src="/images/PNG WARNA PUTIH.png" alt="Logo Portal Masyarakat" width="40%" />
      </div>
    </div>
  );
};

export default Sidebar;