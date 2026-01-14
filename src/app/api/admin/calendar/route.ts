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

        const { searchParams } = new URL(request.url);
        const start = searchParams.get('start');
        const end = searchParams.get('end');

        const where: any = {
            photographerId: auth.photographerId,
            status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] }, // Don't show cancelled/no-show by default? Or show all?
        };

        if (start && end) {
            where.date = {
                gte: new Date(start),
                lte: new Date(end),
            };
        }

        const bookings = await prisma.booking.findMany({
            where,
            select: {
                id: true,
                date: true,
                startTime: true,
                endTime: true,
                clientName: true,
                status: true,
                sessionType: {
                    select: { name: true, color: true },
                },
            },
            orderBy: { startTime: 'asc' },
        });

        return NextResponse.json({
            events: bookings.map(b => ({
                id: b.id,
                title: `${b.clientName} - ${b.sessionType.name}`,
                start: `${b.date.toISOString().split('T')[0]}T${b.startTime}:00`,
                end: `${b.date.toISOString().split('T')[0]}T${b.endTime}:00`,
                status: b.status,
                color: b.sessionType.color || '#8B5CF6',
            })),
        });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
