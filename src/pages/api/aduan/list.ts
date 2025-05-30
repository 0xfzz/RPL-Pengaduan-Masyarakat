import { NextApiRequest, NextApiResponse } from "next";
import { aduan, PrismaClient, Prisma } from "@/generated/prisma"; // Adjust the path if needed
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check user role and permissions
  const checked = await onlyFor(["admin", "masyarakat", "petugas"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const userId = parseInt(req.headers["x-user-id"] || "");
  const userRole = req.headers["x-user-role"];

  try {
    let aduanList;

    if (userRole === "admin") {
      // Admin can see all aduan
      aduanList = await prisma.aduan.findMany({
        select: {
            id_aduan: true,
            judul_aduan: true,
            kategori_aduan: true,
            petugas: {
              select: {
                nama_lengkap: true,
                nomor_telepon: true,
              },
            },
            alamat_aduan: true,
            status_aduan: {
              select: {
                status: true,
                keterangan: true,
                tanggal_status: true,
              },
            },
          }
      });
    } else if (userRole === "masyarakat") {
      // Masyarakat can only see their own aduan
      aduanList = await prisma.aduan.findMany({
        where: {
          id_pelapor: userId,
        },
        select: {
            id_aduan: true,
            judul_aduan: true,
            kategori_aduan: true,
            petugas: {
              select: {
                nama_lengkap: true,
                nomor_telepon: true,
              },
            },
            alamat_aduan: true,
            status_aduan: {
              select: {
                status: true,
                keterangan: true,
                tanggal_status: true,
              },
            },
          }
      });
    } else if (userRole === "petugas") {
      // Petugas can only see assigned aduan
      aduanList = await prisma.aduan.findMany({
        where: {
          id_petugas: userId,
        },
        select: {
            id_aduan: true,
            judul_aduan: true,
            kategori_aduan: true,
            petugas: {
              select: {
                nama_lengkap: true,
                nomor_telepon: true,
              },
            },
            alamat_aduan: true,
            status_aduan: {
              select: {
                status: true,
                keterangan: true,
                tanggal_status: true,
              },
            },
          }
      });
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    // Format the response to include only the latest status
    const formattedAduanList = aduanList.map((aduan) => ({
      id_aduan: aduan.id_aduan,
      judul_aduan: aduan.judul_aduan,
      kategori_aduan: aduan.kategori_aduan,
      alamat_aduan: aduan.alamat_aduan,
      status: aduan.status_aduan[aduan.status_aduan.length - 1]?.status || "Unknown",
      tanggal_status: aduan.status_aduan[aduan.status_aduan.length - 1]?.tanggal_status || null
    }));

    return res.status(200).json({ aduan: formattedAduanList });
  } catch (error) {
    console.error("Error fetching aduan list:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;