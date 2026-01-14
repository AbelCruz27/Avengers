'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';

function DashboardContent() {
    const { user, logout } = useAuth();
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'tuapp.com';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-white">
                        📸 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">PhotoPro</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">
                            {user?.email}
                        </span>
                        <button
                            onClick={logout}
                            className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-8 mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        ¡Bienvenido, {user?.photographer?.businessName}! 🎉
                    </h2>
                    <p className="text-gray-300 mb-4">
                        Tu sitio está listo en:{' '}
                        <a
                            href={`https://${user?.photographer?.subdomain}.${appDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300 font-mono"
                        >
                            {user?.photographer?.subdomain}.{appDomain}
                        </a>
                    </p>
                    <div className="flex gap-3">
                        <Link
                            href="/dashboard/settings"
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                        >
                            Configurar perfil
                        </Link>
                        <Link
                            href="/dashboard/sessions"
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                        >
                            Ver sesiones
                        </Link>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <span className="text-2xl">📅</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">0</p>
                                <p className="text-gray-400 text-sm">Sesiones pendientes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500/20 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">$0</p>
                                <p className="text-gray-400 text-sm">Ingresos este mes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <span className="text-2xl">🖼️</span>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">0</p>
                                <p className="text-gray-400 text-sm">Galerías activas</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-semibold text-white mb-4">Próximos pasos</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                            <span className="text-xl">1️⃣</span>
                            <span className="text-gray-300">Completa tu perfil de fotógrafo</span>
                            <span className="ml-auto text-yellow-400 text-sm">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                            <span className="text-xl">2️⃣</span>
                            <span className="text-gray-300">Configura tus tipos de sesión</span>
                            <span className="ml-auto text-yellow-400 text-sm">Pendiente</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                            <span className="text-xl">3️⃣</span>
                            <span className="text-gray-300">Conecta tu cuenta de Stripe</span>
                            <span className="ml-auto text-yellow-400 text-sm">Pendiente</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <DashboardContent />
        </ProtectedRoute>
    );
}
