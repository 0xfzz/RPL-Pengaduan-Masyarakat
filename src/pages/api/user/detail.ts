import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check authentication and authorization
  const checked = await onlyFor(["admin", "petugas", "masyarakat"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const currentUserId = checked.decoded.id;
  const currentUserRole = checked.decoded.role;
  const { id_pengguna } = req.query;

  try {
    // Admin can see all users, others can only see themselves
    let targetUserId = currentUserId;
    
    if (currentUserRole === "admin" && id_pengguna) {
      targetUserId = parseInt(id_pengguna as string);
    } else if (currentUserRole !== "admin" && id_pengguna && parseInt(id_pengguna as string) !== currentUserId) {
      return res.status(403).json({ error: "Anda hanya dapat melihat data diri sendiri" });
    }

    // Get user details
    const user = await prisma.pengguna.findUnique({
      where: { id_pengguna: targetUserId },
      select: {
        id_pengguna: true,
        nik: true,
        nama_lengkap: true,
        email: true,
        nomor_telepon: true,
        role: true,
        alamat: true,
        verified: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            aduan_pelapor: true,
            aduan_petugas: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Data pengguna berhasil diambil",
      user
    });

  } catch (error) {
    console.error("Error fetching user detail:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;