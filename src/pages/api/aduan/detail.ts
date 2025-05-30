import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma"; // Adjust the path if needed
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
  const { id } = req.query; // Get the aduan ID from the query parameters

  if (!id) {
    return res.status(400).json({ error: "Missing aduan ID" });
  }

  try {
    let aduanDetail;

    if (userRole === "admin") {
      // Admin can see all aduan details
      aduanDetail = await prisma.aduan.findUnique({
        where: {
          id_aduan: parseInt(id as string),
        },
        include: {
          pelapor: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
              email: true,
            },
          },
          petugas: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
            },
          },
          status_aduan: {
            select: {
              status: true,
              keterangan: true,
              tanggal_status: true,
              lampiran_status: true
            },
            orderBy: {
              tanggal_status: 'desc',
            }
          },
          lampiran_aduan: {
            select: {
              file_path: true,
            },
          },
        },
      });
    } else if (userRole === "masyarakat") {
      // Masyarakat can only see their own aduan details
      aduanDetail = await prisma.aduan.findFirst({
        where: {
          id_aduan: parseInt(id as string),
          id_pelapor: userId,
        },
        include: {
          pelapor: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
              email: true,
            },
          },
          petugas: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
            },
          },
          status_aduan: {
            select: {
              status: true,
              keterangan: true,
              tanggal_status: true,
              lampiran_status: true
            },
            orderBy: {
              tanggal_status: 'desc',
            }
          },
          lampiran_aduan: {
            select: {
              file_path: true,
            },
          },
        },
      });
    } else if (userRole === "petugas") {
      // Petugas can only see assigned aduan details
      aduanDetail = await prisma.aduan.findFirst({
        where: {
          id_aduan: parseInt(id as string),
          id_petugas: userId,
        },
        include: {
          pelapor: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
              email: true,
            },
          },
          petugas: {
            select: {
              nama_lengkap: true,
              nomor_telepon: true,
            },
          },
          status_aduan: {
            select: {
              status: true,
              keterangan: true,
              tanggal_status: true,
              lampiran_status: true
            },
            orderBy: {
              tanggal_status: 'desc',
            }
          },
          lampiran_aduan: {
            select: {
              file_path: true,
            },
          },
        },
      });
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!aduanDetail) {
      return res.status(404).json({ error: "Aduan not found or access denied" });
    }

    return res.status(200).json({ aduan: aduanDetail });
  } catch (error) {
    console.error("Error fetching aduan detail:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;