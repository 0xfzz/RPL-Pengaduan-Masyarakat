import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, RolePengguna } from "@/generated/prisma"; // Adjust the path if needed
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check user role and permissions - only admin can access this
  const checked = await onlyFor(["admin"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  try {
    // Fetch the list of petugas
    const petugasList = await prisma.pengguna.findMany({
      where: {
        role: 'petugas' as RolePengguna
      },
      select: {
        id_pengguna: true,
        nama_lengkap: true,
        email: true,
        nomor_telepon: true
      },
      orderBy: {
        nama_lengkap: 'asc'
      }
    });

    return res.status(200).json({ petugas: petugasList });
  } catch (error) {
    console.error("Error fetching petugas list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;