'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
    email: string;
    role: string;
    createdAt: string;
    photographer: {
        businessName: string;
        subdomain: string;
        isActive: boolean;
        createdAt: string;
    };
}

export default function PerfilPage() {
    const { token, logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) return <div className="text-white">Cargando...</div>;
    if (!profile) return <div className="text-red-400">Error al cargar perfil</div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">Mi Perfil</h1>
            <p className="text-gray-400 mb-8">Información de tu cuenta de usuario</p>

            {/* Account Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Datos de Cuenta</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span className="text-gray-400 text-sm">Correo Electrónico</span>
                            <p className="text-white font-medium">{profile.email}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Rol</span>
                            <p className="text-white capitalize">{profile.role.toLowerCase()}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">Miembro desde</span>
                            <p className="text-white">{new Date(profile.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <span className="text-gray-400 text-sm">ID de Usuario</span>
                            <p className="text-gray-500 font-mono text-xs mt-1">******</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">Plan y Suscripción</h2>

                <div className="flex items-center justify-between p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <div>
                        <p className="text-white font-medium">Plan Profesional</p>
                        <p className="text-sm text-gray-400">Estado: <span className="text-green-400">Activo</span></p>
                    </div>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors">
                        Gestionar Suscripción
                    </button>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                    Tu subdominio <strong>{profile.photographer.subdomain}.photopro.com</strong> está activo.
                </p>
            </div>

            <div className="border-t border-gray-700 pt-6">
                <button
                    onClick={logout}
                    className="px-6 py-3 border border-red-500/50 text-red-400 font-semibold rounded-xl hover:bg-red-500/10 transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
}
