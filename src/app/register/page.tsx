'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSubdomainCheck } from '@/hooks/useSubdomainCheck';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        subdomain: '',
        businessName: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { result: subdomainResult, isChecking: isCheckingSubdomain } = useSubdomainCheck(formData.subdomain);

    // Redirect if already authenticated
    React.useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'subdomain' ? value.toLowerCase().replace(/[^a-z0-9-]/g, '') : value,
        }));
        setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (subdomainResult && !subdomainResult.available) {
            setError(subdomainResult.error || 'El subdominio no está disponible');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: formData.email,
                password: formData.password,
                subdomain: formData.subdomain,
                businessName: formData.businessName,
            });
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al registrarse');
        } finally {
            setIsSubmitting(false);
        }
    };

    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'tuapp.com';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        📸 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">PhotoPro</span>
                    </h1>
                    <p className="text-gray-400">Crea tu plataforma de fotografía profesional</p>
                </div>

                {/* Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                    <h2 className="text-2xl font-semibold text-white mb-6">Crear cuenta</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="tu@email.com"
                            />
                        </div>

                        {/* Business Name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-gray-300 mb-2">
                                Nombre de tu negocio
                            </label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Carlos Photography"
                            />
                        </div>

                        {/* Subdomain */}
                        <div>
                            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-300 mb-2">
                                Tu subdominio
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="subdomain"
                                    name="subdomain"
                                    value={formData.subdomain}
                                    onChange={handleChange}
                                    required
                                    minLength={3}
                                    maxLength={30}
                                    className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    placeholder="carlos"
                                />
                                <span className="px-4 py-3 bg-gray-600 border border-gray-600 rounded-r-lg text-gray-400 text-sm flex items-center">
                                    .{appDomain}
                                </span>
                            </div>
                            {/* Subdomain status */}
                            {formData.subdomain.length >= 3 && (
                                <div className="mt-2 text-sm">
                                    {isCheckingSubdomain ? (
                                        <span className="text-gray-400">Verificando...</span>
                                    ) : subdomainResult?.available ? (
                                        <span className="text-green-400">✓ Disponible</span>
                                    ) : subdomainResult?.error ? (
                                        <span className="text-red-400">✗ {subdomainResult.error}</span>
                                    ) : null}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                                Confirmar contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                placeholder="Repite tu contraseña"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting || !!(subdomainResult && !subdomainResult.available)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-gray-400 text-sm">
                        ¿Ya tienes cuenta?{' '}
                        <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
                            Inicia sesión
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
