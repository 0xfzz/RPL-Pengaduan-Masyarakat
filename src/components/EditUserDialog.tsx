import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axiosInstance from "@/utils/axiosConfig";
import { useAuthStore } from "@/store/authStore";
import { FaEdit } from "react-icons/fa";

interface EditUserDialogProps {
  userId: number;
  onSuccess: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ userId, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    email: "",
    nomor_telepon: "",
    role: "",
    alamat: "",
    password: ""
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { getUser } = useAuthStore();
  const currentUser = getUser();

  const fetchUserData = async () => {
    try {
      const response: any = await axiosInstance.get(`/api/user/detail?id_pengguna=${userId}`);
      const userData = response.data.user;
      setFormData({
        nama_lengkap: userData.nama_lengkap,
        email: userData.email || "",
        nomor_telepon: userData.nomor_telepon || "",
        role: userData.role,
        alamat: userData.alamat || "",
        password: ""
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await axiosInstance.put("/api/user/edit", {
        id_pengguna: userId,
        ...formData
      });
      
      onSuccess();
      setDialogOpen(false);
      
    } catch (error: any) {
      console.error("Error updating user:", error);
      setErrorMessage(error.response?.data?.error || "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (dialogOpen) {
      fetchUserData();
    }
  }, [dialogOpen]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-1">
          <FaEdit className="h-3 w-3" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">Edit Pengguna</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {errorMessage}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="nama_lengkap">Nama Lengkap *</Label>
            <Input
              id="nama_lengkap"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nomor_telepon">No. Telepon</Label>
              <Input
                id="nomor_telepon"
                name="nomor_telepon"
                value={formData.nomor_telepon}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {currentUser?.role === "admin" && (
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))} value={formData.role}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masyarakat">Masyarakat</SelectItem>
                  <SelectItem value="petugas">Petugas</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alamat">Alamat</Label>
            <Textarea
              id="alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password Baru (Kosongkan jika tidak ingin mengubah)</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Masukkan password baru"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-700 text-white hover:bg-blue-800"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;