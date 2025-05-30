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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axiosInstance from "@/utils/axiosConfig";
import { FaUserPlus, FaPhone } from "react-icons/fa";

interface Petugas {
  id_pengguna: number;
  nama_lengkap: string;
  email: string | null;
  nomor_telepon: string | null;
}

interface AssignPetugasDialogProps {
  aduanId: number;
  aduanTitle: string;
  onSuccess: () => void;
}

const AssignPetugasDialog: React.FC<AssignPetugasDialogProps> = ({ aduanId, aduanTitle, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [petugasList, setPetugasList] = useState<Petugas[]>([]);
  const [selectedPetugas, setSelectedPetugas] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Function to generate avatar URL
  const generateAvatarUrl = (name: string, id: number) => {
    // Using DiceBear Avatars API for consistent avatars
    const seed = `${name}-${id}`;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  };

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get selected petugas name for display in input
  const getSelectedPetugasName = () => {
    const selected = petugasList.find(p => p.id_pengguna.toString() === selectedPetugas);
    return selected ? selected.nama_lengkap : "";
  };

  useEffect(() => {
    if (open) {
      fetchPetugas();
    }
  }, [open]);

  const fetchPetugas = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const response: any = await axiosInstance.get("/api/aduan/petugas");
      setPetugasList(response.data.petugas || []);
    } catch (error: any) {
      console.error("Error fetching petugas list:", error);
      setError(error.response?.data?.error || "Gagal mengambil data petugas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedPetugas) {
      setError("Silakan pilih petugas terlebih dahulu");
      return;
    }

    setIsSubmitting(true);
    setError("");
    
    try {
      await axiosInstance.post("/api/aduan/assign-petugas", {
        id_aduan: aduanId,
        id_petugas: parseInt(selectedPetugas)
      });
      
      setSuccess(true);
      onSuccess();
      
      // Close dialog after delay
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setSelectedPetugas("");
      }, 2000);
      
    } catch (error: any) {
      console.error("Error assigning petugas:", error);
      setError(error.response?.data?.error || "Gagal menugaskan petugas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2 mr-2"
        >
          <FaUserPlus />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-blue-800">Pilih Petugas</DialogTitle>
          <p className="text-sm text-gray-600">Menugaskan petugas untuk aduan: <strong>{aduanTitle}</strong></p>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Petugas berhasil ditugaskan!
          </div>
        )}
        
        <div className="my-4">
          <Label htmlFor="petugas" className="mb-3 block font-medium">Petugas yang akan ditugaskan</Label>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat data petugas...</p>
            </div>
          ) : petugasList.length === 0 ? (
            <div className="text-center py-8 text-yellow-600">
              <FaUserPlus className="mx-auto mb-2 text-2xl" />
              <p>Tidak ada petugas tersedia</p>
            </div>
          ) : (
            <Select value={selectedPetugas} onValueChange={setSelectedPetugas}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Petugas">
                  {selectedPetugas && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={generateAvatarUrl(getSelectedPetugasName(), parseInt(selectedPetugas))} 
                          alt={getSelectedPetugasName()}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-medium">
                          {getInitials(getSelectedPetugasName())}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{getSelectedPetugasName()}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {petugasList.map((petugas) => (
                  <SelectItem 
                    key={petugas.id_pengguna} 
                    value={petugas.id_pengguna.toString()}
                    className="py-3"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={generateAvatarUrl(petugas.nama_lengkap, petugas.id_pengguna)} 
                          alt={petugas.nama_lengkap}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800 text-xs font-medium">
                          {getInitials(petugas.nama_lengkap)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {petugas.nama_lengkap}
                        </div>
                        {petugas.nomor_telepon && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <FaPhone className="h-3 w-3" />
                            <span>{petugas.nomor_telepon}</span>
                          </div>
                        )}
                        {petugas.email && (
                          <div className="text-xs text-gray-400 truncate">
                            {petugas.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Show selected petugas details */}
        {selectedPetugas && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h4 className="font-medium text-blue-800 mb-2">Petugas yang dipilih:</h4>
            {(() => {
              const selected = petugasList.find(p => p.id_pengguna.toString() === selectedPetugas);
              return selected ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={generateAvatarUrl(selected.nama_lengkap, selected.id_pengguna)} 
                      alt={selected.nama_lengkap}
                    />
                    <AvatarFallback className="bg-blue-200 text-blue-800 font-medium">
                      {getInitials(selected.nama_lengkap)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-gray-900">{selected.nama_lengkap}</div>
                    {selected.nomor_telepon && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FaPhone className="h-3 w-3" />
                        <span>{selected.nomor_telepon}</span>
                      </div>
                    )}
                    {selected.email && (
                      <div className="text-sm text-gray-500">{selected.email}</div>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        )}
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="mr-2">
              Batal
            </Button>
          </DialogClose>
          <Button 
            onClick={handleAssign}
            className="bg-blue-700 text-white hover:bg-blue-800"
            disabled={isSubmitting || isLoading || petugasList.length === 0 || !selectedPetugas}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <FaUserPlus className="mr-2" />
                Tugaskan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignPetugasDialog;