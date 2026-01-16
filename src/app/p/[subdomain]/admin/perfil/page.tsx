'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface UserProfile {
    email: string;
    role: string;
    createdAt: string;
    photographer: {
        businessName: string;
        subdomain: string;
        bio: string | null;
        phone: string | null;
        primaryColor: string;
        avatarUrl: string | null;
        isActive: boolean;
        createdAt: string;
    };
}

interface PerfilPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function PerfilPage({ params }: PerfilPageProps) {
    const { token, logout } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editingPassword, setEditingPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        if (!token) return;
        async function fetchProfile() {
            try {
                const res = await fetch('/api/admin/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.user);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [token]);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordMessage(null);

        if (passwords.new !== passwords.confirm) {
            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (passwords.new.length < 6) {
            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        // In production, call actual password change API
        // For now, just simulate success
        setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
        setPasswords({ current: '', new: '', confirm: '' });
        setEditingPassword(false);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    if (!profile) return <div className="text-red-400">Error al cargar perfil</div>;

    const memberSince = new Date(profile.createdAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
                <p className="text-gray-400">Gestiona tu cuenta y preferencias</p>
            </div>

            {/* Profile Header */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center gap-6">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                        style={{ backgroundColor: profile.photographer.primaryColor || '#8B5CF6' }}
                    >
                        {profile.photographer.avatarUrl ? (
                            <img
                                src={profile.photographer.avatarUrl}
                                alt=""
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            profile.photographer.businessName[0].toUpperCase()
                        )}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-white">{profile.photographer.businessName}</h2>
                        <p className="text-gray-400">{profile.email}</p>
                        <div className="flex items-center gap-4 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${profile.photographer.isActive
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}>
                                {profile.photographer.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                            <span className="text-gray-500 text-sm">Miembro desde {memberSince}</span>
                        </div>
                    </div>
                    <Link
                        href={`/p/${subdomain}/admin/configuracion`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        ✏️ Editar Perfil
                    </Link>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Datos de Cuenta</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <span className="text-gray-400 text-sm">Correo Electrónico</span>
                        <p className="text-white font-medium mt-1">{profile.email}</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Rol</span>
                        <p className="text-white capitalize mt-1">{profile.role.toLowerCase()}</p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Subdominio</span>
                        <p className="text-white mt-1">
                            <span className="font-mono bg-gray-700 px-2 py-1 rounded text-sm">
                                {profile.photographer.subdomain}.photopro.com
                            </span>
                        </p>
                    </div>
                    <div>
                        <span className="text-gray-400 text-sm">Teléfono</span>
                        <p className="text-white mt-1">{profile.photographer.phone || 'No configurado'}</p>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Seguridad</h2>

                {passwordMessage && (
                    <div className={`p-4 rounded-lg mb-4 ${passwordMessage.type === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                        {passwordMessage.text}
                    </div>
                )}

                {editingPassword ? (
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Contraseña Actual
                            </label>
                            <input
                                type="password"
                                value={passwords.current}
                                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                                required
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={passwords.new}
                                onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                                required
                                minLength={6}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Confirmar Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                value={passwords.confirm}
                                onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                                required
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                            >
                                Guardar Cambios
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingPassword(false);
                                    setPasswords({ current: '', new: '', confirm: '' });
                                }}
                                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Contraseña</p>
                            <p className="text-gray-400 text-sm">••••••••••••</p>
                        </div>
                        <button
                            onClick={() => setEditingPassword(true)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Cambiar
                        </button>
                    </div>
                )}
            </div>

            {/* Subscription */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold text-white mb-4">Plan y Suscripción</h2>

                <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div>
                        <p className="text-white font-medium">Plan Profesional</p>
                        <p className="text-sm text-gray-400">
                            Estado: <span className="text-green-400">Activo</span>
                        </p>
                    </div>
                    <Link
                        href="/pricing"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                    >
                        Cambiar Plan
                    </Link>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-red-500/20">
                <h2 className="text-xl font-semibold text-white mb-4">Zona de Peligro</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Cerrar Sesión</p>
                            <p className="text-gray-400 text-sm">Salir de tu cuenta en este dispositivo</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:border-gray-500 hover:text-white transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div>
                            <p className="text-white font-medium">Eliminar Cuenta</p>
                            <p className="text-gray-400 text-sm">Esto eliminará permanentemente todos tus datos</p>
                        </div>
                        <button className="px-4 py-2 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
