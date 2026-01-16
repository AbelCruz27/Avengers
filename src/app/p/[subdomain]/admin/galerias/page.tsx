'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Gallery {
    id: string;
    title: string;
    slug: string;
    photoCount: number;
    isPublic: boolean;
    hasPassword: boolean;
    clientName: string | null;
    createdAt: string;
}

interface GaleriasPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function GaleriasPage({ params }: GaleriasPageProps) {
    const { token } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        if (!token) return;
        async function fetchGalleries() {
            try {
                const res = await fetch('/api/admin/galleries', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setGalleries(data.galleries);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        fetchGalleries();
    }, [token]);

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
                    <h1 className="text-3xl font-bold text-white">Galerías</h1>
                    <p className="text-gray-400 mt-1">Gestiona las galerías de fotos para tus clientes</p>
                </div>
                <Link
                    href={`/p/${subdomain}/admin/galerias/nueva`}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                >
                    + Nueva Galería
                </Link>
            </div>

            {galleries.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleries.map((gallery) => (
                        <Link
                            key={gallery.id}
                            href={`/p/${subdomain}/admin/galerias/${gallery.id}`}
                            className="bg-gray-800/50 backdrop-blur rounded-xl border border-gray-700/50 overflow-hidden hover:border-purple-500/50 transition-all group"
                        >
                            {/* Placeholder thumbnail */}
                            <div className="h-40 bg-gradient-to-br from-purple-900/30 to-gray-800 flex items-center justify-center">
                                <span className="text-5xl opacity-50">🖼️</span>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                                    {gallery.title}
                                </h3>

                                <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                    <span>📷 {gallery.photoCount} fotos</span>
                                    {gallery.hasPassword && <span>🔒</span>}
                                    {gallery.isPublic && <span className="text-green-400">Público</span>}
                                </div>

                                {gallery.clientName && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        Cliente: {gallery.clientName}
                                    </p>
                                )}

                                <p className="text-xs text-gray-600 mt-2">
                                    {new Date(gallery.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-800/50 rounded-xl p-12 text-center border border-gray-700/50">
                    <p className="text-5xl mb-4">🖼️</p>
                    <h3 className="text-xl font-semibold text-white mb-2">Sin galerías</h3>
                    <p className="text-gray-400 mb-6">Crea tu primera galería para compartir fotos con tus clientes</p>
                    <Link
                        href={`/p/${subdomain}/admin/galerias/nueva`}
                        className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                    >
                        Crear Galería
                    </Link>
                </div>
            )}
        </div>
    );
}
