import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-6">
            <div className="text-center">
                <h1 className="text-9xl font-bold text-purple-600 opacity-50">404</h1>
                <h2 className="text-3xl font-bold text-white mt-4 mb-2">Página no encontrada</h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o fue movida.
                </p>
                <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all"
                >
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
