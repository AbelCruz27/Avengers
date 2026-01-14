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
        const limit = searchParams.get('limit');

        const payments = await prisma.payment.findMany({
            where: {
                booking: {
                    photographerId: auth.photographerId,
                },
            },
            include: {
                booking: {
                    select: {
                        clientName: true,
                        sessionType: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit ? parseInt(limit) : undefined,
        });

        // Calculate totals
        const aggregations = await prisma.payment.aggregate({
            where: {
                booking: { photographerId: auth.photographerId },
                status: 'COMPLETED',
            },
            _sum: { amount: true },
            _count: true,
        });

        return NextResponse.json({
            payments: payments.map(p => ({
                id: p.id,
                amount: Number(p.amount),
                type: p.type,
                status: p.status,
                provider: p.provider,
                createdAt: p.createdAt.toISOString(),
                clientName: p.booking.clientName,
                sessionName: p.booking.sessionType.name,
            })),
            stats: {
                totalRevenue: Number(aggregations._sum.amount || 0),
                totalTransactions: aggregations._count,
            }
        });
    } catch (error) {
        console.error('Error fetching payments:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
