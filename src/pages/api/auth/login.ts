import { NextApiRequest, NextApiResponse } from "next";
import Prisma from "@/generated/prisma"; // Adjust the path if needed
import bcrypt from "bcryptjs";
import jwt from "@/utils/jwt"; // Adjust the path if needed

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const prisma = new Prisma.PrismaClient();
  try {
    // Find the user by email
    const user = await prisma.pengguna.findUnique({
      where: { email },
    });
    if(user?.verified === false) {
      return res.status(403).json({ error: "Account not verified" });
    }
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const token = await jwt.sign(
      {
        id: user.id_pengguna,
        email: user.email,
        nama: user.nama_lengkap,
        role: user.role,
      });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id_pengguna,
        email: user.email,
        nama: user.nama_lengkap,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;