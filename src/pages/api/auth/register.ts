import { NextApiRequest, NextApiResponse } from "next";
import Prisma from "@prisma/client"; // Adjust the path if needed
import bcrypt from "bcryptjs";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nik, nama_lengkap, password, email, nomor_telepon, alamat } = req.body;

  // Validate required fields
  if (!nama_lengkap || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const prisma = new Prisma.PrismaClient();
  try {
    const existingUser = await prisma.pengguna.findFirst({
      where: {
        OR: [{nik}, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.pengguna.create({
      data: {
        nik,
        nama_lengkap,
        password: hashedPassword,
        email,
        nomor_telepon,
        alamat,
        role: "masyarakat"
      },
    });

    return res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;