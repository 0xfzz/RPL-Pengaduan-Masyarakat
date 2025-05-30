import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000", // Ensure this is set in your .env file
  headers: {
    "Content-Type": "application/json",
  },
});

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login", // Adjust the path if needed
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
        try {
          // Send a POST request to the login endpoint
          const response = await axiosInstance.post("/api/auth/login", {
            email: credentials?.email,
            password: credentials?.password,
          });

          const data: any = response.data;

          // Set the token globally for subsequent requests
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

          // Return the user object to be stored in the session
          return {
            id: data.user.id,
            email: data.user.email,
            nama: data.user.nama,
            role: data.user.role,
          };
        } catch (error: any) {
          console.error("Error during login:", error.response?.data || error.message);
          return null;
        }
      },
    }),
  ],
};