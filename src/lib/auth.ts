import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@prisma/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ============================================
// Password Utilities
// ============================================

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT Utilities
// ============================================

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    photographerId?: string;
    subdomain?: string;
}

export function generateToken(user: User & { photographer?: { id: string; subdomain: string } | null }): string {
    const payload: JWTPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        photographerId: user.photographer?.id,
        subdomain: user.photographer?.subdomain,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch {
        return null;
    }
}

// ============================================
// Auth Header Utilities
// ============================================

export function extractTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

export function getAuthFromRequest(request: Request): JWTPayload | null {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
        return null;
    }

    return verifyToken(token);
}
