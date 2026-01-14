import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { z } from 'zod';

const bookingSchema = z.object({
    subdomain: z.string(),
    sessionTypeId: z.string(),
    date: z.string(),
    startTime: z.string(),
    clientName: z.string().min(2),
    clientEmail: z.string().email(),
    clientPhone: z.string().optional(),
    notes: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = bookingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { subdomain, sessionTypeId, date, startTime, clientName, clientEmail, clientPhone, notes } = validation.data;

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

        // Get session type
        const sessionType = await prisma.sessionType.findUnique({
            where: { id: sessionTypeId },
        });

        if (!sessionType || sessionType.photographerId !== photographer.id) {
            return NextResponse.json(
                { error: 'Tipo de sesión no válido' },
                { status: 400 }
            );
        }

        // Parse date and calculate end time
        const bookingDate = new Date(date);
        const [startHour, startMin] = startTime.split(':').map(Number);
        const endMinutes = startHour * 60 + startMin + sessionType.duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;

        // Check for conflicting bookings
        const existingBooking = await prisma.booking.findFirst({
            where: {
                photographerId: photographer.id,
                date: bookingDate,
                status: { in: ['PENDING', 'CONFIRMED'] },
                OR: [
                    {
                        AND: [
                            { startTime: { lte: startTime } },
                            { endTime: { gt: startTime } },
                        ],
                    },
                    {
                        AND: [
                            { startTime: { lt: endTime } },
                            { endTime: { gte: endTime } },
                        ],
                    },
                ],
            },
        });

        if (existingBooking) {
            return NextResponse.json(
                { error: 'Este horario ya no está disponible' },
                { status: 409 }
            );
        }

        // Calculate amounts
        const totalAmount = Number(sessionType.price);
        const depositAmount = totalAmount * sessionType.depositPercent / 100;

        // Create booking
        const booking = await prisma.booking.create({
            data: {
                photographerId: photographer.id,
                sessionTypeId,
                clientName,
                clientEmail,
                clientPhone: clientPhone || null,
                date: bookingDate,
                startTime,
                endTime,
                notes: notes || null,
                status: 'PENDING',
                totalAmount,
                depositAmount,
                depositPaid: false, // Will be true after Stripe payment
                fullyPaid: false,
            },
        });

        // In a real implementation, we would create a Stripe payment intent here
        // For now, we'll simulate a successful payment
        await prisma.booking.update({
            where: { id: booking.id },
            data: {
                status: 'CONFIRMED',
                depositPaid: true,
            },
        });

        // Create a payment record
        await prisma.payment.create({
            data: {
                bookingId: booking.id,
                amount: depositAmount,
                type: 'DEPOSIT',
                status: 'COMPLETED',
                provider: 'simulated',
                providerId: `sim_${Date.now()}`,
            },
        });

        return NextResponse.json({
            message: 'Reserva creada exitosamente',
            booking: {
                id: booking.id,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: 'CONFIRMED',
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
