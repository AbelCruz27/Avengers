import Link from 'next/link';
import prisma from '@/lib/db';
import { notFound } from 'next/navigation';

interface ConfirmationPageProps {
    params: Promise<{ subdomain: string }>;
    searchParams: Promise<{ booking?: string }>;
}

export default async function ConfirmationPage({ params, searchParams }: ConfirmationPageProps) {
    const { subdomain } = await params;
    const { booking: bookingId } = await searchParams;

    if (!bookingId) {
        notFound();
    }

    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            photographer: true,
            sessionType: true,
        },
    });

    if (!booking || booking.photographer.subdomain !== subdomain) {
        notFound();
    }

    const primaryColor = booking.photographer.primaryColor || '#8B5CF6';
    const formattedDate = booking.date.toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Success Icon */}
                <div className="text-center mb-8">
                    <div
                        className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl"
                        style={{ backgroundColor: `${primaryColor}33` }}
                    >
                        ✅
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        ¡Reserva Confirmada!
                    </h1>
                    <p className="text-gray-400">
                        Hemos enviado los detalles a tu correo electrónico
                    </p>
                </div>

                {/* Booking Details Card */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Detalles de tu sesión
                    </h2>

                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Sesión</span>
                            <span className="text-white">{booking.sessionType.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Fotógrafo</span>
                            <span className="text-white">{booking.photographer.businessName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Fecha</span>
                            <span className="text-white capitalize">{formattedDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Hora</span>
                            <span className="text-white">{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Duración</span>
                            <span className="text-white">{booking.sessionType.duration} minutos</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-4 pt-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Anticipo pagado</span>
                            <span className="text-green-400">${Number(booking.depositAmount).toLocaleString()} MXN</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-400">Resto a pagar el día</span>
                            <span className="text-gray-300">
                                ${(Number(booking.totalAmount) - Number(booking.depositAmount)).toLocaleString()} MXN
                            </span>
                        </div>
                    </div>
                </div>

                {/* Client Info */}
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 mb-6">
                    <h2 className="text-lg font-semibold text-white mb-4">
                        Confirmación enviada a
                    </h2>
                    <p className="text-white">{booking.clientName}</p>
                    <p className="text-gray-400">{booking.clientEmail}</p>
                    {booking.clientPhone && (
                        <p className="text-gray-400">{booking.clientPhone}</p>
                    )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={`/p/${subdomain}`}
                        className="block w-full py-3 text-center text-white font-semibold rounded-xl transition-all"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Volver al inicio
                    </Link>
                    <button
                        onClick={() => window.print()}
                        className="block w-full py-3 text-center text-gray-300 font-semibold rounded-xl bg-gray-700 hover:bg-gray-600 transition-all"
                    >
                        Imprimir confirmación
                    </button>
                </div>

                {/* Note */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Si tienes alguna pregunta, contacta directamente al fotógrafo
                </p>
            </div>
        </div>
    );
}
