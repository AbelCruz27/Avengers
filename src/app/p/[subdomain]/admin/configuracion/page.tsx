'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface ConfiguracionPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function ConfiguracionPage({ params }: ConfiguracionPageProps) {
    const { token } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'branding' | 'business' | 'notifications'>('branding');
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
        // Business settings
        defaultDepositPercent: 50,
        sessionBuffer: 15,
        maxAdvanceBookingDays: 60,
        // Notification settings
        emailNotifications: true,
        smsNotifications: false,
        bookingConfirmationEmail: true,
        reminderEmail: true,
    });

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        if (!token) return;
        async function fetchConfig() {
            try {
                const res = await fetch('/api/admin/configuration', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setFormData(prev => ({
                        ...prev,
                        ...data.config,
                        bio: data.config.bio || '',
                        phone: data.config.phone || '',
                        avatarUrl: data.config.avatarUrl || '',
                        coverUrl: data.config.coverUrl || '',
                        logoUrl: data.config.logoUrl || '',
                    }));
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

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    const tabs = [
        { id: 'branding', label: 'Marca', icon: '🎨' },
        { id: 'business', label: 'Negocio', icon: '💼' },
        { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
    ];

    return (
        <div className="max-w-3xl">
            <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
            <p className="text-gray-400 mb-8">Personaliza tu negocio y preferencias</p>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-800 text-gray-400 hover:text-white'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {activeTab === 'branding' && (
                    <>
                        {/* Preview Card */}
                        <div
                            className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                            style={{ borderTopColor: formData.primaryColor, borderTopWidth: '4px' }}
                        >
                            <p className="text-gray-400 text-sm mb-4">Vista previa de tu marca</p>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                                    style={{ backgroundColor: formData.primaryColor }}
                                >
                                    {formData.avatarUrl ? (
                                        <img src={formData.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        formData.businessName?.[0]?.toUpperCase() || '?'
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{formData.businessName || 'Tu Negocio'}</h3>
                                    <p className="text-gray-400 text-sm">{formData.subdomain}.photopro.com</p>
                                </div>
                            </div>
                        </div>

                        {/* Branding Fields */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Información de Marca</h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Negocio *</label>
                                <input
                                    type="text"
                                    value={formData.businessName}
                                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                    required
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Biografía / Descripción</label>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                    rows={4}
                                    placeholder="Cuéntale a tus clientes sobre ti y tu trabajo..."
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Color Principal</label>
                                    <div className="flex gap-3 items-center">
                                        <input
                                            type="color"
                                            value={formData.primaryColor}
                                            onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="h-10 w-16 rounded bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.primaryColor}
                                            onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                            className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Teléfono de Contacto</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+52 555 123 4567"
                                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                            <h2 className="text-xl font-semibold text-white mb-4">Imágenes</h2>
                            <p className="text-sm text-gray-500 mb-4">Ingresa URLs de tus imágenes. Pronto podrás subirlas directamente.</p>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">URL de Avatar/Logo</label>
                                <input
                                    type="url"
                                    value={formData.avatarUrl}
                                    onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">URL de Imagen de Portada</label>
                                <input
                                    type="url"
                                    value={formData.coverUrl}
                                    onChange={e => setFormData({ ...formData, coverUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'business' && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                        <h2 className="text-xl font-semibold text-white mb-4">Configuración de Negocio</h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Anticipo predeterminado (%)
                                </label>
                                <input
                                    type="number"
                                    value={formData.defaultDepositPercent}
                                    onChange={e => setFormData({ ...formData, defaultDepositPercent: parseInt(e.target.value) })}
                                    min={0}
                                    max={100}
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Porcentaje que se cobra al reservar</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Tiempo entre sesiones (min)
                                </label>
                                <input
                                    type="number"
                                    value={formData.sessionBuffer}
                                    onChange={e => setFormData({ ...formData, sessionBuffer: parseInt(e.target.value) })}
                                    min={0}
                                    step={5}
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Descanso automático entre sesiones</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">
                                    Días máximos para reservar
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxAdvanceBookingDays}
                                    onChange={e => setFormData({ ...formData, maxAdvanceBookingDays: parseInt(e.target.value) })}
                                    min={7}
                                    max={365}
                                    className="w-full bg-gray-700 rounded-lg px-4 py-2 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Qué tan adelante pueden reservar los clientes</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-700">
                            <h3 className="font-medium text-white mb-3">Enlaces Rápidos</h3>
                            <div className="flex flex-wrap gap-3">
                                <Link href="tipos-sesion" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                                    📷 Tipos de Sesión
                                </Link>
                                <Link href="disponibilidad" className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm">
                                    ⏰ Disponibilidad
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                        <h2 className="text-xl font-semibold text-white mb-4">Notificaciones</h2>

                        <div className="space-y-3">
                            {[
                                { key: 'emailNotifications', label: 'Notificaciones por email', desc: 'Recibe alertas de nuevas reservas' },
                                { key: 'bookingConfirmationEmail', label: 'Email de confirmación', desc: 'Envía confirmación automática a clientes' },
                                { key: 'reminderEmail', label: 'Recordatorios', desc: 'Envía recordatorio 24h antes de la sesión' },
                            ].map(item => (
                                <label key={item.key} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700/70 transition-colors">
                                    <div>
                                        <p className="text-white font-medium">{item.label}</p>
                                        <p className="text-gray-400 text-sm">{item.desc}</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={(formData as any)[item.key]}
                                        onChange={e => setFormData({ ...formData, [item.key]: e.target.checked })}
                                        className="w-5 h-5 rounded bg-gray-600 border-gray-500 text-purple-600 focus:ring-purple-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
}
