"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "../../../components/Sidebar";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: false, password: false });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);    
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !value.trim() });
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      email: !formData.email.trim(),
      password: !formData.password.trim(),
    };
    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      setLoading(true);
      try {
        const response = await axiosInstance.post<any>("/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const { token, user } = response.data;

        // Store the token and user in the global state
        setToken(token);

        // Redirect to the dashboard
        router.push("/dashboard");
      } catch (error: any) {
        console.error("Error during login:", error);
        setErrorMessage(
          error.response?.data?.error || "An unexpected error occurred. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 items-center justify-center bg-gray-100 p-4">
        <form
          className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-lg p-6"
          onSubmit={handleSubmit}
        >
          <img
            src="/images/LOGO BIRU PNG.png"
            alt="Logo Portal Masyarakat"
            className="h-24 mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-center text-blue-800 mb-2">Login</h2>
          <p className="text-sm text-center text-gray-600 mb-6">Enter your credentials</p>

          {errorMessage && (
            <div className="mb-4 text-red-500 text-sm text-center">{errorMessage}</div>
          )}

          <div className={`relative mb-4 ${errors.email ? "border-red-500" : ""}`}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">Email harus diisi</div>
            )}
          </div>
          <div className={`relative mb-4 ${errors.password ? "border-red-500" : ""}`}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={`w-full text-black px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <div className="text-red-500 text-sm mt-1">Password harus diisi</div>
            )}
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition duration-300"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Belum punya akun?{" "}
            <a href="/register" className="text-blue-800 hover:text-blue-900">
              Daftar di sini
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;