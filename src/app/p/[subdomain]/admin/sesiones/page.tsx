'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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

interface SesionesPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function SesionesPage({ params }: SesionesPageProps) {
    const { token } = useAuth();
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('status') || 'all';

    const [subdomain, setSubdomain] = useState('');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>(initialFilter);
    const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-desc');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

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

    const filteredBookings = bookings
        .filter(b => filter === 'all' || b.status === filter)
        .filter(b =>
            searchTerm === '' ||
            b.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return sortBy === 'date-asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'PENDING').length,
        confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
        completed: bookings.filter(b => b.status === 'COMPLETED').length,
    };

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
                <Link
                    href={`/p/${subdomain}/admin/calendario`}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors inline-flex items-center gap-2"
                >
                    🗓️ Ver Calendario
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'purple' },
                    { label: 'Pendientes', value: stats.pending, color: 'yellow' },
                    { label: 'Confirmadas', value: stats.confirmed, color: 'green' },
                    { label: 'Completadas', value: stats.completed, color: 'blue' },
                ].map(stat => (
                    <div key={stat.label} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                        <p className={`text-2xl font-bold text-${stat.color}-400`}>{stat.value}</p>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
                    />
                </div>

                {/* Status Filter */}
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

                {/* Sort */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date-asc' | 'date-desc')}
                    className="bg-gray-800 rounded-lg px-4 py-2 text-white border border-gray-700 focus:border-purple-500 focus:outline-none"
                >
                    <option value="date-desc">Más recientes</option>
                    <option value="date-asc">Más antiguas</option>
                </select>
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
                                    const isPast = new Date(booking.date) < new Date();

                                    return (
                                        <tr key={booking.id} className={`hover:bg-gray-700/30 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                                            <td className="px-4 py-4">
                                                <div>
                                                    <p className="text-white font-medium">{booking.clientName}</p>
                                                    <p className="text-gray-400 text-sm">{booking.clientEmail}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-300">{booking.sessionType}</td>
                                            <td className="px-4 py-4">
                                                <p className="text-gray-300">
                                                    {new Date(booking.date).toLocaleDateString('es-MX', {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </p>
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
                                                    href={`/p/${subdomain}/admin/sesiones/${booking.id}`}
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
                        {filter !== 'all' && (
                            <button
                                onClick={() => setFilter('all')}
                                className="mt-4 text-purple-400 hover:underline"
                            >
                                Ver todas las sesiones
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
