'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardStats {
    pendingSessions: number;
    confirmedSessions: number;
    completedSessions: number;
    monthlyRevenue: number;
    totalGalleries: number;
    activeGalleries: number;
    totalPhotos: number;
    totalSessionTypes: number;
}

interface UpcomingSession {
    id: string;
    clientName: string;
    sessionType: string;
    date: string;
    startTime: string;
    status: string;
}

interface DashboardPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function DashboardPage({ params }: DashboardPageProps) {
    const { token, user } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        if (!token) return;

        async function fetchDashboard() {
            try {
                const res = await fetch('/api/admin/dashboard', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setUpcomingSessions(data.upcomingSessions);
                }
            } catch (e) {
                console.error(e);
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

    const today = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    ¡Hola, {user?.photographer?.businessName?.split(' ')[0] || 'Fotógrafo'}!
                </h1>
                <p className="text-gray-400 capitalize">{today}</p>
            </div>

            {/* Main Stats - Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-5 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-yellow-400">{stats?.pendingSessions || 0}</p>
                            <p className="text-yellow-200/70 text-sm">Sesiones Pendientes</p>
                        </div>
                        <span className="text-3xl opacity-50">⏳</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-green-400">{stats?.confirmedSessions || 0}</p>
                            <p className="text-green-200/70 text-sm">Confirmadas</p>
                        </div>
                        <span className="text-3xl opacity-50">✓</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-blue-400">{stats?.totalGalleries || 0}</p>
                            <p className="text-blue-200/70 text-sm">Galerías Activas</p>
                        </div>
                        <span className="text-3xl opacity-50">🖼️</span>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold text-purple-400">${(stats?.monthlyRevenue || 0).toLocaleString()}</p>
                            <p className="text-purple-200/70 text-sm">Ingresos del Mes</p>
                        </div>
                        <span className="text-3xl opacity-50">💰</span>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Sessions Preview */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                    <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">📅 Próximas Sesiones</h2>
                        <Link href="sesiones" className="text-sm text-purple-400 hover:underline">
                            Ver todas →
                        </Link>
                    </div>

                    {upcomingSessions.length > 0 ? (
                        <div className="divide-y divide-gray-700/50">
                            {upcomingSessions.slice(0, 4).map((session) => (
                                <Link
                                    key={session.id}
                                    href={`sesiones/${session.id}`}
                                    className="flex items-center justify-between p-4 hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center text-white font-medium">
                                            {session.clientName[0]}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{session.clientName}</p>
                                            <p className="text-gray-400 text-sm">{session.sessionType}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white text-sm">
                                            {new Date(session.date).toLocaleDateString('es-MX', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </p>
                                        <p className="text-gray-400 text-sm">{session.startTime}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-gray-500 mb-2">No tienes sesiones próximas</p>
                            <Link href="disponibilidad" className="text-purple-400 hover:underline text-sm">
                                Configura tu disponibilidad →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Quick Stats & Actions */}
                <div className="space-y-6">
                    {/* Mini Stats */}
                    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-5">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Resumen General</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Sesiones Completadas</span>
                                <span className="text-white font-medium">{stats?.completedSessions || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Fotos Subidas</span>
                                <span className="text-white font-medium">{stats?.totalPhotos || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Tipos de Sesión</span>
                                <span className="text-white font-medium">{stats?.totalSessionTypes || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 p-5">
                        <h3 className="text-sm text-gray-400 uppercase tracking-wider mb-4">Acciones Rápidas</h3>
                        <div className="space-y-2">
                            <Link
                                href="galerias/nueva"
                                className="flex items-center gap-3 p-3 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 transition-colors text-purple-300"
                            >
                                <span>🖼️</span>
                                <span className="font-medium">Nueva Galería</span>
                            </Link>
                            <Link
                                href="tipos-sesion"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300"
                            >
                                <span>📷</span>
                                <span>Agregar Tipo de Sesión</span>
                            </Link>
                            <Link
                                href="calendario"
                                className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300"
                            >
                                <span>🗓️</span>
                                <span>Ver Calendario</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Site Link */}
            <div className="bg-gradient-to-r from-purple-900/30 to-gray-800/30 rounded-xl p-5 border border-purple-500/20 flex items-center justify-between">
                <div>
                    <p className="text-white font-medium">Tu Sitio Público</p>
                    <p className="text-gray-400 text-sm">
                        <span className="font-mono">{subdomain}.photopro.com</span>
                    </p>
                </div>
                <a
                    href={`/p/${subdomain}`}
                    target="_blank"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                    <span>Ver Sitio</span>
                    <span>↗</span>
                </a>
            </div>
        </div>
    );
}
