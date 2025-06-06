import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client"; // Adjust the path if needed
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

// API handler
const handler = async (req: any, res: NextApiResponse) => {
  
  const prisma = new PrismaClient();
  
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const checked = await onlyFor(['masyarakat'], req);
  if(checked.error != null){
    return res.status(checked.status).json({ error: checked.error });
  }
  const userId = checked.decoded.id; // Get user ID from the decoded token
  await runMiddleware(req, res, uploadMiddleware);
  const { judul_aduan, deskripsi_aduan, kategori_aduan, alamat_aduan } = req.body;
  

  if ( !judul_aduan || !deskripsi_aduan || !alamat_aduan) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const uploadedFiles = req.files.map((file: any) => `/uploads/${file.filename}`);
    const newAduan = await prisma.aduan.create({
        data: {
          id_pelapor: userId,
          judul_aduan,
          deskripsi_aduan,
          kategori_aduan,
          alamat_aduan,
          lampiran_aduan: {
            create: uploadedFiles.map((filePath: string) => ({
              file_path: filePath,
            })),
          },
          status_aduan: {
            create: {
              status: "Diajukan",
              tanggal_status: new Date(),
            },
          }
        }
      });

    return res.status(201).json({ message: "Aduan created successfully", aduan: newAduan });
  } catch (error) {
    console.error("Error creating aduan:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

export default handler;