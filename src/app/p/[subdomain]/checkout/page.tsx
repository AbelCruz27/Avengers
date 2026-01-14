'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionType {
    id: string;
    name: string;
    duration: number;
    price: string;
    depositPercent: number;
}

interface Photographer {
    businessName: string;
    primaryColor: string | null;
}

interface CheckoutPageProps {
    params: Promise<{ subdomain: string }>;
}

export default function CheckoutPage({ params }: CheckoutPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [subdomain, setSubdomain] = useState<string>('');
    const [photographer, setPhotographer] = useState<Photographer | null>(null);
    const [sessionType, setSessionType] = useState<SessionType | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: '',
    });

    const tipoId = searchParams.get('tipo');
    const fecha = searchParams.get('fecha');
    const hora = searchParams.get('hora');

    useEffect(() => {
        params.then(p => setSubdomain(p.subdomain));
    }, [params]);

    useEffect(() => {
        if (!subdomain || !tipoId) return;

        async function fetchData() {
            try {
                const res = await fetch(`/api/photographers/${subdomain}`);
                if (res.ok) {
                    const data = await res.json();
                    setPhotographer(data.photographer);
                    const session = data.sessionTypes.find((s: SessionType) => s.id === tipoId);
                    setSessionType(session || null);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [subdomain, tipoId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subdomain,
                    sessionTypeId: tipoId,
                    date: fecha,
                    startTime: hora,
                    clientName: formData.name,
                    clientEmail: formData.email,
                    clientPhone: formData.phone,
                    notes: formData.notes,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al crear la reserva');
            }

            // Redirect to confirmation
            router.push(`/p/${subdomain}/confirmacion?booking=${data.booking.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al procesar la reserva');
        } finally {
            setSubmitting(false);
        }
    };

    const primaryColor = photographer?.primaryColor || '#8B5CF6';
    const depositAmount = sessionType
        ? (Number(sessionType.price) * sessionType.depositPercent / 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (!sessionType || !fecha || !hora) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">Información de reserva incompleta</p>
                    <Link href={`/p/${subdomain}/reservar`} className="text-purple-400 hover:underline">
                        Volver al calendario
                    </Link>
                </div>
            </div>
        );
    }

    const formattedDate = new Date(fecha).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800/50 backdrop-blur border-b border-gray-700/50 py-4 px-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href={`/p/${subdomain}/reservar`} className="text-white font-semibold hover:text-gray-300">
                        ← Volver
                    </Link>
                    <h1 className="text-lg font-medium text-white">Confirmar Reserva</h1>
                </div>
            </header>

            <main className="max-w-4xl mx-auto py-8 px-6">
                <div className="grid md:grid-cols-2 gap-8">

                    {/* Form */}
                    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50">
                        <h2 className="text-xl font-semibold text-white mb-6">Tus datos</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="+52 55 1234 5678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Notas adicionales
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="¿Algo que debamos saber?"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-3 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                                style={{ backgroundColor: primaryColor }}
                            >
                                {submitting ? 'Procesando...' : `Pagar anticipo $${depositAmount.toLocaleString()} MXN`}
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                Por ahora el pago es simulado. Stripe se configurará en una fase posterior.
                            </p>
                        </form>
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 h-fit">
                        <h3 className="text-lg font-semibold text-white mb-4">Resumen de reserva</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Sesión</span>
                                <span className="text-white font-medium">{sessionType.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Duración</span>
                                <span className="text-white">{sessionType.duration} minutos</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Fecha</span>
                                <span className="text-white capitalize">{formattedDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Hora</span>
                                <span className="text-white">{hora}</span>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Total</span>
                                <span className="text-white">${Number(sessionType.price).toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between text-lg font-semibold">
                                <span className="text-gray-300">Anticipo a pagar</span>
                                <span className="text-white">${depositAmount.toLocaleString()} MXN</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Resto a pagar el día</span>
                                <span className="text-gray-400">
                                    ${(Number(sessionType.price) - depositAmount).toLocaleString()} MXN
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
