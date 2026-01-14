'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfiguracionPage() {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [formData, setFormData] = useState({
        businessName: '',
        bio: '',
        phone: '',
        primaryColor: '#8B5CF6',
        avatarUrl: '',
        coverUrl: '',
        logoUrl: '',
        subdomain: '',
    });

    useEffect(() => {
        if (!token) return;
        async function fetchConfig() {
            try {
                const res = await fetch('/api/admin/configuration', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        ...data.config,
                        bio: data.config.bio || '',
                        phone: data.config.phone || '',
                        avatarUrl: data.config.avatarUrl || '',
                        coverUrl: data.config.coverUrl || '',
                        logoUrl: data.config.logoUrl || '',
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/admin/configuration', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
            } else {
                setMessage({ type: 'error', text: 'Error al guardar los cambios' });
            }
        } catch (e) {
            setMessage({ type: 'error', text: 'Error de conexión' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-white">Cargando...</div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
            <p className="text-gray-400 mb-8">Personaliza la apariencia y datos de tu negocio</p>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Branding Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Marca</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Subdominio (No editable)</label>
                            <input
                                type="text"
                                value={formData.subdomain + '.photopro.com'}
                                disabled
                                className="w-full bg-gray-900/50 rounded-lg px-4 py-2 text-gray-400 border border-gray-700 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Color Principal</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    value={formData.primaryColor}
                                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="h-10 w-20 rounded bg-transparent cursor-pointer"
                                />
                                <span className="text-gray-400">{formData.primaryColor}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Información</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Biografía</label>
                            <textarea
                                value={formData.bio}
                                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                rows={4}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono de Contacto</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-4">Imágenes (URLs)</h2>
                    <p className="text-sm text-gray-500 mb-4">En la Fase 4 implementaremos subida de archivos directa.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL Avatar</label>
                            <input
                                type="text"
                                value={formData.avatarUrl}
                                onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">URL Portada</label>
                            <input
                                type="text"
                                value={formData.coverUrl}
                                onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
