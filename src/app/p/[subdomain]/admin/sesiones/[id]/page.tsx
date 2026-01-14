'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetail {
    id: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string | null;
    sessionType: { name: string; duration: number };
    date: string;
    startTime: string;
    endTime: string;
    notes: string | null;
    status: string;
    totalAmount: number;
    depositAmount: number;
    depositPaid: boolean;
    fullyPaid: boolean;
    createdAt: string;
    payments: { id: string; amount: number; type: string; status: string; createdAt: string }[];
}

interface SessionDetailPageProps {
    params: Promise<{ subdomain: string; id: string }>;
}

const statusOptions = [
    { value: 'PENDING', label: 'Pendiente', color: 'yellow' },
    { value: 'CONFIRMED', label: 'Confirmada', color: 'green' },
    { value: 'COMPLETED', label: 'Completada', color: 'blue' },
    { value: 'CANCELLED', label: 'Cancelada', color: 'red' },
    { value: 'NO_SHOW', label: 'No asistió', color: 'gray' },
];

export default function SessionDetailPage({ params }: SessionDetailPageProps) {
    const { token } = useAuth();
    const [booking, setBooking] = useState<BookingDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [subdomain, setSubdomain] = useState('');
    const [bookingId, setBookingId] = useState('');

    useEffect(() => {
        params.then(p => {
            setSubdomain(p.subdomain);
            setBookingId(p.id);
        });
    }, [params]);

    useEffect(() => {
        if (!token || !bookingId) return;

        async function fetchBooking() {
            try {
                const res = await fetch(`/api/admin/bookings/${bookingId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setBooking(data.booking);
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBooking();
    }, [token, bookingId]);

    const handleStatusChange = async (newStatus: string) => {
        if (!token || !booking) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/bookings/${booking.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setBooking(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Sesión no encontrada</p>
                <Link href={`/p/${subdomain}/admin/sesiones`} className="text-purple-400 hover:underline">
                    Volver a sesiones
                </Link>
            </div>
        );
    }

    const formattedDate = new Date(booking.date).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="max-w-4xl space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href={`/p/${subdomain}/admin/sesiones`}
                        className="text-gray-400 hover:text-white text-sm mb-2 inline-block"
                    >
                        ← Volver a sesiones
                    </Link>
                    <h1 className="text-3xl font-bold text-white">Detalle de Sesión</h1>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Client Info */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>👤</span> Información del Cliente
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-400 text-sm">Nombre</span>
                            <p className="text-white font-medium">{booking.clientName}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Email</span>
                            <p className="text-white">{booking.clientEmail}</p>
                        </div>
                        {booking.clientPhone && (
                            <div>
                                <span className="text-gray-400 text-sm">Teléfono</span>
                                <p className="text-white">{booking.clientPhone}</p>
                            </div>
                        )}
                        {booking.notes && (
                            <div>
                                <span className="text-gray-400 text-sm">Notas</span>
                                <p className="text-white">{booking.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Session Info */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📷</span> Información de la Sesión
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-400 text-sm">Tipo</span>
                            <p className="text-white font-medium">{booking.sessionType.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Fecha</span>
                            <p className="text-white capitalize">{formattedDate}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Horario</span>
                            <p className="text-white">{booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Duración</span>
                            <p className="text-white">{booking.sessionType.duration} minutos</p>
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>📊</span> Estado
                    </h2>
                    <div className="space-y-4">
                        <select
                            value={booking.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <p className="text-gray-400 text-sm">
                            Creada el {new Date(booking.createdAt).toLocaleDateString('es-MX')}
                        </p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span>💰</span> Pagos
                    </h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total</span>
                            <span className="text-white font-bold">${Number(booking.totalAmount).toLocaleString()} MXN</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Anticipo</span>
                            <span className={booking.depositPaid ? 'text-green-400' : 'text-yellow-400'}>
                                ${Number(booking.depositAmount).toLocaleString()} MXN
                                {booking.depositPaid ? ' ✓' : ' (pendiente)'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Resto</span>
                            <span className={booking.fullyPaid ? 'text-green-400' : 'text-gray-300'}>
                                ${(Number(booking.totalAmount) - Number(booking.depositAmount)).toLocaleString()} MXN
                                {booking.fullyPaid && ' ✓'}
                            </span>
                        </div>
                    </div>

                    {booking.payments.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400 mb-2">Historial de pagos</p>
                            <div className="space-y-2">
                                {booking.payments.map((payment) => (
                                    <div key={payment.id} className="flex justify-between text-sm">
                                        <span className="text-gray-300">
                                            {payment.type === 'DEPOSIT' ? 'Anticipo' : 'Pago'}
                                        </span>
                                        <span className="text-white">${Number(payment.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all">
                    📤 Subir fotos de esta sesión
                </button>
                <button className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all">
                    ✉️ Enviar email al cliente
                </button>
            </div>
        </div>
    );
}
