import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const auth = getAuthFromRequest(request);

        if (!auth || !auth.photographerId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const bookings = await prisma.booking.findMany({
            where: { photographerId: auth.photographerId },
            include: {
                sessionType: {
                    select: { name: true },
                },
            },
            orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        });

        return NextResponse.json({
            bookings: bookings.map(b => ({
                id: b.id,
                clientName: b.clientName,
                clientEmail: b.clientEmail,
                sessionType: b.sessionType.name,
                date: b.date.toISOString(),
                startTime: b.startTime,
                endTime: b.endTime,
                status: b.status,
                totalAmount: Number(b.totalAmount),
                depositPaid: b.depositPaid,
            })),
        });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
