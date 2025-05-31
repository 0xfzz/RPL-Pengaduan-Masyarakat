import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/utils/axiosConfig";
import { FaEye, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

interface DetailUserDialogProps {
  userId: number;
}

interface UserDetail {
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

const DetailUserDialog: React.FC<DetailUserDialogProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response: any = await axiosInstance.get(`/api/user/detail?id_pengguna=${userId}`);
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    } finally {
      setLoading(false);
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
    if (dialogOpen) {
      fetchUserDetail();
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <FaEye className="h-3 w-3" />
          Detail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">Detail Pengguna</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : userData ? (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{userData.nama_lengkap}</h3>
                <div className="flex gap-2">
                  <Badge className={getRoleColor(userData.role)}>
                    {getRoleName(userData.role)}
                  </Badge>
                  <Badge variant={userData.verified ? "default" : "secondary"}>
                    {userData.verified ? "Terverifikasi" : "Belum Verifikasi"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                {userData.nik && (
                  <div className="flex items-center gap-3">
                    <FaUser className="text-gray-500 w-4 h-4" />
                    <div>
                      <span className="text-sm text-gray-500">NIK:</span>
                      <p className="font-medium">{userData.nik}</p>
                    </div>
                  </div>
                )}

                {userData.email && (
                  <div className="flex items-center gap-3">
                    <FaEnvelope className="text-gray-500 w-4 h-4" />
                    <div>
                      <span className="text-sm text-gray-500">Email:</span>
                      <p className="font-medium">{userData.email}</p>
                    </div>
                  </div>
                )}

                {userData.nomor_telepon && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-gray-500 w-4 h-4" />
                    <div>
                      <span className="text-sm text-gray-500">No. Telepon:</span>
                      <p className="font-medium">{userData.nomor_telepon}</p>
                    </div>
                  </div>
                )}

                {userData.alamat && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-gray-500 w-4 h-4 mt-1" />
                    <div>
                      <span className="text-sm text-gray-500">Alamat:</span>
                      <p className="font-medium">{userData.alamat}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                  <div>
                    <span className="text-sm text-gray-500">Terdaftar:</span>
                    <p className="font-medium">{formatDate(userData.created_at)}</p>
                  </div>
                </div>

                {userData.updated_at !== userData.created_at && (
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-gray-500 w-4 h-4" />
                    <div>
                      <span className="text-sm text-gray-500">Terakhir Diperbarui:</span>
                      <p className="font-medium">{formatDate(userData.updated_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-3">Statistik Pengaduan</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userData._count.aduan_pelapor}</div>
                  <div className="text-sm text-gray-600">Sebagai Pelapor</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userData._count.aduan_petugas}</div>
                  <div className="text-sm text-gray-600">Sebagai Petugas</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Data pengguna tidak ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailUserDialog;