import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ subdomain: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { subdomain } = await params;

        const photographer = await prisma.photographer.findUnique({
            where: { subdomain },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });

        if (!photographer || !photographer.isActive) {
            return NextResponse.json(
                { error: 'Fotógrafo no encontrado' },
                { status: 404 }
            );
        }

        const sessionTypes = await prisma.sessionType.findMany({
            where: {
                photographerId: photographer.id,
                isActive: true,
            },
            orderBy: { price: 'asc' },
        });

        return NextResponse.json({
            photographer: {
                id: photographer.id,
                businessName: photographer.businessName,
                bio: photographer.bio,
                phone: photographer.phone,
                avatarUrl: photographer.avatarUrl,
                coverUrl: photographer.coverUrl,
                logoUrl: photographer.logoUrl,
                primaryColor: photographer.primaryColor,
                email: photographer.user?.email,
            },
            sessionTypes: sessionTypes.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                duration: s.duration,
                price: s.price.toString(),
                depositPercent: s.depositPercent,
                color: s.color,
            })),
        });
    } catch (error) {
        console.error('Error fetching photographer:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
