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
    { href: '', icon: '📊', label: 'Dashboard' },
    { href: '/sesiones', icon: '📅', label: 'Sesiones' },
    { href: '/calendario', icon: '🗓️', label: 'Calendario' },
    { href: '/galerias', icon: '🖼️', label: 'Galerías' },
    { href: '/subir-fotos', icon: '📤', label: 'Subir Fotos' },
    { href: '/disponibilidad', icon: '⏰', label: 'Disponibilidad' },
    { href: '/configuracion', icon: '⚙️', label: 'Configuración' },
    { href: '/pagos', icon: '💰', label: 'Pagos' },
    { href: '/perfil', icon: '👤', label: 'Perfil' },
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
                    <div className="p-6 border-b border-gray-700">
                        <Link href={`/p/${subdomain}`} className="flex items-center gap-2">
                            <span className="text-2xl">📸</span>
                            <span className="text-lg font-bold text-white">
                                {user?.photographer?.businessName || 'Admin'}
                            </span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const href = `${basePath}${item.href}`;
                            const isActive = pathname === href || (item.href === '' && pathname === basePath);

                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">{subdomain}.photopro.com</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all"
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
                {/* Top Bar */}
                <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700/50 py-4 px-6 lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-white"
                    >
                        ☰
                    </button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6">
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
