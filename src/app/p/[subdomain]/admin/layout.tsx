'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface AdminLayoutProps {
    children: React.ReactNode;
    params: Promise<{ subdomain: string }>;
}

const menuItems = [
    { href: '', icon: '📊', label: 'Resumen' },
    { href: '/sesiones', icon: '📅', label: 'Sesiones' },
    { href: '/galerias', icon: '🖼️', label: 'Galerías' },
    { href: '/configuracion', icon: '⚙️', label: 'Configuración' },
];

const secondaryItems = [
    { href: '/calendario', icon: '🗓️', label: 'Calendario' },
    { href: '/tipos-sesion', icon: '📷', label: 'Tipos de Sesión' },
    { href: '/disponibilidad', icon: '⏰', label: 'Disponibilidad' },
    { href: '/pagos', icon: '💰', label: 'Pagos' },
];

function AdminLayoutContent({ children, params }: AdminLayoutProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [subdomain, setSubdomain] = useState<string>('');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    const basePath = `/p/${subdomain}/admin`;

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800/95 backdrop-blur transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-5 border-b border-gray-700">
                        <Link href={`/p/${subdomain}`} className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: '#8B5CF6' }}
                            >
                                {user?.photographer?.businessName?.[0]?.toUpperCase() || '📸'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">
                                    {user?.photographer?.businessName || 'Mi Estudio'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{subdomain}.photopro.com</p>
                            </div>
                        </Link>
                    </div>

                    {/* Main Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Principal</p>
                        {menuItems.map((item) => {
                            const href = `${basePath}${item.href}`;
                            const isActive = pathname === href || (item.href === '' && pathname === basePath);

                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-4 pb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Herramientas</p>
                        </div>
                        {secondaryItems.map((item) => {
                            const href = `${basePath}${item.href}`;
                            const isActive = pathname === href;

                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${isActive
                                        ? 'bg-purple-600/80 text-white'
                                        : 'text-gray-500 hover:bg-gray-700/50 hover:text-gray-300'
                                        }`}
                                >
                                    <span>{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-700">
                        <Link
                            href={`${basePath}/perfil`}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                        >
                            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">Ver perfil</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top Bar - Mobile */}
                <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700/50 py-4 px-6 lg:hidden flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-white text-xl"
                    >
                        ☰
                    </button>
                    <span className="text-white font-medium">{user?.photographer?.businessName}</span>
                    <div className="w-8" />
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({ children, params }: AdminLayoutProps) {
    return (
        <ProtectedRoute>
            <AdminLayoutContent params={params}>{children}</AdminLayoutContent>
        </ProtectedRoute>
    );
}
