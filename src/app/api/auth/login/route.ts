import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = loginSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password } = validation.data;

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: {
                photographer: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            );
        }

        // Check if photographer is active
        if (user.photographer && !user.photographer.isActive) {
            return NextResponse.json(
                { error: 'Tu cuenta está desactivada. Contacta a soporte.' },
                { status: 403 }
            );
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return success response
        return NextResponse.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                photographer: user.photographer
                    ? {
                        id: user.photographer.id,
                        subdomain: user.photographer.subdomain,
                        businessName: user.photographer.businessName,
                        avatarUrl: user.photographer.avatarUrl,
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
