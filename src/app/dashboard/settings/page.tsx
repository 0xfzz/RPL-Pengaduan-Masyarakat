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
import { FaUser, FaLock, FaCheckCircle, FaTimesCircle, FaSave } from "react-icons/fa";

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

      // Update user data in local state only
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

  // Clear messages after 5 seconds
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
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-blue-800 flex items-center gap-2">
                  <FaUser />
                  Pengaturan Akun
                </CardTitle>
              </CardHeader>
            </Card>

            {message && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <FaCheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <FaTimesCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Edit Profil</TabsTrigger>
                <TabsTrigger value="password">Ubah Password</TabsTrigger>
                <TabsTrigger value="info">Informasi Akun</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Informasi Profil</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nama_lengkap">Nama Lengkap</Label>
                        <Input
                          id="nama_lengkap"
                          value={profileForm.nama_lengkap}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            nama_lengkap: e.target.value
                          }))}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              email: e.target.value
                            }))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="nomor_telepon">No. Telepon</Label>
                          <Input
                            id="nomor_telepon"
                            value={profileForm.nomor_telepon}
                            onChange={(e) => setProfileForm(prev => ({
                              ...prev,
                              nomor_telepon: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="alamat">Alamat</Label>
                        <Textarea
                          id="alamat"
                          value={profileForm.alamat}
                          onChange={(e) => setProfileForm(prev => ({
                            ...prev,
                            alamat: e.target.value
                          }))}
                          rows={3}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        disabled={saving}
                      >
                        <FaSave className="mr-2 h-4 w-4" />
                        {saving ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Ubah Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password Baru</Label>
                        <Input
                          id="password"
                          type="password"
                          value={passwordForm.password}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            password: e.target.value
                          }))}
                          placeholder="Masukkan password baru"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm(prev => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))}
                          placeholder="Konfirmasi password baru"
                          required
                        />
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>Password harus minimal 6 karakter</p>
                      </div>

                      <Button
                        type="submit"
                        className="bg-blue-700 text-white hover:bg-blue-800"
                        disabled={saving}
                      >
                        <FaLock className="mr-2 h-4 w-4" />
                        {saving ? "Menyimpan..." : "Ubah Password"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Akun</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {userData && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">NIK</Label>
                            <p className="text-lg font-medium">{userData.nik || "-"}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Role</Label>
                            <div className="mt-1">
                              <Badge className={getRoleColor(userData.role)}>
                                {getRoleName(userData.role)}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Status Verifikasi</Label>
                            <div className="mt-1">
                              <Badge variant={userData.verified ? "default" : "secondary"}>
                                {userData.verified ? "Terverifikasi" : "Belum Verifikasi"}
                              </Badge>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">ID Pengguna</Label>
                            <p className="text-lg font-medium">{userData.id_pengguna}</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Terdaftar</Label>
                            <p className="text-lg font-medium">{formatDate(userData.created_at)}</p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</Label>
                            <p className="text-lg font-medium">{formatDate(userData.updated_at)}</p>
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <Label className="text-sm font-medium text-gray-500 mb-3 block">Statistik Pengaduan</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-blue-600">{userData._count.aduan_pelapor}</div>
                              <div className="text-sm text-gray-600">Sebagai Pelapor</div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4 text-center">
                              <div className="text-2xl font-bold text-green-600">{userData._count.aduan_petugas}</div>
                              <div className="text-sm text-gray-600">Sebagai Petugas</div>
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