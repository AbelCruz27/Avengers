import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const configSchema = z.object({
    businessName: z.string().min(2),
    bio: z.string().optional(),
    phone: z.string().optional(),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    avatarUrl: z.string().url().optional().or(z.literal('')),
    coverUrl: z.string().url().optional().or(z.literal('')),
    logoUrl: z.string().url().optional().or(z.literal('')),
});

export async function GET(request: Request) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const photographer = await prisma.photographer.findUnique({
            where: { id: auth.photographerId },
            select: {
                businessName: true,
                bio: true,
                phone: true,
                primaryColor: true,
                avatarUrl: true,
                coverUrl: true,
                logoUrl: true,
                subdomain: true,
            }
        });

        return NextResponse.json({ config: photographer });
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const auth = getAuthFromRequest(request);
        if (!auth || !auth.photographerId) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const validation = configSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Datos inválidos', details: validation.error.flatten() }, { status: 400 });
        }

        const updated = await prisma.photographer.update({
            where: { id: auth.photographerId },
            data: validation.data,
        });

        return NextResponse.json({ message: 'Configuración actualizada', config: updated });
    } catch (error) {
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
