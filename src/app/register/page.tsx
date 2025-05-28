"use client";
import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "nik" || name === "phone") {
            const numericValue = value.replace(/\D/g, "");
            setFormData({ ...formData, [name]: numericValue });
        }

        setErrors({ ...errors, [name]: !value.trim() });
    };

    const validatePasswords = () => {
        const { password, confirmPassword } = formData;
        setErrors({
            ...errors,
            confirmPassword: confirmPassword.trim() !== "" && password !== confirmPassword,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
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
            alert("Pendaftaran berhasil! Silakan login dengan akun Anda.");
            // Redirect to login page
            // window.location.href = "/login";
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
                    <h2 className="text-2xl font-semibold text-center text-blue-800 mb-2">
                        Daftar Akun Baru
                    </h2>
                    <p className="text-sm text-center text-gray-600 mb-6">
                        Lengkapi data diri Anda dengan benar
                    </p>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="fullName"
                            placeholder="Nama Lengkap"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                errors.fullName ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {errors.fullName && (
                            <div className="text-red-500 text-sm mt-1">Nama lengkap harus diisi</div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <input
                                type="text"
                                name="nik"
                                placeholder="NIK (16 digit)"
                                value={formData.nik}
                                onChange={handleInputChange}
                                maxLength={16}
                                required
                                className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                    errors.nik ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.nik && (
                                <div className="text-red-500 text-sm mt-1">NIK harus 16 digit angka</div>
                            )}
                        </div>
                        <div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="No. Handphone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                    errors.phone ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.phone && (
                                <div className="text-red-500 text-sm mt-1">Nomor handphone tidak valid</div>
                            )}
                        </div>
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="address"
                            placeholder="Alamat Lengkap"
                            value={formData.address}
                            onChange={handleInputChange}
                            required
                            className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                errors.address ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                            }`}
                        />
                        {errors.address && (
                            <div className="text-red-500 text-sm mt-1">Alamat harus diisi</div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    validatePasswords();
                                }}
                                required
                                className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                    errors.password ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.password && (
                                <div className="text-red-500 text-sm mt-1">Password minimal 6 karakter</div>
                            )}
                        </div>
                        <div>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Konfirmasi Password"
                                value={formData.confirmPassword}
                                onChange={(e) => {
                                    handleInputChange(e);
                                    validatePasswords();
                                }}
                                required
                                className={`w-full px-4 py-3 border rounded-lg text-black focus:outline-none focus:ring-2 ${
                                    errors.confirmPassword ? "border-red-500 ring-red-500" : "border-gray-300 focus:ring-blue-500"
                                }`}
                            />
                            {errors.confirmPassword && (
                                <div className="text-red-500 text-sm mt-1">Password tidak sama</div>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition duration-300"
                    >
                        Daftar Sekarang
                    </button>
                    <p className="text-center text-sm text-gray-600 mt-4">
                        Sudah punya akun?{" "}
                        <a href="/login" className="text-blue-800 hover:text-blue-900">
                            Masuk di sini
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;