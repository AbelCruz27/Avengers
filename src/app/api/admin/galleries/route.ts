import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const createGallerySchema = z.object({
    title: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    description: z.string().optional(),
    password: z.string().optional(),
    isPublic: z.boolean().default(false),
    bookingId: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const galleries = await prisma.gallery.findMany({
            where: { photographerId: auth.photographerId },
            include: {
                _count: { select: { photos: true } },
                booking: { select: { clientName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            galleries: galleries.map(g => ({
                id: g.id,
                title: g.title,
                slug: g.slug,
                photoCount: g._count.photos,
                isPublic: g.isPublic,
                hasPassword: !!g.password,
                clientName: g.booking?.clientName || null,
                createdAt: g.createdAt.toISOString(),
            })),
        });
    } catch (error) {
        console.error('Error fetching galleries:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const validation = createGallerySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({
                error: 'Datos inválidos',
                details: validation.error.flatten().fieldErrors
            }, { status: 400 });
        }

        // Check slug uniqueness
        const existing = await prisma.gallery.findUnique({
            where: {
                photographerId_slug: {
                    photographerId: auth.photographerId,
                    slug: validation.data.slug,
                },
            },
        });

        if (existing) {
            return NextResponse.json({ error: 'Ya existe una galería con ese slug' }, { status: 409 });
        }

        const gallery = await prisma.gallery.create({
            data: {
                photographerId: auth.photographerId,
                title: validation.data.title,
                slug: validation.data.slug,
                description: validation.data.description,
                password: validation.data.password,
                isPublic: validation.data.isPublic,
                bookingId: validation.data.bookingId,
            },
        });

        return NextResponse.json({
            message: 'Galería creada',
            gallery: { id: gallery.id, slug: gallery.slug },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating gallery:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
