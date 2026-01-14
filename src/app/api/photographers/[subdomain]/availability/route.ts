import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

interface RouteParams {
    params: Promise<{ subdomain: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { subdomain } = await params;
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const sessionTypeId = searchParams.get('sessionTypeId');

        if (!dateStr || !sessionTypeId) {
            return NextResponse.json(
                { error: 'Fecha y tipo de sesión requeridos' },
                { status: 400 }
            );
        }

        // Get photographer
        const photographer = await prisma.photographer.findUnique({
            where: { subdomain },
        });

        if (!photographer) {
            return NextResponse.json(
                { error: 'Fotógrafo no encontrado' },
                { status: 404 }
            );
        }

        // Get session type for duration
        const sessionType = await prisma.sessionType.findUnique({
            where: { id: sessionTypeId },
        });

        if (!sessionType) {
            return NextResponse.json(
                { error: 'Tipo de sesión no encontrado' },
                { status: 404 }
            );
        }

        // Parse date
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();

        // Get availability for this day
        const availability = await prisma.availability.findFirst({
            where: {
                photographerId: photographer.id,
                dayOfWeek,
                isActive: true,
            },
        });

        if (!availability) {
            return NextResponse.json({
                slots: [],
                message: 'No hay disponibilidad para este día',
            });
        }

        // Check if date is blocked
        const blockedDate = await prisma.blockedDate.findFirst({
            where: {
                photographerId: photographer.id,
                date: date,
            },
        });

        if (blockedDate) {
            return NextResponse.json({
                slots: [],
                message: 'Esta fecha está bloqueada',
            });
        }

        // Get existing bookings for this date
        const existingBookings = await prisma.booking.findMany({
            where: {
                photographerId: photographer.id,
                date: date,
                status: {
                    in: ['PENDING', 'CONFIRMED'],
                },
            },
            select: {
                startTime: true,
                endTime: true,
            },
        });

        // Generate time slots
        const slots: { time: string; available: boolean }[] = [];
        const [startHour, startMin] = availability.startTime.split(':').map(Number);
        const [endHour, endMin] = availability.endTime.split(':').map(Number);

        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        const sessionDuration = sessionType.duration;

        // Generate slots every 30 minutes
        for (let minutes = startMinutes; minutes + sessionDuration <= endMinutes; minutes += 30) {
            const hour = Math.floor(minutes / 60);
            const min = minutes % 60;
            const timeStr = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;

            // Check if this slot conflicts with existing bookings
            const slotEnd = minutes + sessionDuration;
            const isAvailable = !existingBookings.some(booking => {
                const [bStartH, bStartM] = booking.startTime.split(':').map(Number);
                const [bEndH, bEndM] = booking.endTime.split(':').map(Number);
                const bookingStart = bStartH * 60 + bStartM;
                const bookingEnd = bEndH * 60 + bEndM;

                // Check for overlap
                return (minutes < bookingEnd && slotEnd > bookingStart);
            });

            // Also check if the slot is in the past for today
            const now = new Date();
            let isPast = false;
            if (date.toDateString() === now.toDateString()) {
                const currentMinutes = now.getHours() * 60 + now.getMinutes();
                isPast = minutes <= currentMinutes;
            }

            slots.push({
                time: timeStr,
                available: isAvailable && !isPast,
            });
        }

        return NextResponse.json({ slots });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
