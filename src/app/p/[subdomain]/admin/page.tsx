'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

    const statCards = [
        {
            label: 'Sesiones Pendientes',
            value: stats?.pendingSessions || 0,
            icon: '⏳',
            color: 'yellow',
            href: `sesiones?status=PENDING`
        },
        {
            label: 'Sesiones Confirmadas',
            value: stats?.confirmedSessions || 0,
            icon: '✅',
            color: 'green',
            href: `sesiones?status=CONFIRMED`
        },
        {
            label: 'Ingresos del Mes',
            value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
            icon: '💰',
            color: 'purple',
            href: 'pagos'
        },
        {
            label: 'Galerías',
            value: stats?.totalGalleries || 0,
            icon: '🖼️',
            color: 'blue',
            href: 'galerias'
        },
    ];

    const quickActions = [
        { label: 'Configurar Disponibilidad', icon: '⏰', href: 'disponibilidad', desc: 'Define tus horarios de trabajo' },
        { label: 'Crear Tipo de Sesión', icon: '📷', href: 'tipos-sesion', desc: 'Agrega un nuevo servicio' },
        { label: 'Nueva Galería', icon: '🖼️', href: 'galerias/nueva', desc: 'Crea una galería para cliente' },
        { label: 'Ver Calendario', icon: '🗓️', href: 'calendario', desc: 'Tu agenda completa' },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-purple-900/50 to-gray-800/50 rounded-2xl p-6 border border-purple-500/20">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    ¡Bienvenido, {user?.photographer?.businessName || 'Fotógrafo'}!
                </h1>
                <p className="text-gray-400">
                    Tu sitio está activo en{' '}
                    <a
                        href={`/p/${subdomain}`}
                        target="_blank"
                        className="text-purple-400 hover:underline"
                    >
                        {subdomain}.photopro.com
                    </a>
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="bg-gray-800/50 backdrop-blur rounded-xl p-5 border border-gray-700/50 hover:border-gray-600 transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-${stat.color}-500/20`}>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {stat.value}
                        </p>
                        <p className="text-gray-400 text-sm">{stat.label}</p>
                    </Link>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Upcoming Sessions */}
                <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                    <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Próximas Sesiones</h2>
                        <Link href="sesiones" className="text-sm text-purple-400 hover:underline">
                            Ver todas →
                        </Link>
                    </div>

                    {upcomingSessions.length > 0 ? (
                        <div className="divide-y divide-gray-700/50">
                            {upcomingSessions.map((session) => (
                                <Link
                                    key={session.id}
                                    href={`sesiones/${session.id}`}
                                    className="block p-4 hover:bg-gray-700/30 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-white font-medium">{session.clientName}</p>
                                            <p className="text-gray-400 text-sm">{session.sessionType}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white">
                                                {new Date(session.date).toLocaleDateString('es-MX', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-gray-400 text-sm">{session.startTime}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-4xl mb-2">📅</p>
                            <p className="text-gray-400">No hay sesiones próximas</p>
                            <p className="text-gray-500 text-sm mt-1">
                                Configura tu disponibilidad para recibir reservas
                            </p>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50">
                    <div className="p-5 border-b border-gray-700/50">
                        <h2 className="text-lg font-semibold text-white">Acciones Rápidas</h2>
                    </div>
                    <div className="p-4 space-y-2">
                        {quickActions.map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors group"
                            >
                                <span className="text-2xl">{action.icon}</span>
                                <div>
                                    <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                                        {action.label}
                                    </p>
                                    <p className="text-gray-500 text-xs">{action.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Setup Checklist */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-lg font-semibold text-white mb-4">Configura tu Negocio</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { done: true, label: 'Crear cuenta', href: '' },
                        { done: (stats?.confirmedSessions || 0) > 0, label: 'Primera reserva', href: 'disponibilidad' },
                        { done: (stats?.totalGalleries || 0) > 0, label: 'Crear galería', href: 'galerias/nueva' },
                        { done: false, label: 'Configurar pagos', href: 'configuracion' },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${item.done
                                    ? 'border-green-500/30 bg-green-500/10'
                                    : 'border-gray-700 hover:border-gray-600'
                                }`}
                        >
                            <span className={`text-xl ${item.done ? 'text-green-400' : 'text-gray-500'}`}>
                                {item.done ? '✓' : '○'}
                            </span>
                            <span className={item.done ? 'text-green-400' : 'text-gray-300'}>
                                {item.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
