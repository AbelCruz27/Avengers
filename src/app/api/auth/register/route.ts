import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { validateSubdomainFormat, normalizeSubdomain } from '@/lib/subdomain';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = registerSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { email, password, subdomain, businessName } = validation.data;
        const normalizedSubdomain = normalizeSubdomain(subdomain);

        // Validate subdomain format
        const subdomainValidation = validateSubdomainFormat(normalizedSubdomain);
        if (!subdomainValidation.isValid) {
            return NextResponse.json(
                { error: subdomainValidation.error },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Este email ya está registrado' },
                { status: 409 }
            );
        }

        // Check if subdomain already exists
        const existingSubdomain = await prisma.photographer.findUnique({
            where: { subdomain: normalizedSubdomain },
        });

        if (existingSubdomain) {
            return NextResponse.json(
                { error: 'Este subdominio ya está en uso' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user and photographer in transaction
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                passwordHash,
                role: 'PHOTOGRAPHER',
                photographer: {
                    create: {
                        subdomain: normalizedSubdomain,
                        businessName,
                    },
                },
            },
            include: {
                photographer: true,
            },
        });

        // Generate JWT token
        const token = generateToken(user);

        // Return success response (exclude password hash)
        return NextResponse.json(
            {
                message: 'Registro exitoso',
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
                        }
                        : null,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
