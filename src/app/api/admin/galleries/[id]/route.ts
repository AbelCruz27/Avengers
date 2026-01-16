import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        const gallery = await prisma.gallery.findFirst({
            where: { id, photographerId: auth.photographerId },
            include: {
                photos: { orderBy: { order: 'asc' } },
                booking: { select: { clientName: true, clientEmail: true } },
            },
        });

        if (!gallery) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            gallery: {
                id: gallery.id,
                title: gallery.title,
                slug: gallery.slug,
                description: gallery.description,
                password: gallery.password,
                isPublic: gallery.isPublic,
                expiresAt: gallery.expiresAt,
                client: gallery.booking,
                photos: gallery.photos.map(p => ({
                    id: p.id,
                    url: p.url,
                    thumbnailUrl: p.thumbnailUrl,
                    filename: p.filename,
                    size: p.size,
                    order: p.order,
                })),
                createdAt: gallery.createdAt.toISOString(),
            },
        });
    } catch (error) {
        console.error('Error fetching gallery:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        const existing = await prisma.gallery.findFirst({
            where: { id, photographerId: auth.photographerId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        const updated = await prisma.gallery.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description,
                password: body.password,
                isPublic: body.isPublic,
            },
        });

        return NextResponse.json({ message: 'Galería actualizada', gallery: updated });
    } catch (error) {
        console.error('Error updating gallery:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        const existing = await prisma.gallery.findFirst({
            where: { id, photographerId: auth.photographerId },
        });

        if (!existing) {
            return NextResponse.json({ error: 'Galería no encontrada' }, { status: 404 });
        }

        // TODO: Also delete physical files from storage

        await prisma.gallery.delete({ where: { id } });

        return NextResponse.json({ message: 'Galería eliminada' });
    } catch (error) {
        console.error('Error deleting gallery:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
