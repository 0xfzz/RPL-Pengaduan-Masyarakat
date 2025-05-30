import jwt from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Simulate a validation check
  const token = req.body.token; // Assuming Bearer token
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
    
  }
  const isValid = jwt.verify(token)
  if (!isValid) {
    return res.status(401).json({ error: "Invalid token" });
  }
  return res.status(200).json({ message: "Token is valid" });
  
} 

export default handler;