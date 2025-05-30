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
import { FaEdit } from "react-icons/fa";

interface UbahStatusDialogProps {
  aduanId: number;
  aduanTitle: string;
  currentStatus: string;
  onSuccess: () => void;
}

// This should match your Prisma enum NilaiStatusAduan
type StatusAduan = 
  | "Diajukan" 
  | "Diverifikasi" 
  | "Diproses" 
  | "Ditunda" 
  | "Ditolak" 
  | "Selesai";

const statusOptions: { value: StatusAduan; label: string }[] = [
  { value: "Diajukan", label: "Diajukan" },
  { value: "Diverifikasi", label: "Diverifikasi" },
  { value: "Diproses", label: "Diproses" },
  { value: "Ditunda", label: "Ditunda" },
  { value: "Ditolak", label: "Ditolak" },
  { value: "Selesai", label: "Selesai" }
];

const UbahStatusDialog: React.FC<UbahStatusDialogProps> = ({ 
  aduanId, 
  aduanTitle, 
  currentStatus, 
  onSuccess 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    status: "" as StatusAduan | "",
    keterangan: "",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // When dialog opens, set the current status as the initial value
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFormData(prev => ({
        ...prev,
        status: currentStatus as StatusAduan
      }));
    }
    setDialogOpen(open);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, status: value as StatusAduan }));
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
    if (!formData.status) {
      setErrorMessage("Status wajib dipilih");
      setIsSubmitting(false);
      return;
    }

    // If status is unchanged and no keterangan, show error
    if (formData.status === currentStatus && !formData.keterangan) {
      setErrorMessage("Berikan keterangan perubahan status");
      setIsSubmitting(false);
      return;
    }

    try {
      // Create FormData for sending files
      const formDataToSend = new FormData();
      formDataToSend.append("id_aduan", aduanId.toString());
      formDataToSend.append("status", formData.status);
      formDataToSend.append("keterangan", formData.keterangan);
      
      // Append files if available
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append("lampiran", files[i]);
        }
      }

      await axiosInstance.post("/api/aduan/ubah-status", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Reset form and show success message
      setFormData({
        status: "" as StatusAduan,
        keterangan: "",
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
      console.error("Error updating status:", error);
      setErrorMessage(error.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get appropriate button color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case "Diproses":
        return "bg-blue-500 hover:bg-blue-600";
      case "Selesai":
        return "bg-green-500 hover:bg-green-600";
      case "Ditolak":
        return "bg-red-500 hover:bg-red-600";
      case "Ditunda":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "Diverifikasi":
        return "bg-purple-500 hover:bg-purple-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-2 ml-2"
        >
          <FaEdit />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">
            Ubah Status Aduan
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            {aduanTitle}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}
          
          {submitSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              Status berhasil diperbarui!
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <div className="flex items-center gap-2">
              <div className="flex-grow">
                <Select onValueChange={handleSelectChange} value={formData.status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {formData.status && (
                <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getStatusColor(formData.status)}`}>
                  {formData.status}
                </div>
              )}
            </div>
            
            {formData.status === currentStatus && (
              <p className="text-xs text-amber-600 mt-1">
                Status yang dipilih sama dengan status saat ini.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keterangan">Keterangan</Label>
            <Textarea
              id="keterangan"
              name="keterangan"
              value={formData.keterangan}
              onChange={handleInputChange}
              rows={4}
              className="w-full"
              placeholder="Berikan keterangan tentang perubahan status ini"
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
              className={`text-white ${getStatusColor(formData.status) || "bg-blue-700 hover:bg-blue-800"}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Perbarui Status"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UbahStatusDialog;