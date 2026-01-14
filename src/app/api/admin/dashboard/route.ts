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

        // Get stats
        const [pendingSessions, confirmedSessions, monthlyPayments, totalGalleries] = await Promise.all([
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
                monthlyRevenue: Number(monthlyPayments._sum.amount || 0),
                totalGalleries,
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
