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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import { FaUserPlus, FaInfoCircle, FaEdit } from "react-icons/fa";
import TambahAduanDialog from "@/components/TambahAduanDialog";
import AssignPetugasDialog from "@/components/AssignPetugasDialog";
import DetailAduanDialog from "@/components/DetailAduanDialog";
import UbahStatusDialog from "@/components/UbahStatusDialog"; // Import the new component
import Navbar from "@/components/Navbar";

interface Aduan {
  id_aduan: number;
  judul_aduan: string;
  kategori_aduan: string;
  alamat_aduan: string;
  status: string;
  tanggal_aduan: string | null;
}

const ListAduan = () => {
  console.log("ListAduan rendered");
  const [aduanList, setAduanList] = useState<Aduan[]>([]);
  const { getUser } = useAuthStore();
  const user = getUser();
  const userRole = user?.role || "";

  const fetchAduan = async () => {
    try {
      const response: any = await axiosInstance.get("/api/aduan/list");
      setAduanList(response.data.aduan || []);
    } catch (error) {
      console.error("Error fetching aduan list:", error);
    }
  };

  // Function to format category name with proper capitalization
  const formatKategori = (kategori: string) => {
    if (!kategori) return "Lainnya";

    return kategori
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to get category chip color
  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case "infrastruktur":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "lingkungan":
        return "bg-green-100 text-green-800 border-green-200";
      case "sosial":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "keamanan":
        return "bg-red-100 text-red-800 border-red-200";
      case "pelayanan_publik":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "lainnya":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    fetchAduan();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarDashboard />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 p-6">
          <Card className="mb-6">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-blue-800">
                {userRole === "masyarakat" ? "Pengaduan Saya" : "List Pengaduan"}
              </CardTitle>
              {userRole === "masyarakat" && (
                <TambahAduanDialog onSuccess={fetchAduan} />
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableCaption>Daftar pengaduan yang telah diajukan.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Judul Aduan</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal Aduan Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aduanList.map((aduan, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{aduan.judul_aduan}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getKategoriColor(
                              aduan.kategori_aduan
                            )}`}
                          >
                            {formatKategori(aduan.kategori_aduan)}
                          </span>
                        </TableCell>
                        <TableCell>{aduan.alamat_aduan}</TableCell>
                        <TableCell>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              aduan.status === "Diproses"
                                ? "bg-blue-500 text-white"
                                : aduan.status === "Selesai"
                                ? "bg-green-500 text-white"
                                : aduan.status === "Ditolak"
                                ? "bg-red-500 text-white"
                                : aduan.status === "Ditunda"
                                ? "bg-yellow-500 text-white"
                                : aduan.status === "Diverifikasi"
                                ? "bg-purple-500 text-white"
                                : aduan.status === "Diajukan"
                                ? "bg-gray-500 text-white"
                                : aduan.status === "Ditindaklanjuti"
                                ? "bg-indigo-500 text-white"
                                : "bg-gray-500 text-white"
                            }`}
                          >
                            {aduan.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {aduan.tanggal_aduan
                            ? new Date(aduan.tanggal_aduan).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                }
                              ) +
                              " " +
                              new Date(aduan.tanggal_aduan).toLocaleTimeString(
                                "id-ID",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </TableCell>
                        <TableCell className="space-x-2 flex items-center">
                          {userRole === "masyarakat" && (
                            <DetailAduanDialog aduanId={aduan.id_aduan} />
                          )}
                          {userRole === "admin" && (
                            <>
                              <AssignPetugasDialog
                                aduanId={aduan.id_aduan}
                                aduanTitle={aduan.judul_aduan}
                                onSuccess={fetchAduan}
                              />
                              <DetailAduanDialog aduanId={aduan.id_aduan} />
                              <UbahStatusDialog
                                aduanId={aduan.id_aduan}
                                aduanTitle={aduan.judul_aduan}
                                currentStatus={aduan.status}
                                onSuccess={fetchAduan}
                              />
                            </>
                          )}
                          {userRole === "petugas" && (
                            <>
                              <DetailAduanDialog aduanId={aduan.id_aduan} />
                              <UbahStatusDialog
                                aduanId={aduan.id_aduan}
                                aduanTitle={aduan.judul_aduan}
                                currentStatus={aduan.status}
                                onSuccess={fetchAduan}
                              />
                            </>
                          )}
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

export default ListAduan;


