import { NextApiRequest, NextApiResponse } from "next";
import jwt from '@/utils/jwt'

interface DecodedToken {
  id: number;
  role: string;
  iat?: number;
  exp?: number;
}

export const onlyFor = async (roles: string[], req: NextApiRequest) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: "Authorization token required", status: 401, decoded: null };
    }

    const token = authHeader.substring(7);
    const decoded = await jwt.verify(token);
    if (!decoded || typeof decoded !== 'object') {
      return { error: "Invalid token structure", status: 401, decoded: null };
    }
    if (!roles.includes(decoded.role)) {
      return { error: "Forbidden access, you do not have the required permissions.", status: 403, decoded: null };
    }

    return { error: null, status: 200, decoded };
  } catch (error) {
    return { error: "Invalid or expired token", status: 401, decoded: null };
  }
};