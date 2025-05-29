import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma"; // Adjust the path if needed
import { onlyFor } from "@/utils/onlyFor";

const prisma = new PrismaClient();

const handler = async (req: any, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check if the user is an admin
  const checked = await onlyFor(["admin"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const { id_aduan, id_petugas } = req.body;

  // Validate required fields
  if (!id_aduan || !id_petugas) {
    return res.status(400).json({ error: "Missing required fields: id_aduan or id_petugas" });
  }

  try {
    // Check if the aduan exists
    const aduan = await prisma.aduan.findUnique({
      where: { id_aduan: parseInt(id_aduan) },
    });

    if (!aduan) {
      return res.status(404).json({ error: "Aduan not found" });
    }

    // Check if the petugas exists
    const petugas = await prisma.pengguna.findUnique({
      where: { id_pengguna: parseInt(id_petugas) },
    });

    if (!petugas || petugas.role !== "petugas") {
      return res.status(404).json({ error: "Petugas not found or invalid role" });
    }

    // Assign the petugas to the aduan
    const updatedAduan = await prisma.aduan.update({
      where: { id_aduan: parseInt(id_aduan) },
      data: { id_petugas: parseInt(id_petugas) },
    });

    return res.status(200).json({
      message: "Petugas assigned successfully",
      aduan: updatedAduan,
    });
  } catch (error) {
    console.error("Error assigning petugas:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;