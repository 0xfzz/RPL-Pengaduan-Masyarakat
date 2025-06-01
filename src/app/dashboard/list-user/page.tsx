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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import { FaUserPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaEye } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import TambahUserDialog from "@/components/TambahUserDialog";
import EditUserDialog from "@/components/EditUserDialog";
import DetailUserDialog from "@/components/DetailUserDialog";
import toast from 'react-hot-toast';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{id: number, name: string} | null>(null);
  const [deleting, setDeleting] = useState(false);
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
      toast.error("Gagal memuat daftar pengguna", {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '500',
        },
      });
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
      
      // Show success toast
      toast.success(
        `Pengguna berhasil ${!verified ? 'diverifikasi' : 'dibatalkan verifikasinya'}!`,
        {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontWeight: '500',
          },
        }
      );
      
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Error updating verification:", error);
      toast.error(
        error.response?.data?.error || "Gagal mengubah status verifikasi pengguna",
        {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '500',
          },
        }
      );
    }
  };

  const openDeleteDialog = (userId: number, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setDeleting(true);
    try {
      await axiosInstance.delete(`/api/user/hapus?id_pengguna=${userToDelete.id}`);
      
      // Show success toast
      toast.success(`Pengguna ${userToDelete.name} berhasil dihapus!`, {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '500',
        },
      });
      
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers(); // Refresh the list
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.error || "Gagal menghapus pengguna",
        {
          duration: 4000,
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '500',
          },
        }
      );
    } finally {
      setDeleting(false);
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
                                  onClick={() => openDeleteDialog(userData.id_pengguna, userData.nama_lengkap)}
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

          {/* Delete Confirmation Dialog - Moved outside the map function */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  ⚠️ Konfirmasi Penghapusan
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Apakah Anda yakin ingin menghapus pengguna{" "}
                  <span className="font-semibold text-gray-800">
                    {userToDelete?.name}
                  </span>
                  ?
                  <br />
                  <span className="text-red-500 font-medium">
                    Tindakan ini tidak dapat dibatalkan.
                  </span>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setUserToDelete(null);
                  }}
                  disabled={deleting}
                >
                  Batal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <FaTrash className="h-3 w-3" />
                      Ya, Hapus
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ListUser;