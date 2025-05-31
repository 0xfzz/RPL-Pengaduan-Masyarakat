import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@/generated/prisma";
import { onlyFor } from "@/utils/onlyFor";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check authentication and authorization
  const checked = await onlyFor(["admin", "petugas", "masyarakat"], req);
  if (checked.error != null) {
    return res.status(checked.status).json({ error: checked.error });
  }

  const currentUser = checked.decoded;
  const { id_pengguna, nama_lengkap, email, nomor_telepon, alamat, password, role } = req.body;

  try {
    // Validate required fields
    if (!id_pengguna || !nama_lengkap) {
      return res.status(400).json({ error: "ID pengguna dan nama lengkap harus diisi" });
    }

    // Check if user exists
    const existingUser = await prisma.pengguna.findUnique({
      where: { id_pengguna: parseInt(id_pengguna) }
    });

    if (!existingUser) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    // Check permissions: petugas and masyarakat can only edit themselves
    if (currentUser!.role !== "admin" && currentUser!.id !== parseInt(id_pengguna)) {
      return res.status(403).json({ error: "Anda hanya dapat mengedit data diri sendiri" });
    }

    // Prepare update data
    const updateData: any = {
      nama_lengkap,
      alamat,
      updated_at: new Date()
    };

    // Only add email and phone if provided
    if (email) updateData.email = email;
    if (nomor_telepon) updateData.nomor_telepon = nomor_telepon;

    // Only admin can change role
    if (role && currentUser!.role === "admin") {
      updateData.role = role;
    }

    // Hash password if provided
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password minimal 6 karakter" });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Check email uniqueness if email is being updated
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.pengguna.findUnique({
        where: { email }
      });
      if (emailExists) {
        return res.status(400).json({ error: "Email sudah digunakan" });
      }
    }

    // Update user
    const updatedUser = await prisma.pengguna.update({
      where: { id_pengguna: parseInt(id_pengguna) },
      data: updateData,
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
        updated_at: true
      }
    });

    return res.status(200).json({
      message: "Data pengguna berhasil diperbarui",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;