import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { onlyFor } from "@/utils/onlyFor";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Only admin can add users
  const checked = await onlyFor(["admin"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const { 
    nik, 
    nama_lengkap, 
    email, 
    nomor_telepon, 
    role, 
    alamat, 
    password,
    verified = false 
  } = req.body;

  try {
    // Validate required fields
    if (!nama_lengkap || !password || !role) {
      return res.status(400).json({ 
        error: "Nama lengkap, password, dan role harus diisi" 
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: "Password minimal 6 karakter" });
    }

    // Validate role
    const validRoles = ["masyarakat", "admin", "petugas"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Role tidak valid" });
    }

    // Check NIK uniqueness if provided
    if (nik) {
      const nikExists = await prisma.pengguna.findUnique({
        where: { nik }
      });
      if (nikExists) {
        return res.status(400).json({ error: "NIK sudah terdaftar" });
      }
    }

    // Check email uniqueness if provided
    if (email) {
      const emailExists = await prisma.pengguna.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email sudah terdaftar" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await prisma.pengguna.create({
      data: {
        nik,
        nama_lengkap,
        email,
        nomor_telepon,
        role,
        alamat,
        password: hashedPassword,
        verified: Boolean(verified)
      },
      select: {
        id_pengguna: true,
        nik: true,
        nama_lengkap: true,
        email: true,
        nomor_telepon: true,
        role: true,
        alamat: true,
        verified: true,
        created_at: true
      }
    });

    return res.status(201).json({
      message: "Pengguna berhasil ditambahkan",
      user: newUser
    });

  } catch (error) {
    console.error("Error creating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;