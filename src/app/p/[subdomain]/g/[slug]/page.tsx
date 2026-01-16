'use client';

import { useEffect, useState } from 'react';

interface Photo {
    id: string;
    url: string;
    thumbnailUrl: string;
}

interface GalleryData {
    title: string;
    description: string | null;
    photographerName: string;
    primaryColor: string | null;
    photos: Photo[];
}

interface PublicGalleryPageProps {
    params: Promise<{ subdomain: string; slug: string }>;
}

export default function PublicGalleryPage({ params }: PublicGalleryPageProps) {
    const [subdomain, setSubdomain] = useState('');
    const [slug, setSlug] = useState('');
    const [gallery, setGallery] = useState<GalleryData | null>(null);
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    useEffect(() => {
        params.then(p => {
            setSubdomain(p.subdomain);
            setSlug(p.slug);
        });
    }, [params]);

    const fetchGallery = async (pwd?: string) => {
        if (!subdomain || !slug) return;

        setLoading(true);
        setError('');

        try {
            const url = `/api/galleries/${subdomain}/${slug}${pwd ? `?password=${encodeURIComponent(pwd)}` : ''}`;
            const res = await fetch(url);
            const data = await res.json();

            if (res.status === 410) {
                setError('Esta galería ha expirado');
            } else if (res.status === 404) {
                setError('Galería no encontrada');
            } else if (data.requiresPassword) {
                setRequiresPassword(true);
                setGallery({
                    title: data.gallery.title,
                    photographerName: data.gallery.photographerName,
                    description: null,
                    primaryColor: null,
                    photos: []
                });
            } else {
                setRequiresPassword(false);
                setGallery(data.gallery);
            }
        } catch (e) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subdomain && slug) {
            fetchGallery();
        }
    }, [subdomain, slug]);

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchGallery(password);
    };

    const primaryColor = gallery?.primaryColor || '#8B5CF6';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-5xl mb-4">😕</p>
                    <p className="text-xl text-white">{error}</p>
                </div>
            </div>
        );
    }

    if (requiresPassword) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border border-gray-700/50 max-w-md w-full text-center">
                    <p className="text-4xl mb-4">🔒</p>
                    <h1 className="text-2xl font-bold text-white mb-2">{gallery?.title}</h1>
                    <p className="text-gray-400 mb-6">Esta galería está protegida con contraseña</p>

                    <form onSubmit={handlePasswordSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Ingresa la contraseña"
                            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none mb-4"
                        />
                        <button
                            type="submit"
                            className="w-full py-3 text-white font-semibold rounded-xl transition-all"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Acceder
                        </button>
                    </form>

                    <p className="text-gray-500 text-sm mt-6">Por {gallery?.photographerName}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="py-8 px-6 border-b border-gray-800">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{gallery?.title}</h1>
                    {gallery?.description && (
                        <p className="text-gray-400 max-w-2xl mx-auto">{gallery.description}</p>
                    )}
                    <p className="text-gray-500 text-sm mt-4">Fotografía por {gallery?.photographerName}</p>
                </div>
            </header>

            {/* Gallery Grid */}
            <main className="max-w-7xl mx-auto py-8 px-4">
                {gallery && gallery.photos.length > 0 ? (
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                        {gallery.photos.map((photo, index) => (
                            <div key={photo.id} className="break-inside-avoid">
                                <img
                                    src={photo.url}
                                    alt=""
                                    className="w-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => setLightboxIndex(index)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No hay fotos en esta galería aún</p>
                    </div>
                )}
            </main>

            {/* Lightbox */}
            {lightboxIndex !== null && gallery && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
                        onClick={() => setLightboxIndex(null)}
                    >
                        ✕
                    </button>

                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 p-4"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : gallery.photos.length - 1);
                        }}
                    >
                        ←
                    </button>

                    <img
                        src={gallery.photos[lightboxIndex].url}
                        alt=""
                        className="max-h-[90vh] max-w-[90vw] object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-gray-300 p-4"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightboxIndex(prev => prev !== null && prev < gallery.photos.length - 1 ? prev + 1 : 0);
                        }}
                    >
                        →
                    </button>

                    <div className="absolute bottom-4 text-gray-400 text-sm">
                        {lightboxIndex + 1} / {gallery.photos.length}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="py-6 text-center text-gray-500 text-sm border-t border-gray-800">
                Powered by PhotoPro
            </footer>
        </div>
    );
}
