'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RecuperarPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // In production, call actual password reset API
        // await fetch('/api/auth/forgot-password', { ... });

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link href="/" className="text-3xl font-bold text-white inline-block mb-4">
                        📸 PhotoPro
                    </Link>
                </div>

                <div className="bg-gray-800/50 backdrop-blur rounded-2xl p-8 border border-gray-700/50">
                    {submitted ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✉️</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">¡Revisa tu correo!</h2>
                            <p className="text-gray-400 mb-6">
                                Si existe una cuenta con el email <strong className="text-white">{email}</strong>,
                                recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <Link
                                href="/login"
                                className="block w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all text-center"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold text-white mb-2 text-center">
                                Recuperar Contraseña
                            </h1>
                            <p className="text-gray-400 text-center mb-6">
                                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="tu@email.com"
                                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Enlace'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link href="/login" className="text-gray-400 hover:text-white text-sm">
                                    ← Volver al login
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
