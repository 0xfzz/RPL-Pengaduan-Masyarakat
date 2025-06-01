import { NextRequest, NextResponse } from 'next/server';
import jwt from '@/utils/jwt' // Adjust the import path as necessary
const authenticatedRoutes = [
    '/api/aduan',
    '/api/user'
]
interface RequestWithUser extends NextRequest {
    user?: {
        id: number;
        email: string;
        nama: string;
        role: string;
    };
}
export async function middleware(req: RequestWithUser) {
    const token = req.headers.get('authorization')?.split(' ')[1];
    const response = NextResponse.next();
    ;
    if( !token && req.nextUrl.pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    if (!token && authenticatedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (token && authenticatedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
        const decoded = await jwt.verify(token);
        ;
        if (!decoded) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
    }
    
    return response;
}

export const config = {
    matcher: ['/api/:path*', '/'], // Apply middleware to API routes,
    api: {
        bodyParser: false, // Disable body parsing to handle file uploads
      },
};