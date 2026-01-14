'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
    pendingSessions: number;
    confirmedSessions: number;
    monthlyRevenue: number;
    totalGalleries: number;
}

interface UpcomingSession {
    id: string;
    clientName: string;
    sessionType: string;
    date: string;
    startTime: string;
    status: string;
}

export default function AdminDashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        pendingSessions: 0,
        confirmedSessions: 0,
        monthlyRevenue: 0,
        totalGalleries: 0,
    });
    const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            if (!token) return;

            try {
                const res = await fetch('/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setUpcomingSessions(data.upcomingSessions);
                }
            } catch (error) {
                console.error('Error fetching dashboard:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDashboard();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">
                    ¡Hola, {user?.photographer?.businessName}! 👋
                </h1>
                <p className="text-gray-400 mt-1">
                    Aquí está el resumen de tu actividad
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.pendingSessions}</p>
                            <p className="text-gray-400 text-sm">Pendientes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.confirmedSessions}</p>
                            <p className="text-gray-400 text-sm">Confirmadas</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <span className="text-2xl">💰</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">
                                ${stats.monthlyRevenue.toLocaleString()}
                            </p>
                            <p className="text-gray-400 text-sm">Este mes</p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <span className="text-2xl">🖼️</span>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{stats.totalGalleries}</p>
                            <p className="text-gray-400 text-sm">Galerías</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white">Próximas Sesiones</h2>
                </div>

                {upcomingSessions.length > 0 ? (
                    <div className="divide-y divide-gray-700/50">
                        {upcomingSessions.map((session) => (
                            <div key={session.id} className="p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                                        <span className="text-xl">📷</span>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{session.clientName}</p>
                                        <p className="text-gray-400 text-sm">{session.sessionType}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">{new Date(session.date).toLocaleDateString('es-MX')}</p>
                                    <p className="text-gray-400 text-sm">{session.startTime}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${session.status === 'CONFIRMED'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-yellow-500/20 text-yellow-400'
                                    }`}>
                                    {session.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">
                        <p className="text-4xl mb-2">📅</p>
                        <p>No tienes sesiones próximas</p>
                        <p className="text-sm mt-1">Las nuevas reservas aparecerán aquí</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left">
                    <span className="text-2xl mb-2 block">➕</span>
                    <p className="text-white font-medium">Crear tipo de sesión</p>
                    <p className="text-gray-400 text-sm">Define precios y duración</p>
                </button>

                <button className="p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left">
                    <span className="text-2xl mb-2 block">⏰</span>
                    <p className="text-white font-medium">Configurar horarios</p>
                    <p className="text-gray-400 text-sm">Define tu disponibilidad</p>
                </button>

                <button className="p-4 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all text-left">
                    <span className="text-2xl mb-2 block">🎨</span>
                    <p className="text-white font-medium">Personalizar sitio</p>
                    <p className="text-gray-400 text-sm">Colores y branding</p>
                </button>
            </div>
        </div>
    );
}
