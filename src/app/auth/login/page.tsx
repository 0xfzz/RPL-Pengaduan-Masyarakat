"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import Sidebar from "../../../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import Link from "next/link";

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
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img
                src="/images/LOGO BIRU PNG.png"
                alt="Logo Portal Masyarakat"
                className="h-24"
              />
            </div>
            <CardTitle className="text-2xl font-semibold text-center text-blue-800">
              Login
            </CardTitle>
            <p className="text-sm text-center text-gray-600">
              Enter your credentials
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan email Anda"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.email && (
                  <p className="text-sm text-red-500">Email harus diisi</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-500">Password harus diisi</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Belum punya akun?{" "}
                <Link 
                  href="/auth/register" 
                  className={`text-blue-800 hover:text-blue-900 transition-colors duration-200 ${
                    loading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Daftar di sini
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;