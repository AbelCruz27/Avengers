import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.userId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: {
                email: true,
                role: true,
                createdAt: true,
                photographer: {
                    select: {
                        businessName: true,
                        subdomain: true,
                        isActive: true,
                        createdAt: true,
                    }
                }
            }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
