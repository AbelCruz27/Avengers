import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const sessionTypeSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    duration: z.number().min(15),
    price: z.number().min(0),
    depositPercent: z.number().min(0).max(100).default(50),
    color: z.string().optional(),
});

export async function GET(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const sessionTypes = await prisma.sessionType.findMany({
            where: { photographerId: auth.photographerId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
            sessionTypes: sessionTypes.map(s => ({
                id: s.id,
                name: s.name,
                description: s.description,
                duration: s.duration,
                price: Number(s.price),
                depositPercent: s.depositPercent,
                color: s.color,
                isActive: s.isActive,
            })),
        });
    } catch (error) {
        console.error('Error fetching session types:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validation = sessionTypeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const sessionType = await prisma.sessionType.create({
            data: {
                photographerId: auth.photographerId,
                name: validation.data.name,
                description: validation.data.description,
                duration: validation.data.duration,
                price: validation.data.price,
                depositPercent: validation.data.depositPercent,
                color: validation.data.color || '#8B5CF6',
            },
        });

        return NextResponse.json({
            message: 'Tipo de sesión creado',
            sessionType: {
                id: sessionType.id,
                name: sessionType.name,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating session type:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
