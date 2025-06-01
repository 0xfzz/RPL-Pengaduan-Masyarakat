import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axiosInstance from "@/utils/axiosConfig";
import { FaInfoCircle, FaImage, FaHistory } from "react-icons/fa";

interface AduanDetail {
  id_aduan: number;
  judul_aduan: string;
  deskripsi_aduan: string;
  kategori_aduan: string;
  alamat_aduan: string;
  status_terkini: string;
  created_at: string;
  updated_at: string;
  pelapor: {
    nama_lengkap: string;
    nomor_telepon: string | null;
    email: string | null;
  };
  petugas: {
    nama_lengkap: string;
    nomor_telepon: string | null;
  } | null;
  status_aduan: {
    status: string;
    judul_status?: string;
    keterangan: string;
    tanggal_status: string;
    lampiran_status: {
        file_path: string;
    }[];
  }[];
  lampiran_aduan: {
    file_path: string;
  }[];
}

interface DetailAduanDialogProps {
  aduanId: number;
}

const DetailAduanDialog: React.FC<DetailAduanDialogProps> = ({ aduanId }) => {
  const [open, setOpen] = useState(false);
  const [aduanDetail, setAduanDetail] = useState<AduanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (open && aduanId) {
      fetchAduanDetail();
    }
  }, [open, aduanId]);

  const fetchAduanDetail = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response: any = await axiosInstance.get(`/api/aduan/detail?id=${aduanId}`);
      setAduanDetail(response.data.aduan);
    } catch (error: any) {
      console.error("Error fetching aduan detail:", error);
      setError(error.response?.data?.error || "Gagal mengambil detail aduan");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }) + " " + date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Generate status title and subtitle based on status value
  const getStatusInfo = (status: string) => {
    switch(status) {
      case "Menunggu":
        return {
          title: "Pengaduan Diterima",
          subtitle: "Pengaduan Anda telah masuk ke sistem dan sedang menunggu verifikasi"
        };
      case "Diverifikasi":
        return {
          title: "Pengaduan Diverifikasi",
          subtitle: "Pengaduan Anda telah diverifikasi dan ditugaskan kepada petugas"
        };
      case "Diproses":
        return {
          title: "Pengaduan Sedang Diproses",
          subtitle: "Petugas sedang menangani pengaduan Anda"
        };
      case "Ditunda":
        return {
          title: "Pengaduan Ditunda",
          subtitle: "Pengaduan Anda ditunda karena alasan tertentu"
        };
      case "Ditolak":
        return {
          title: "Pengaduan Ditolak",
          subtitle: "Mohon maaf, pengaduan Anda tidak dapat diproses"
        };
      case "Selesai":
        return {
          title: "Pengaduan Selesai",
          subtitle: "Pengaduan Anda telah selesai ditangani"
        };
      default:
        return {
          title: status,
          subtitle: "Status pengaduan telah diperbarui"
        };
    }
  };

  // Get kategori color (matching implementation from list page)
  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case "infrastruktur":
        return "bg-blue-100 text-blue-800";
      case "lingkungan":
        return "bg-green-100 text-green-800";
      case "sosial":
        return "bg-purple-100 text-purple-800";
      case "keamanan":
        return "bg-red-100 text-red-800";
      case "pelayanan_publik":
        return "bg-orange-100 text-orange-800";
      case "lainnya":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get kategori display name
  const getKategoriName = (kategori: string) => {
    switch (kategori) {
      case "infrastruktur":
        return "Infrastruktur";
      case "lingkungan":
        return "Lingkungan";
      case "sosial":
        return "Sosial";
      case "keamanan":
        return "Keamanan";
      case "pelayanan_publik":
        return "Pelayanan Publik";
      case "lainnya":
        return "Lainnya";
      default:
        return kategori;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
        >
          <FaInfoCircle />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        ) : aduanDetail ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-blue-800">
                {aduanDetail.judul_aduan}
              </DialogTitle>
              <div className="flex items-center mt-2 space-x-2">
                <Badge className={getKategoriColor(aduanDetail.kategori_aduan)}>
                  {getKategoriName(aduanDetail.kategori_aduan)}
                </Badge>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  aduanDetail.status_terkini === "Diproses"
                    ? "bg-blue-500 text-white"
                    : aduanDetail.status_terkini === "Selesai"
                    ? "bg-green-500 text-white"
                    : aduanDetail.status_terkini === "Ditolak"
                    ? "bg-red-500 text-white"
                    : aduanDetail.status_terkini === "Ditunda"
                    ? "bg-yellow-500 text-white"
                    : aduanDetail.status_terkini === "Diverifikasi"
                    ? "bg-purple-500 text-white"
                    : "bg-gray-500 text-white"
                }`}>
                  {aduanDetail.status_terkini}
                </span>
                <span className="text-sm text-gray-500">
                  Dibuat: {formatDate(aduanDetail.created_at)}
                </span>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="detail" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="detail">Detail Aduan</TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-1">
                  <FaHistory className="h-3 w-3" /> Riwayat Status
                </TabsTrigger>
                <TabsTrigger value="lampiran">Lampiran</TabsTrigger>
              </TabsList>
              
              <TabsContent value="detail" className="mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Kategori</h3>
                    <Badge className={getKategoriColor(aduanDetail.kategori_aduan)}>
                      {getKategoriName(aduanDetail.kategori_aduan)}
                    </Badge>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Alamat</h3>
                    <p>{aduanDetail.alamat_aduan}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Deskripsi</h3>
                    <p className="whitespace-pre-line">{aduanDetail.deskripsi_aduan}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pelapor</h3>
                    <p>{aduanDetail.pelapor.nama_lengkap}</p>
                    {aduanDetail.pelapor.nomor_telepon && (
                      <p className="text-sm text-gray-500">Telp: {aduanDetail.pelapor.nomor_telepon}</p>
                    )}
                    {aduanDetail.pelapor.email && (
                      <p className="text-sm text-gray-500">Email: {aduanDetail.pelapor.email}</p>
                    )}
                  </div>
                  
                  {aduanDetail.petugas && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Petugas</h3>
                      <p>{aduanDetail.petugas.nama_lengkap}</p>
                      {aduanDetail.petugas.nomor_telepon && (
                        <p className="text-sm text-gray-500">Telp: {aduanDetail.petugas.nomor_telepon}</p>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="status" className="mt-4">
                <div className="space-y-4">
                  {aduanDetail.status_aduan.length > 0 ? (
                    <>
                      <h2 className="text-base font-semibold text-gray-700 mb-2">
                        Riwayat Perubahan Status
                      </h2>
                      {aduanDetail.status_aduan.map((status, index) => {
                        // Get title and subtitle based on status
                        const statusInfo = getStatusInfo(status.status);
                        const isLatest = index === 0;

                        return (
                          <Card 
                            key={index} 
                            className={`${isLatest ? "border-blue-500 shadow-sm" : ""} transition-all hover:shadow-md`}
                          >
                            <CardHeader className="py-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-base font-semibold flex items-center">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold mr-2 ${
                                      status.status === "Diproses"
                                        ? "bg-blue-500 text-white"
                                        : status.status === "Selesai"
                                        ? "bg-green-500 text-white"
                                        : status.status === "Ditolak"
                                        ? "bg-red-500 text-white"
                                        : status.status === "Ditunda"
                                        ? "bg-yellow-500 text-white"
                                        : status.status === "Diverifikasi"
                                        ? "bg-purple-500 text-white"
                                        : "bg-gray-500 text-white"
                                    }`}>
                                      {status.status}
                                    </span>
                                    {status.judul_status || statusInfo.title}
                                    {isLatest && (
                                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        Terbaru
                                      </span>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="mt-1 text-sm text-gray-600">
                                    {statusInfo.subtitle}
                                  </CardDescription>
                                </div>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {formatDate(status.tanggal_status)}
                                </span>
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="whitespace-pre-line">{status.keterangan}</p>
                              
                              {status.lampiran_status && status.lampiran_status.length > 0 && (
                                <div className="mt-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                                  <h4 className="text-xs font-medium text-gray-500 mb-1">Lampiran Status:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {status.lampiran_status.map((lampiran, idx) => (
                                      <a 
                                        key={idx}
                                        href={`${lampiran.file_path}`} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block border rounded p-1 hover:bg-gray-100"
                                      >
                                        <img 
                                          src={`${lampiran.file_path}`} 
                                          alt={`Lampiran ${idx + 1}`}
                                          className="h-20 w-20 object-cover"
                                        />
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                      <FaHistory className="mx-auto text-4xl mb-2 opacity-30" />
                      <p>Belum ada riwayat status</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="lampiran" className="mt-4">
                {aduanDetail.lampiran_aduan.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-md overflow-hidden bg-gray-50 flex items-center justify-center">
                        <img 
                          src={`${aduanDetail.lampiran_aduan[activeImageIndex].file_path}`} 
                          alt={`Lampiran ${activeImageIndex + 1}`}
                          className="w-full h-64 object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Daftar Lampiran</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {aduanDetail.lampiran_aduan.map((lampiran, idx) => (
                            <div 
                              key={idx}
                              onClick={() => setActiveImageIndex(idx)}
                              className={`border rounded cursor-pointer hover:border-blue-500 transition-all ${
                                activeImageIndex === idx ? 'border-blue-500 ring-2 ring-blue-300' : ''
                              }`}
                            >
                              <img 
                                src={`${lampiran.file_path}`} 
                                alt={`Thumbnail ${idx + 1}`}
                                className="h-20 w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Klik thumbnail untuk melihat gambar lebih besar
                        </p>
                        <a 
                          href={`${aduanDetail.lampiran_aduan[activeImageIndex].file_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <FaImage className="mr-1" /> Buka di tab baru
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg">
                    <FaImage className="mx-auto text-4xl mb-2 opacity-30" />
                    <p>Tidak ada lampiran untuk aduan ini</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button className="w-full sm:w-auto">
                  Tutup
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p>Tidak ada data yang ditemukan</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetailAduanDialog;