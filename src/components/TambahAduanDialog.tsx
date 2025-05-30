import { useState, FormEvent } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/utils/axiosConfig";
import { FaPlus } from "react-icons/fa";

interface TambahAduanDialogProps {
  onSuccess: () => void;
}

// This should match your Prisma enum KategoriAduan
type KategoriAduan = 
  | "infrastruktur" 
  | "lingkungan" 
  | "sosial" 
  | "keamanan" 
  | "pelayanan_publik" 
  | "lainnya";

const kategoriOptions: { value: KategoriAduan; label: string }[] = [
  { value: "infrastruktur", label: "Infrastruktur" },
  { value: "lingkungan", label: "Lingkungan" },
  { value: "sosial", label: "Sosial" },
  { value: "keamanan", label: "Keamanan" },
  { value: "pelayanan_publik", label: "Pelayanan Publik" },
  { value: "lainnya", label: "Lainnya" }
];

const TambahAduanDialog: React.FC<TambahAduanDialogProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    judul_aduan: "",
    deskripsi_aduan: "",
    kategori_aduan: "" as KategoriAduan | "",
    alamat_aduan: "",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, kategori_aduan: value as KategoriAduan }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    // Validate form
    if (!formData.judul_aduan || !formData.deskripsi_aduan || !formData.kategori_aduan || !formData.alamat_aduan) {
      setErrorMessage("Semua field wajib diisi");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for sending files
      const formDataToSend = new FormData();
      formDataToSend.append("judul_aduan", formData.judul_aduan);
      formDataToSend.append("deskripsi_aduan", formData.deskripsi_aduan);
      formDataToSend.append("kategori_aduan", formData.kategori_aduan);
      formDataToSend.append("alamat_aduan", formData.alamat_aduan);
      
      // Append files if available
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append("lampiran", files[i]);
        }
      }

      await axiosInstance.post("/api/aduan/tambah", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form and show success message
      setFormData({
        judul_aduan: "",
        deskripsi_aduan: "",
        kategori_aduan: "",
        alamat_aduan: "",
      });
      setFiles(null);
      setSubmitSuccess(true);
      
      // Notify parent component
      onSuccess();
      
      // Close dialog after successful submission
      setTimeout(() => {
        setDialogOpen(false);
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error: any) {
      console.error("Error submitting aduan:", error);
      setErrorMessage(error.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-blue-700 text-white hover:bg-blue-800">
          <FaPlus />
          <span>Tambah Aduan</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">Tambah Pengaduan Baru</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}
          
          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Pengaduan berhasil dibuat!
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="judul_aduan">Judul Aduan</Label>
            <Input
              id="judul_aduan"
              name="judul_aduan"
              value={formData.judul_aduan}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="kategori_aduan">Kategori</Label>
            <Select onValueChange={handleSelectChange} value={formData.kategori_aduan}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoriOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="alamat_aduan">Alamat Kejadian</Label>
            <Input
              id="alamat_aduan"
              name="alamat_aduan"
              value={formData.alamat_aduan}
              onChange={handleInputChange}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deskripsi_aduan">Deskripsi Aduan</Label>
            <Textarea
              id="deskripsi_aduan"
              name="deskripsi_aduan"
              value={formData.deskripsi_aduan}
              onChange={handleInputChange}
              rows={4}
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lampiran">Lampiran (Opsional)</Label>
            <Input
              id="lampiran"
              type="file"
              onChange={handleFileChange}
              className="w-full"
              multiple
            />
            <p className="text-xs text-gray-500">Format yang didukung: JPG, PNG, PDF (Maks. 5MB)</p>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="mr-2">
                Batal
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Kirim Aduan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TambahAduanDialog;