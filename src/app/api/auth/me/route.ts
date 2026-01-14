import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        // Get auth from request
        const auth = getAuthFromRequest(request);

        if (!auth) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Fetch fresh user data from database
        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            include: {
                photographer: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Return user data
        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
                photographer: user.photographer
                    ? {
                        id: user.photographer.id,
                        subdomain: user.photographer.subdomain,
                        businessName: user.photographer.businessName,
                        phone: user.photographer.phone,
                        bio: user.photographer.bio,
                        avatarUrl: user.photographer.avatarUrl,
                        isActive: user.photographer.isActive,
                    }
                    : null,
            },
        });
    } catch (error) {
        console.error('Get me error:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
