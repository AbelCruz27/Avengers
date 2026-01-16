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
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    const basePath = `/p/${subdomain}/admin`;

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {/* Sidebar - Desktop */}
            <aside
                className={`hidden lg:flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                    }`}
            >
                {/* Logo & Toggle */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    {!collapsed && (
                        <Link href={`/p/${subdomain}`} className="flex items-center gap-3 flex-1 min-w-0">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                                style={{ backgroundColor: '#8B5CF6' }}
                            >
                                {user?.photographer?.businessName?.[0]?.toUpperCase() || '📸'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate text-sm">
                                    {user?.photographer?.businessName || 'Mi Estudio'}
                                </p>
                                <p className="text-xs text-gray-500 truncate">{subdomain}.photopro.com</p>
                            </div>
                        </Link>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ${collapsed ? 'mx-auto' : ''}`}
                        title={collapsed ? 'Expandir' : 'Contraer'}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {!collapsed && <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Principal</p>}
                    {menuItems.map((item) => {
                        const href = `${basePath}${item.href}`;
                        const isActive = pathname === href || (item.href === '' && pathname === basePath);

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                        ? 'bg-purple-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                    } ${collapsed ? 'justify-center' : ''}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                {!collapsed && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}

                    <div className="pt-4 pb-2">
                        {!collapsed && <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Herramientas</p>}
                    </div>
                    {secondaryItems.map((item) => {
                        const href = `${basePath}${item.href}`;
                        const isActive = pathname === href;

                        return (
                            <Link
                                key={item.href}
                                href={href}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${isActive
                                        ? 'bg-purple-600/80 text-white'
                                        : 'text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                                    } ${collapsed ? 'justify-center' : ''}`}
                            >
                                <span>{item.icon}</span>
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-gray-700">
                    <Link
                        href={`${basePath}/perfil`}
                        title={collapsed ? 'Mi Perfil' : undefined}
                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors ${collapsed ? 'justify-center' : ''}`}
                    >
                        <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-white truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">Ver perfil</p>
                            </div>
                        )}
                    </Link>
                    {!collapsed && (
                        <button
                            onClick={logout}
                            className="mt-2 w-full py-2 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                        >
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </aside>

            {/* Sidebar - Mobile */}
            <div className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? 'block' : 'hidden'}`}>
                <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
                <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gray-800 flex flex-col">
                    {/* Logo */}
                    <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                        <Link href={`/p/${subdomain}`} className="flex items-center gap-3 flex-1">
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
                            </div>
                        </Link>
                        <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-white text-xl">
                            ✕
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <p className="text-xs text-gray-500 uppercase tracking-wider px-3 mb-2">Principal</p>
                        {menuItems.map((item) => {
                            const href = `${basePath}${item.href}`;
                            const isActive = pathname === href || (item.href === '' && pathname === basePath);

                            return (
                                <Link
                                    key={item.href}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
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
                                    onClick={() => setMobileOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                            ? 'bg-purple-600/80 text-white'
                                            : 'text-gray-500 hover:bg-gray-700 hover:text-gray-300'
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
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                                {user?.email?.[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white truncate">{user?.email}</p>
                                <p className="text-xs text-gray-500">Ver perfil</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="mt-3 w-full py-2 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 rounded-lg transition-all"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen min-w-0">
                {/* Top Bar - Mobile */}
                <header className="lg:hidden bg-gray-800 border-b border-gray-700 py-4 px-4 flex items-center gap-4">
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="text-white text-2xl p-1"
                    >
                        ☰
                    </button>
                    <span className="text-white font-medium truncate">{user?.photographer?.businessName}</span>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
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
