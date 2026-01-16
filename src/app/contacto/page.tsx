'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In production, send to actual API
        console.log('Contact form submitted:', formData);
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="py-6 px-6 border-b border-gray-800">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-white">
                        📸 PhotoPro
                    </Link>
                    <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                        Iniciar Sesión
                    </Link>
                </div>
            </header>

            <main className="max-w-2xl mx-auto py-16 px-6">
                <h1 className="text-4xl font-bold text-white mb-4 text-center">Contáctanos</h1>
                <p className="text-gray-400 text-center mb-12">
                    ¿Tienes preguntas? Estamos aquí para ayudarte.
                </p>

                {submitted ? (
                    <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-8 text-center">
                        <p className="text-4xl mb-4">✅</p>
                        <h2 className="text-xl font-bold text-white mb-2">¡Mensaje Enviado!</h2>
                        <p className="text-gray-400">
                            Gracias por contactarnos. Te responderemos pronto.
                        </p>
                        <Link href="/" className="inline-block mt-6 text-purple-400 hover:underline">
                            Volver al inicio
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Nombre *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Asunto *</label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                >
                                    <option value="">Selecciona un tema</option>
                                    <option value="ventas">Consulta de ventas</option>
                                    <option value="soporte">Soporte técnico</option>
                                    <option value="facturacion">Facturación</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Mensaje *</label>
                                <textarea
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                    rows={5}
                                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                        >
                            Enviar Mensaje
                        </button>
                    </form>
                )}

                {/* Contact Info */}
                <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-2xl mb-2">📧</p>
                        <p className="text-white font-medium">Email</p>
                        <p className="text-gray-400 text-sm">soporte@photopro.com</p>
                    </div>
                    <div>
                        <p className="text-2xl mb-2">💬</p>
                        <p className="text-white font-medium">Chat</p>
                        <p className="text-gray-400 text-sm">Lun-Vie, 9am-6pm</p>
                    </div>
                    <div>
                        <p className="text-2xl mb-2">📍</p>
                        <p className="text-white font-medium">Ubicación</p>
                        <p className="text-gray-400 text-sm">Ciudad de México</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
