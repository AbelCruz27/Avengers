import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ subdomain: string; slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { subdomain, slug } = await params;

        const photographer = await prisma.photographer.findUnique({
            where: { subdomain },
        });

        if (!photographer) {
            return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
        }

        const gallery = await prisma.gallery.findUnique({
            where: {
                photographerId_slug: {
                    photographerId: photographer.id,
                    slug,
                },
            },
            include: {
                photos: { orderBy: { order: 'asc' } },
                photographer: { select: { businessName: true, primaryColor: true } },
            },
        });

        if (!gallery) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        // Check if password required
        const { searchParams } = new URL(request.url);
        const providedPassword = searchParams.get('password');

        if (gallery.password && !gallery.isPublic) {
            if (providedPassword !== gallery.password) {
                return NextResponse.json({
                    requiresPassword: true,
                    gallery: {
                        title: gallery.title,
                        photographerName: gallery.photographer.businessName,
                    },
                });
            }
        }

        // Check expiration
        if (gallery.expiresAt && new Date() > gallery.expiresAt) {
            return NextResponse.json({ error: 'Esta galería ha expirado' }, { status: 410 });
        }

        return NextResponse.json({
            requiresPassword: false,
            gallery: {
                title: gallery.title,
                description: gallery.description,
                photographerName: gallery.photographer.businessName,
                primaryColor: gallery.photographer.primaryColor,
                photos: gallery.photos.map(p => ({
                    id: p.id,
                    url: p.url,
                    thumbnailUrl: p.thumbnailUrl,
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching public gallery:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
