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

        const photographerId = auth.photographerId;

        // Get current month date range
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Get all stats in parallel
        const [
            pendingSessions,
            confirmedSessions,
            completedSessions,
            monthlyPayments,
            totalGalleries,
            totalPhotos,
            totalSessionTypes,
        ] = await Promise.all([
            prisma.booking.count({
                where: {
                    photographerId,
                    status: 'PENDING',
                },
            }),
            prisma.booking.count({
                where: {
                    photographerId,
                    status: 'CONFIRMED',
                    date: { gte: now },
                },
            }),
            prisma.booking.count({
                where: {
                    photographerId,
                    status: 'COMPLETED',
                },
            }),
            prisma.payment.aggregate({
                where: {
                    booking: { photographerId },
                    status: 'COMPLETED',
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
                _sum: { amount: true },
            }),
            prisma.gallery.count({
                where: { photographerId },
            }),
            prisma.photo.count({
                where: { gallery: { photographerId } },
            }),
            prisma.sessionType.count({
                where: { photographerId, isActive: true },
            }),
        ]);

        // Get upcoming sessions
        const upcomingSessions = await prisma.booking.findMany({
            where: {
                photographerId,
                date: { gte: now },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            include: {
                sessionType: { select: { name: true } },
            },
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
            take: 5,
        });

        return NextResponse.json({
            stats: {
                pendingSessions,
                confirmedSessions,
                completedSessions,
                monthlyRevenue: Number(monthlyPayments._sum.amount || 0),
                totalGalleries,
                activeGalleries: totalGalleries, // Could add isPublic filter
                totalPhotos,
                totalSessionTypes,
            },
            upcomingSessions: upcomingSessions.map(s => ({
                id: s.id,
                clientName: s.clientName,
                sessionType: s.sessionType.name,
                date: s.date.toISOString(),
                startTime: s.startTime,
                status: s.status,
            })),
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
