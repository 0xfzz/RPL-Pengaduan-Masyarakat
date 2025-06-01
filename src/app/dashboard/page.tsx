"use client";

import { useState, useEffect } from "react";
import SidebarDashboard from "@/components/SidebarDashboard";
import { useAuthStore } from "@/store/authStore";
import Navbar from "@/components/Navbar";
import MasyarakatDashboard from "@/components/MasyarakatDashboard";
import AdminPetugasDashboard from "@/components/AdminPetugasDashboard";

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuthStore();
  const user = getUser();
  const userRole = user?.role || "";

  useEffect(() => {
    document.title = "Dashboard - Pengaduan Masyarakat";
    // Simulate loading check
    if (user) {
      setLoading(false);
    }
  }, [user]);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 10) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          {/* Greeting Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 mb-6 text-white">
            <h1 className="text-3xl font-bold mb-2">
              Halo, {user?.nama_lengkap || user?.nama || "User"}! 👋
            </h1>
            <p className="text-blue-100">
              {getGreeting()}! Selamat datang di Dashboard{" "}
              {userRole === "admin"
                ? "Administrator"
                : userRole === "petugas"
                ? "Petugas"
                : "Portal Pengaduan Masyarakat"}
              .
            </p>
          </div>

          {/* Role-based Dashboard Content */}
          {userRole === "masyarakat" ? (
            <MasyarakatDashboard />
          ) : (
            <AdminPetugasDashboard userRole={userRole} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;