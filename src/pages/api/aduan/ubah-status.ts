import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma"; // Adjust the path if needed
import multer from "multer";
import path from "path";
import fs from "fs";
import { runMiddleware } from "../../../utils/runMiddleware"; // Utility to run middleware
import { onlyFor } from "@/utils/onlyFor";

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}-${file.originalname}`);
    },
  }),
});
const uploadMiddleware = upload.array("lampiran");

const prisma = new PrismaClient();

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if the user is an admin or petugas
  const checked = await onlyFor(["admin", "petugas"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  // Run the upload middleware to handle file uploads
  await runMiddleware(req, res, uploadMiddleware);

  const { id_aduan, status, keterangan } = req.body;
  const userId = parseInt(req.headers["x-user-id"] || "");
  const userRole = req.headers["x-user-role"];

  // Validate required fields
  if (!id_aduan || !status) {
    return res.status(400).json({ error: "Missing required fields: id_aduan or status" });
  }

  try {
    // Check if the aduan exists
    const aduan = await prisma.aduan.findUnique({
      where: { id_aduan: parseInt(id_aduan) },
    });

    if (!aduan) {
      return res.status(404).json({ error: "Aduan not found" });
    }

    // Check if the petugas is allowed to update the aduan
    if (userRole === "petugas" && aduan.id_petugas !== userId) {
      return res.status(403).json({ error: "Access denied. You can only update aduan assigned to you." });
    }

    // Add the new status to the status_aduan history
    const newStatus = await prisma.status_aduan.create({
      data: {
        id_aduan: parseInt(id_aduan),
        status,
        keterangan: keterangan || null,
        tanggal_status: new Date(),
      },
    });

    await prisma.aduan.update({
      where: { id_aduan: parseInt(id_aduan) },
      data: {
        status_terkini: status
      }
    });

    // If lampiran is provided, add it to the lampiran table
    const uploadedFiles = req.files.map((file: any) => `/uploads/${file.filename}`);
    if (uploadedFiles.length > 0) {
      await prisma.lampiran.createMany({
        data: uploadedFiles.map((filePath: string) => ({
          id_status_aduan: newStatus.id_status_aduan,
          file_path: filePath,
        })),
      });
    }

    return res.status(200).json({
      message: "Status updated successfully",
      status: newStatus,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

export default handler;