import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only admin can verify users
  const checked = await onlyFor(["admin"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const { id_pengguna, verified } = req.body;

  try {
    // Validate required fields
    if (!id_pengguna || typeof verified !== "boolean") {
      return res.status(400).json({ 
        error: "ID pengguna dan status verifikasi harus diisi" 
      });
    }

    // Check if user exists
    const existingUser = await prisma.pengguna.findUnique({
      where: { id_pengguna: parseInt(id_pengguna) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Update verification status
    const updatedUser = await prisma.pengguna.update({
      where: { id_pengguna: parseInt(id_pengguna) },
      data: { 
        verified,
        updated_at: new Date()
      },
      select: {
        id_pengguna: true,
        nama_lengkap: true,
        email: true,
        role: true,
        verified: true,
        updated_at: true
      }
    });

    return res.status(200).json({
      message: `Pengguna berhasil ${verified ? 'diverifikasi' : 'dibatalkan verifikasinya'}`,
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user verification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;