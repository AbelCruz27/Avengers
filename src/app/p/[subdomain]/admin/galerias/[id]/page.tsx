'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Photo {
    id: string;
    url: string;
    filename: string;
    size: number;
    order: number;
}

interface Gallery {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    password: string | null;
    isPublic: boolean;
    photos: Photo[];
}

interface GalleryDetailPageProps {
    params: Promise<{ subdomain: string; id: string }>;
}

export default function GalleryDetailPage({ params }: GalleryDetailPageProps) {
    const { token } = useAuth();
    const [subdomain, setSubdomain] = useState('');
    const [galleryId, setGalleryId] = useState('');
    const [gallery, setGallery] = useState<Gallery | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        params.then(p => {
            setSubdomain(p.subdomain);
            setGalleryId(p.id);
        });
    }, [params]);

    const fetchGallery = useCallback(async () => {
        if (!token || !galleryId) return;
        try {
            const res = await fetch(`/api/admin/galleries/${galleryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setGallery(data.gallery);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [token, galleryId]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !token) return;

        setUploading(true);
        const formData = new FormData();

        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        try {
            const res = await fetch(`/api/admin/galleries/${galleryId}/photos`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (res.ok) {
                fetchGallery(); // Refresh gallery
            } else {
                const data = await res.json();
                alert(data.error || 'Error al subir fotos');
            }
        } catch (e) {
            alert('Error de conexión');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleUpload(e.dataTransfer.files);
    };

    const handleDeletePhoto = async (photoId: string) => {
        if (!confirm('¿Eliminar esta foto?')) return;

        try {
            const res = await fetch(`/api/admin/galleries/${galleryId}/photos?photoId=${photoId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                fetchGallery();
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!gallery) {
        return <div className="text-red-400">Galería no encontrada</div>;
    }

    return (
        <div>
            <Link
                href={`/p/${subdomain}/admin/galerias`}
                className="text-gray-400 hover:text-white text-sm mb-4 inline-block"
            >
                ← Volver a galerías
            </Link>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">{gallery.title}</h1>
                    <p className="text-gray-400 mt-1">
                        <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">/g/{gallery.slug}</span>
                        {gallery.password && <span className="ml-2">🔒</span>}
                        {gallery.isPublic && <span className="ml-2 text-green-400">Público</span>}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/p/${subdomain}/g/${gallery.slug}`}
                        target="_blank"
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                        👁️ Ver como cliente
                    </Link>
                </div>
            </div>

            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
            >
                {uploading ? (
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                        <span className="text-gray-400">Subiendo fotos...</span>
                    </div>
                ) : (
                    <>
                        <p className="text-4xl mb-2">📤</p>
                        <p className="text-gray-300 mb-2">Arrastra fotos aquí o</p>
                        <label className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition-colors">
                            Seleccionar archivos
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => handleUpload(e.target.files)}
                                className="hidden"
                            />
                        </label>
                    </>
                )}
            </div>

            {/* Photos Grid */}
            {gallery.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {gallery.photos.map((photo) => (
                        <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800">
                            <img
                                src={photo.url}
                                alt={photo.filename}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-4xl mb-2">📷</p>
                    <p>No hay fotos en esta galería. ¡Sube algunas!</p>
                </div>
            )}
        </div>
    );
}
