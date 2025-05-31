import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
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

  try {
    if (currentUserRole === "admin") {
      // Admin can see all users
      const userList = await prisma.pengguna.findMany({
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
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      return res.status(200).json({
        message: "Data pengguna berhasil diambil",
        users: userList
      });
    } else {
      // Petugas and masyarakat can only see themselves
      const user = await prisma.pengguna.findUnique({
        where: { id_pengguna: currentUserId },
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
        }
      });

      return res.status(200).json({
        message: "Data pengguna berhasil diambil",
        users: user ? [user] : []
      });
    }

  } catch (error) {
    console.error("Error fetching user list:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default handler;