import { getServerSession, Session } from "next-auth"
import { authOptions } from "./nextAuthOptions"
import { NextRequest, NextResponse } from "next/server";
import { error } from "console";
import { headers } from "next/headers";
import { RequestCustomHeaders } from "../../types/custom";

export const onlyFor = async (role: string[], req: RequestCustomHeaders) => {
    if (!role.includes(req.headers['x-user-role'])) {
        return {error: "Forbidden access, you do not have the required permissions.", status: 403 };
    }
    
    return {error: null, status: 200};
}