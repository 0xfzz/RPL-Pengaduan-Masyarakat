"use client";

import { useState, useEffect } from "react";
import SidebarDashboard from "@/components/SidebarDashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import TambahUserDialog from "@/components/TambahUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import DetailUserDialog from "@/components/DetailUserDialog";

interface User {
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

const ListUser = () => {
  const [userList, setUserList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { getUser } = useAuthStore();
  const user = getUser();
  const userRole = user?.role || "";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response: any = await axiosInstance.get("/api/user/list");
      setUserList(response.data.users || []);
    } catch (error) {
      console.error("Error fetching user list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: number, verified: boolean) => {
    try {
      await axiosInstance.patch("/api/user/verify", {
        id_pengguna: userId,
        verified: !verified
      });
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating verification:", error);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${userName}?`)) {
      try {
        await axiosInstance.delete(`/api/user/hapus?id_pengguna=${userId}`);
        fetchUsers(); // Refresh the list
      } catch (error: any) {
        alert(error.response?.data?.error || "Error deleting user");
      }
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

  useEffect(() => {
    document.title = "List Pengguna - Dashboard";
    fetchUsers();
  }, []);

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
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-blue-800">
                {userRole === "admin" ? "Manajemen Pengguna" : "Profil Saya"}
              </CardTitle>
              {userRole === "admin" && (
                <TambahUserDialog onSuccess={fetchUsers} />
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>
                    {userRole === "admin" 
                      ? "Daftar semua pengguna dalam sistem." 
                      : "Informasi profil Anda."}
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>No. Telepon</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userList.map((userData, index) => (
                      <TableRow key={userData.id_pengguna}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell className="font-medium">{userData.nama_lengkap}</TableCell>
                        <TableCell>{userData.email || "-"}</TableCell>
                        <TableCell>{userData.nomor_telepon || "-"}</TableCell>
                        <TableCell>
                          <Badge className={getRoleColor(userData.role)}>
                            {getRoleName(userData.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userData.verified ? "default" : "secondary"}>
                            {userData.verified ? "Terverifikasi" : "Belum Verifikasi"}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <div className="flex items-center gap-2">
                            <DetailUserDialog userId={userData.id_pengguna} />
                            
                            <EditUserDialog 
                              userId={userData.id_pengguna}
                              onSuccess={fetchUsers}
                            />

                            {userRole === "admin" && (
                              <>
                                <Button
                                  size="sm"
                                  variant={userData.verified ? "outline" : "default"}
                                  onClick={() => handleVerifyUser(userData.id_pengguna, userData.verified)}
                                  className="flex items-center gap-1"
                                >
                                  {userData.verified ? <FaTimes className="h-3 w-3" /> : <FaCheck className="h-3 w-3" />}
                                  {userData.verified ? "Batal Verifikasi" : "Verifikasi"}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(userData.id_pengguna, userData.nama_lengkap)}
                                  className="flex items-center gap-1"
                                >
                                  <FaTrash className="h-3 w-3" />
                                  Hapus
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ListUser;