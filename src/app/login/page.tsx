"use client";
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: false, password: false });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: !value.trim() });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      email: !formData.email.trim(),
      password: !formData.password.trim(),
    };
    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      alert("Login berhasil! Anda akan diarahkan ke dashboard.");
      // Redirect to dashboard
      // window.location.href = "/dashboard";
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
          <h2 className="text-2xl font-semibold text-center text-blue-800 mb-2">Login</h2>
          <p className="text-sm text-center text-gray-600 mb-6">Enter your credentials</p>
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
          >
            Sign In
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