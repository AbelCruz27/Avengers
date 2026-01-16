'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <html>
            <body className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-6xl font-bold text-red-500 opacity-70 mb-4">Error</h1>
                    <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
                    <p className="text-gray-400 mb-8 max-w-md mx-auto">
                        Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={reset}
                            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                        >
                            Reintentar
                        </button>
                        <Link
                            href="/"
                            className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all"
                        >
                            Ir al inicio
                        </Link>
                    </div>
                </div>
            </body>
        </html>
    );
}
