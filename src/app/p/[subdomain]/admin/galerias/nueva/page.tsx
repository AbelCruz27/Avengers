'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface NuevaGaleriaPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function NuevaGaleriaPage({ params }: NuevaGaleriaPageProps) {
    const { token } = useAuth();
    const router = useRouter();
    const [subdomain, setSubdomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        description: '',
        password: '',
        isPublic: false,
    });

    params.then(p => setSubdomain(p.subdomain));

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleTitleChange = (title: string) => {
        setFormData({
            ...formData,
            title,
            slug: generateSlug(title),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/galleries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/p/${subdomain}/admin/galerias/${data.gallery.id}`);
            } else {
                setError(data.error || 'Error al crear galería');
            }
        } catch (e) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <Link
                href={`/p/${subdomain}/admin/galerias`}
                className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
            >
                ← Volver a galerías
            </Link>

            <h1 className="text-3xl font-bold text-white mb-2">Nueva Galería</h1>
            <p className="text-gray-400 mb-8">Crea una galería para compartir fotos con tu cliente</p>

            {error && (
                <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Título de la Galería *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            required
                            placeholder="Ej: Boda Ana y Carlos"
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            URL Slug *
                        </label>
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-2">/g/</span>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                required
                                pattern="[a-z0-9-]+"
                                placeholder="boda-ana-carlos"
                                className="flex-1 bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-1">Solo letras minúsculas, números y guiones</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Descripción (opcional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            placeholder="Mensaje para el cliente..."
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Privacidad</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Contraseña (opcional)
                        </label>
                        <input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Dejar vacío para sin contraseña"
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-300">Galería pública (visible sin contraseña)</span>
                    </label>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Galería'}
                    </button>
                </div>
            </form>
        </div>
    );
}
