import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { subdomainCheckSchema } from '@/lib/validations';
import { validateSubdomainFormat, normalizeSubdomain } from '@/lib/subdomain';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = subdomainCheckSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { available: false, error: validation.error.flatten().fieldErrors.subdomain?.[0] },
                { status: 400 }
            );
        }

        const { subdomain } = validation.data;
        const normalizedSubdomain = normalizeSubdomain(subdomain);

        // Validate subdomain format
        const formatValidation = validateSubdomainFormat(normalizedSubdomain);
        if (!formatValidation.isValid) {
            return NextResponse.json({
                available: false,
                error: formatValidation.error,
            });
        }

        // Check if subdomain already exists
        const existingSubdomain = await prisma.photographer.findUnique({
            where: { subdomain: normalizedSubdomain },
        });

        return NextResponse.json({
            available: !existingSubdomain,
            subdomain: normalizedSubdomain,
            error: existingSubdomain ? 'Este subdominio ya está en uso' : undefined,
        });
    } catch (error) {
        console.error('Subdomain check error:', error);
        return NextResponse.json(
            { available: false, error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
