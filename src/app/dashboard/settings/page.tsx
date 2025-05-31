"use client";

import { useState, useEffect } from "react";
import SidebarDashboard from "@/components/SidebarDashboard";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import { FaUser, FaLock, FaCheckCircle, FaTimesCircle, FaSave, FaInfoCircle, FaEdit } from "react-icons/fa";

interface UserData {
  id_pengguna: number;
  nik: string;
  nama_lengkap: string;
  email: string;
  nomor_telepon: string;
  role: string;
  alamat: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
  _count: {
    aduan_pelapor: number;
    aduan_petugas: number;
  };
}

const SettingsPage = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [profileForm, setProfileForm] = useState({
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
    alamat: ""
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: ""
  });

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response: any = await axiosInstance.get("/api/user/detail");
      const fetchedUser = response.data.user;
      setUserData(fetchedUser);
      setProfileForm({
        nama_lengkap: fetchedUser.nama_lengkap,
        email: fetchedUser.email || "",
        nomor_telepon: fetchedUser.nomor_telepon || "",
        alamat: fetchedUser.alamat || ""
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response: any = await axiosInstance.put("/api/user/edit", {
        id_pengguna: userData?.id_pengguna,
        ...profileForm
      });

      const updatedUser = response.data.user;
      setUserData(prev => prev ? { ...prev, ...updatedUser } : null);
      
      setMessage("Profil berhasil diperbarui! Silakan refresh halaman untuk melihat perubahan di navbar.");
      
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.response?.data?.error || "Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    if (passwordForm.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    try {
      await axiosInstance.put("/api/user/edit", {
        id_pengguna: userData?.id_pengguna,
        nama_lengkap: userData?.nama_lengkap,
        password: passwordForm.password
      });

      setMessage("Password berhasil diperbarui!");
      setPasswordForm({ password: "", confirmPassword: "" });
      
    } catch (error: any) {
      console.error("Error updating password:", error);
      setError(error.response?.data?.error || "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "petugas":
        return "bg-blue-100 text-blue-800";
      case "masyarakat":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "petugas":
        return "Petugas";
      case "masyarakat":
        return "Masyarakat";
      default:
        return "User";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <SidebarDashboard />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <div className="flex-1 p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat data pengguna...</p>
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
          <div className="max-w-5xl mx-auto">
            {/* Header Card */}
            <Card className="mb-8 bg-gradient-to-r from-blue-600 to-blue-800 border-0 shadow-lg">
              <CardHeader className="text-white">
                <CardTitle className="text-3xl font-bold flex items-center gap-3">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaUser className="text-2xl" />
                  </div>
                  Pengaturan Akun
                </CardTitle>
                <p className="text-blue-100 text-lg mt-2">
                  Kelola informasi pribadi dan keamanan akun Anda
                </p>
              </CardHeader>
            </Card>

            {/* Alert Messages */}
            {message && (
              <Alert className="mb-6 border-green-200 bg-green-50 shadow-sm">
                <FaCheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 shadow-sm">
                <FaTimesCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            {/* Styled Tabs */}
            <Tabs defaultValue="profile" className="space-y-8">
              {/* Use proper TabsList wrapper */}
              <TabsList className="grid box-border w-full grid-cols-3 p-1 bg-gray-200 rounded-xl shadow-inner">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-100"
                >
                  <FaEdit className="text-base" />
                  Edit Profil
                </TabsTrigger>
                <TabsTrigger 
                  value="password" 
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-100"
                >
                  <FaLock className="text-base" />
                  Ubah Password
                </TabsTrigger>
                <TabsTrigger 
                  value="info" 
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-800 data-[state=inactive]:hover:bg-gray-100"
                >
                  <FaInfoCircle className="text-base" />
                  Informasi Akun
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <TabsContent value="profile" className="animate-in fade-in-50 duration-200">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                      <FaEdit className="text-blue-600" />
                      Edit Informasi Profil
                    </CardTitle>
                    <p className="text-blue-600 text-sm">Perbarui informasi pribadi Anda</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="nama_lengkap" className="text-sm font-semibold text-gray-700">
                          Nama Lengkap
                        </Label>
                        <Input
                          id="nama_lengkap"
                          value={profileForm.nama_lengkap}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            nama_lengkap: e.target.value
                          }))}
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomor_telepon" className="text-sm font-semibold text-gray-700">
                            No. Telepon
                          </Label>
                          <Input
                            id="nomor_telepon"
                            value={profileForm.nomor_telepon}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              nomor_telepon: e.target.value
                            }))}
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alamat" className="text-sm font-semibold text-gray-700">
                          Alamat
                        </Label>
                        <Textarea
                          id="alamat"
                          value={profileForm.alamat}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            alamat: e.target.value
                          }))}
                          rows={4}
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                        />
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="h-12 px-8 bg-blue-700 text-white hover:bg-blue-800 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                          disabled={saving}
                        >
                          <FaSave className="mr-2 h-4 w-4" />
                          {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password" className="animate-in fade-in-50 duration-200">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
                      <FaLock className="text-orange-600" />
                      Ubah Password
                    </CardTitle>
                    <p className="text-orange-600 text-sm">Jaga keamanan akun dengan password yang kuat</p>
                  </CardHeader>
                  <CardContent className="p-8">
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                          Password Baru
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={passwordForm.password}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            password: e.target.value
                          }))}
                          placeholder="Masukkan password baru"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                          Konfirmasi Password
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          placeholder="Konfirmasi password baru"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-lg"
                          required
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 font-medium">
                          📌 Password harus minimal 6 karakter
                        </p>
                      </div>

                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="h-12 px-8 bg-orange-600 text-white hover:bg-orange-700 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                          disabled={saving}
                        >
                          <FaLock className="mr-2 h-4 w-4" />
                          {saving ? "Menyimpan..." : "Ubah Password"}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info" className="animate-in fade-in-50 duration-200">
                <Card className="shadow-lg border-0 overflow-hidden">
                  <CardHeader className="border-b">
                    <CardTitle className="text-xl text-green-800 flex items-center gap-2">
                      <FaInfoCircle className="text-green-600" />
                      Informasi Akun
                    </CardTitle>
                    <p className="text-green-600 text-sm">Detail lengkap akun dan statistik Anda</p>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {userData && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">NIK</Label>
                            <p className="text-xl font-bold text-gray-800">{userData.nik || "-"}</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Role</Label>
                            <div>
                              <Badge className={`text-sm px-3 py-1 ${getRoleColor(userData.role)}`}>
                                {getRoleName(userData.role)}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Status Verifikasi</Label>
                            <div>
                              <Badge 
                                variant={userData.verified ? "default" : "secondary"}
                                className="text-sm px-3 py-1"
                              >
                                {userData.verified ? "Terverifikasi" : "Belum Verifikasi"}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">ID Pengguna</Label>
                            <p className="text-xl font-bold text-gray-800">#{userData.id_pengguna}</p>
                          </div>
                        </div>

                        <Separator className="my-8" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Terdaftar</Label>
                            <p className="text-lg font-semibold text-gray-800">{formatDate(userData.created_at)}</p>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Terakhir Diperbarui</Label>
                            <p className="text-lg font-semibold text-gray-800">{formatDate(userData.updated_at)}</p>
                          </div>
                        </div>

                        <Separator className="my-8" />

                        <div>
                          <Label className="text-lg font-bold text-gray-800 mb-6 block">Statistik Pengaduan</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-center border border-blue-200 shadow-sm">
                              <div className="text-4xl font-bold text-blue-600 mb-2">{userData._count.aduan_pelapor}</div>
                              <div className="text-sm font-semibold text-blue-700">Sebagai Pelapor</div>
                              <div className="text-xs text-blue-600 mt-1">Total pengaduan yang dilaporkan</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200 shadow-sm">
                              <div className="text-4xl font-bold text-green-600 mb-2">{userData._count.aduan_petugas}</div>
                              <div className="text-sm font-semibold text-green-700">Sebagai Petugas</div>
                              <div className="text-xs text-green-600 mt-1">Total pengaduan yang ditangani</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;