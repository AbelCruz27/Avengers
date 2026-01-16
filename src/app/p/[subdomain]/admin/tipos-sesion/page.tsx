'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SessionType {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    depositPercent: number;
    color: string | null;
    isActive: boolean;
}

export default function TiposSesionPage() {
    const { token } = useAuth();
    const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 60,
        price: 0,
        depositPercent: 50,
        color: '#8B5CF6',
    });

    const fetchSessionTypes = async () => {
        if (!token) return;
        try {
            const res = await fetch('/api/admin/session-types', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSessionTypes(data.sessionTypes);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessionTypes();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('/api/admin/session-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({
                    name: '',
                    description: '',
                    duration: 60,
                    price: 0,
                    depositPercent: 50,
                    color: '#8B5CF6',
                });
                fetchSessionTypes();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Tipos de Sesión</h1>
                    <p className="text-gray-400 mt-1">Configura los servicios que ofreces</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                >
                    {showForm ? 'Cancelar' : '+ Nuevo Tipo'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4">Nuevo Tipo de Sesión</h2>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Ej: Sesión de Retrato"
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Duración (min) *</label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                required
                                min={15}
                                step={15}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Precio (MXN) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                required
                                min={0}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Anticipo (%)</label>
                            <input
                                type="number"
                                value={formData.depositPercent}
                                onChange={(e) => setFormData({ ...formData, depositPercent: parseInt(e.target.value) })}
                                min={0}
                                max={100}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={2}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                            <input
                                type="color"
                                value={formData.color}
                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                className="w-20 h-10 rounded bg-transparent cursor-pointer"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                                {saving ? 'Guardando...' : 'Crear Tipo'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {sessionTypes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessionTypes.map((st) => (
                        <div
                            key={st.id}
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${st.color}33` }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: st.color || '#8B5CF6' }}
                                    />
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${st.isActive
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-gray-500/20 text-gray-400'
                                        }`}
                                >
                                    {st.isActive ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>

                            <h3 className="text-lg font-semibold text-white mb-1">{st.name}</h3>
                            {st.description && (
                                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{st.description}</p>
                            )}

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Duración</span>
                                    <span className="text-white">{st.duration} min</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Precio</span>
                                    <span className="text-white font-medium">${st.price.toLocaleString()} MXN</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Anticipo</span>
                                    <span className="text-white">{st.depositPercent}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700/50">
                    <p className="text-5xl mb-4">📷</p>
                    <h3 className="text-xl font-semibold text-white mb-2">Sin tipos de sesión</h3>
                    <p className="text-gray-400">
                        Crea tu primer tipo de sesión para que tus clientes puedan reservar.
                    </p>
                </div>
            )}
        </div>
    );
}
