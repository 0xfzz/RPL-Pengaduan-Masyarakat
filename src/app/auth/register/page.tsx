"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosConfig";
import Sidebar from "../../../components/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const Register: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        nik: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({
        fullName: false,
        nik: false,
        phone: false,
        address: false,
        password: false,
        confirmPassword: false,
    });
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        if (name === "nik" || name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            setFormData({ ...formData, [name]: numericValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }

        setErrors({ ...errors, [name]: !value.trim() });
        setErrorMessage("");
    };

    const validatePasswords = () => {
        const { password, confirmPassword } = formData;
        if (confirmPassword.trim() !== "") {
            setErrors({
                ...errors,
                confirmPassword: password !== confirmPassword,
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = {
            fullName: !formData.fullName.trim(),
            nik: formData.nik.length !== 16,
            phone: formData.phone.length < 10 || formData.phone.length > 13,
            address: !formData.address.trim(),
            password: formData.password.length < 6,
            confirmPassword: formData.password !== formData.confirmPassword,
        };

        setErrors(newErrors);

        if (Object.values(newErrors).every((error) => !error)) {
            setLoading(true);
            try {
                const response = await axiosInstance.post("/api/auth/register", {
                    nama_lengkap: formData.fullName,
                    nik: formData.nik,
                    nomor_telepon: formData.phone,
                    alamat: formData.address,
                    password: formData.password,
                });

                // Registration successful
                alert("Pendaftaran berhasil! Silakan login dengan akun Anda.");
                router.push("/auth/login");
            } catch (error: any) {
                console.error("Registration error:", error);
                setErrorMessage(
                    error.response?.data?.error || "Terjadi kesalahan saat mendaftar. Silakan coba lagi."
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
                <Card className="w-full max-w-2xl">
                    <CardHeader className="space-y-4">
                        <div className="flex justify-center">
                            <img
                                src="/images/LOGO BIRU PNG.png"
                                alt="Logo Portal Masyarakat"
                                className="h-20"
                            />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-center text-blue-800">
                            Daftar Akun Baru
                        </CardTitle>
                        <p className="text-sm text-center text-gray-600">
                            Lengkapi data diri Anda dengan benar
                        </p>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {errorMessage && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errorMessage}</AlertDescription>
                                </Alert>
                            )}

                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nama Lengkap</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Masukkan nama lengkap Anda"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className={errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    required
                                />
                                {errors.fullName && (
                                    <p className="text-sm text-red-500">Nama lengkap harus diisi</p>
                                )}
                            </div>

                            {/* NIK and Phone Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nik">NIK</Label>
                                    <Input
                                        id="nik"
                                        name="nik"
                                        type="text"
                                        placeholder="NIK (16 digit)"
                                        value={formData.nik}
                                        onChange={handleInputChange}
                                        maxLength={16}
                                        disabled={loading}
                                        className={errors.nik ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        required
                                    />
                                    {errors.nik && (
                                        <p className="text-sm text-red-500">NIK harus 16 digit angka</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">No. Handphone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="No. Handphone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={loading}
                                        className={errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        required
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">Nomor handphone tidak valid (10-13 digit)</p>
                                    )}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap</Label>
                                <Textarea
                                    id="address"
                                    name="address"
                                    placeholder="Masukkan alamat lengkap Anda"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className={errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}
                                    rows={3}
                                    required
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-500">Alamat harus diisi</p>
                                )}
                            </div>

                            {/* Password Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            validatePasswords();
                                        }}
                                        disabled={loading}
                                        className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        required
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">Password minimal 6 karakter</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Konfirmasi Password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => {
                                            handleInputChange(e);
                                            validatePasswords();
                                        }}
                                        disabled={loading}
                                        className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                                        required
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-sm text-red-500">Password tidak sama</p>
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-blue-800 hover:bg-blue-900 text-white"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Mendaftar...
                                    </>
                                ) : (
                                    "Daftar Sekarang"
                                )}
                            </Button>

                            <p className="text-center text-sm text-gray-600">
                                Sudah punya akun?{" "}
                                <Link 
                                    href="/auth/login" 
                                    className={`text-blue-800 hover:text-blue-900 transition-colors duration-200 ${
                                        loading ? "pointer-events-none opacity-50" : ""
                                    }`}
                                >
                                    Masuk di sini
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;