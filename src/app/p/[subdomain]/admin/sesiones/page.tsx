'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Booking {
    id: string;
    clientName: string;
    clientEmail: string;
    sessionType: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    totalAmount: number;
    depositPaid: boolean;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Pendiente' },
    CONFIRMED: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Confirmada' },
    COMPLETED: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Completada' },
    CANCELLED: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelada' },
    NO_SHOW: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'No asistió' },
};

export default function SesionesPage() {
    const { token } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');

    useEffect(() => {
        async function fetchBookings() {
            if (!token) return;

            try {
                const res = await fetch('/api/admin/bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setBookings(data.bookings);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, [token]);

    const filteredBookings = filter === 'all'
        ? bookings
        : bookings.filter(b => b.status === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Sesiones</h1>
                    <p className="text-gray-400 mt-1">Gestiona todas tus reservas</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {[
                    { value: 'all', label: 'Todas' },
                    { value: 'PENDING', label: 'Pendientes' },
                    { value: 'CONFIRMED', label: 'Confirmadas' },
                    { value: 'COMPLETED', label: 'Completadas' },
                    { value: 'CANCELLED', label: 'Canceladas' },
                ].map((f) => (
                    <button
                        key={f.value}
                        onClick={() => setFilter(f.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.value
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                            }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden">
                {filteredBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Cliente</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Sesión</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Fecha</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Hora</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Estado</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {filteredBookings.map((booking) => {
                                    const status = statusColors[booking.status] || statusColors.PENDING;
                                    return (
                                        <tr key={booking.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{booking.clientName}</p>
                                                    <p className="text-gray-400 text-sm">{booking.clientEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-300">{booking.sessionType}</td>
                                            <td className="px-4 py-4 text-gray-300">
                                                {new Date(booking.date).toLocaleDateString('es-MX')}
                                            </td>
                                            <td className="px-4 py-4 text-gray-300">
                                                {booking.startTime} - {booking.endTime}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-white font-medium">
                                                    ${booking.totalAmount.toLocaleString()}
                                                </span>
                                                {booking.depositPaid && (
                                                    <span className="ml-2 text-green-400 text-xs">✓ Anticipo</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <Link
                                                    href={`sesiones/${booking.id}`}
                                                    className="text-purple-400 hover:text-purple-300 text-sm"
                                                >
                                                    Ver detalles →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <p className="text-4xl mb-2">📅</p>
                        <p className="text-gray-400">No hay sesiones que mostrar</p>
                        <p className="text-gray-500 text-sm mt-1">
                            Las nuevas reservas aparecerán aquí
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
