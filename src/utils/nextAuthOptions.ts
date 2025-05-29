import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Prisma, PrismaClient } from "@/generated/prisma";
import { compare } from "bcryptjs";

export const authOptions: NextAuthOptions = {
    pages: {
      signIn: "/api/auth/login",
    },
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        name: "Email and Password",
        credentials: {
          email: {
            label: "Email",
            type: "email",
            placeholder: "example@example.com",
          },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const prisma = new PrismaClient();
          const user = await prisma.pengguna.findFirst({
            where: {
              email: credentials?.email
            }
          });
          if (!user) {
            return null; 
          }
          const match = await compare(credentials?.password || "", user.password);
          if (!match) {
            return null; 
          }
          return {
              id: user.id_pengguna,
              email: user.email,
              nama: user.nama_lengkap,
              role: user.role
          };
        },
      }),
    ],
  };