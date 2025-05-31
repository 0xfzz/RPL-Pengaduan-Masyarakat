import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only admin can delete users
  const checked = await onlyFor(["admin"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const { id_pengguna } = req.body;

  try {
    // Validate required fields
    if (!id_pengguna) {
      return res.status(400).json({ error: "ID pengguna harus diisi" });
    }

    // Check if user exists
    const existingUser = await prisma.pengguna.findUnique({
      where: { id_pengguna: parseInt(id_pengguna) },
      include: {
        aduan_pelapor: true,
        aduan_petugas: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Check if user has related complaints
    const hasComplaints = existingUser.aduan_pelapor.length > 0 || existingUser.aduan_petugas.length > 0;
    
    if (hasComplaints) {
      return res.status(400).json({ 
        error: "Tidak dapat menghapus pengguna yang memiliki aduan terkait" 
      });
    }

    // Prevent admin from deleting themselves
    if (checked.decoded!.id === parseInt(id_pengguna)) {
      return res.status(400).json({ 
        error: "Tidak dapat menghapus akun sendiri" 
      });
    }

    // Delete user
    const deletedUser = await prisma.pengguna.delete({
      where: { id_pengguna: parseInt(id_pengguna) },
      select: {
        id_pengguna: true,
        nama_lengkap: true,
        email: true,
        role: true
      }
    });

    return res.status(200).json({
      message: "Pengguna berhasil dihapus",
      user: deletedUser
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;