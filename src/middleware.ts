import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractSubdomain } from '@/lib/subdomain';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/api/auth'];

// Routes that are always accessible
const ALWAYS_PUBLIC = ['/api/auth/register', '/api/auth/login', '/api/auth/check-subdomain'];

export function middleware(request: NextRequest) {
    const { pathname, hostname } = request.nextUrl;

    // Extract subdomain if present
    const subdomain = extractSubdomain(hostname, APP_DOMAIN.split(':')[0]);

    // Create response headers with subdomain info
    const requestHeaders = new Headers(request.headers);
    if (subdomain) {
        requestHeaders.set('x-subdomain', subdomain);
    }

    // If accessing a subdomain, show photographer's public site
    if (subdomain) {
        // Rewrite to photographer's public site
        const url = request.nextUrl.clone();
        url.pathname = `/p/${subdomain}${pathname}`;

        return NextResponse.rewrite(url, {
            request: {
                headers: requestHeaders,
            },
        });
    }

    // For main domain, allow public routes
    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAlwaysPublic = ALWAYS_PUBLIC.some((route) => pathname.startsWith(route));

    // API routes handle their own auth
    if (pathname.startsWith('/api')) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // Static files and public routes
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.') ||
        isPublicRoute ||
        isAlwaysPublic
    ) {
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // For protected routes, the client-side ProtectedRoute component handles auth
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (e.g., robots.txt)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/health).*)',
    ],
};
