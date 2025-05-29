import * as jwt from 'jsonwebtoken'
import * as jose from 'jose'

declare module 'jose' {
    export interface UserJwtPayload extends jose.JWTPayload {
        id: number,
        email: string,
        nama: string,
        role: string,
    }
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default");
const signJwt = async (payload: jose.JWTPayload): Promise<string> => {
    
    const signPayload = await new jose.SignJWT(payload)
    .setExpirationTime('1w')
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);
    return signPayload;
}

const verifyJwt = async (token: string): Promise<jose.UserJwtPayload | null> => {
    try {
        const { payload } = await jose.jwtVerify(token, secret);
        return payload as jose.UserJwtPayload;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }  
}

const decode = (token: string): jose.UserJwtPayload | null => {
    try {
        const decoded = jwt.decode(token) as jose.UserJwtPayload;
        return decoded;
    } catch (error) {
        console.error("JWT decode failed:", error);
        return null;
    }
}
export default {
    sign: signJwt,
    verify: verifyJwt,
    decode
};
