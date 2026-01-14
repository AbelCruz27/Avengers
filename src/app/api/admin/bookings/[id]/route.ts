import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const booking = await prisma.booking.findFirst({
            where: {
                id,
                photographerId: auth.photographerId,
            },
            include: {
                sessionType: {
                    select: { name: true, duration: true },
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            booking: {
                id: booking.id,
                clientName: booking.clientName,
                clientEmail: booking.clientEmail,
                clientPhone: booking.clientPhone,
                sessionType: booking.sessionType,
                date: booking.date.toISOString(),
                startTime: booking.startTime,
                endTime: booking.endTime,
                notes: booking.notes,
                status: booking.status,
                totalAmount: Number(booking.totalAmount),
                depositAmount: Number(booking.depositAmount),
                depositPaid: booking.depositPaid,
                fullyPaid: booking.fullyPaid,
                createdAt: booking.createdAt.toISOString(),
                payments: booking.payments.map(p => ({
                    id: p.id,
                    amount: Number(p.amount),
                    type: p.type,
                    status: p.status,
                    createdAt: p.createdAt.toISOString(),
                })),
            },
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

const updateSchema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
});

export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();

        const validation = updateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos' },
                { status: 400 }
            );
        }

        // Verify booking belongs to photographer
        const existingBooking = await prisma.booking.findFirst({
            where: {
                id,
                photographerId: auth.photographerId,
            },
        });

        if (!existingBooking) {
            return NextResponse.json(
                { error: 'Reserva no encontrada' },
                { status: 404 }
            );
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: validation.data,
        });

        return NextResponse.json({
            message: 'Reserva actualizada',
            booking: {
                id: booking.id,
                status: booking.status,
            },
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
