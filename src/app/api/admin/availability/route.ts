import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

const availabilitySchema = z.object({
    availability: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
        isActive: z.boolean(),
    })),
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

        const availability = await prisma.availability.findMany({
            where: { photographerId: auth.photographerId },
            orderBy: { dayOfWeek: 'asc' },
        });

        return NextResponse.json({
            availability: availability.map(a => ({
                id: a.id,
                dayOfWeek: a.dayOfWeek,
                startTime: a.startTime,
                endTime: a.endTime,
                isActive: a.isActive,
            })),
        });
    } catch (error) {
        console.error('Error fetching availability:', error);
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
        const validation = availabilitySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos' },
                { status: 400 }
            );
        }

        const { availability } = validation.data;
        const photographerId = auth.photographerId;

        // Delete existing availability and create new ones
        await prisma.$transaction(async (tx) => {
            await tx.availability.deleteMany({
                where: { photographerId },
            });

            await tx.availability.createMany({
                data: availability.map(a => ({
                    photographerId,
                    dayOfWeek: a.dayOfWeek,
                    startTime: a.startTime,
                    endTime: a.endTime,
                    isActive: a.isActive,
                })),
            });
        });

        return NextResponse.json({
            message: 'Disponibilidad guardada correctamente',
        });
    } catch (error) {
        console.error('Error saving availability:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
