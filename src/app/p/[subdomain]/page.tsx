import { notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/db';

interface PhotographerPageProps {
    params: Promise<{ subdomain: string }>;
}

async function getPhotographer(subdomain: string) {
    const photographer = await prisma.photographer.findUnique({
        where: { subdomain },
        include: {
            user: {
                select: { email: true },
            },
            sessionTypes: {
                where: { isActive: true },
                orderBy: { price: 'asc' },
            },
        },
    });
    return photographer;
}

export default async function PhotographerLanding({ params }: PhotographerPageProps) {
    const { subdomain } = await params;
    const photographer = await getPhotographer(subdomain);

    if (!photographer || !photographer.isActive) {
        notFound();
    }

    const primaryColor = photographer.primaryColor || '#8B5CF6';

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Hero Section */}
            <header
                className="relative h-[60vh] flex items-center justify-center"
                style={{
                    backgroundImage: photographer.coverUrl
                        ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${photographer.coverUrl})`
                        : `linear-gradient(135deg, ${primaryColor}33, #1f2937)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="text-center px-6">
                    {/* Logo/Avatar */}
                    {photographer.logoUrl || photographer.avatarUrl ? (
                        <img
                            src={photographer.logoUrl || photographer.avatarUrl || ''}
                            alt={photographer.businessName}
                            className="w-24 h-24 rounded-full mx-auto mb-6 border-4 border-white/20 object-cover"
                        />
                    ) : (
                        <div
                            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl"
                            style={{ backgroundColor: primaryColor }}
                        >
                            📸
                        </div>
                    )}

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                        {photographer.businessName}
                    </h1>

                    {photographer.bio && (
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                            {photographer.bio}
                        </p>
                    )}

                    <Link
                        href={`/p/${subdomain}/reservar`}
                        className="inline-block px-8 py-4 text-lg font-semibold text-white rounded-xl transition-all transform hover:scale-105 shadow-xl"
                        style={{ backgroundColor: primaryColor }}
                    >
                        📅 Reservar Sesión
                    </Link>
                </div>
            </header>

            {/* Session Types */}
            {photographer.sessionTypes.length > 0 && (
                <section className="py-16 px-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center mb-12">
                            Tipos de Sesión
                        </h2>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {photographer.sessionTypes.map((session) => (
                                <div
                                    key={session.id}
                                    className="bg-gray-800/50 backdrop-blur rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all"
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
                                        style={{ backgroundColor: `${session.color}33` }}
                                    >
                                        📷
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {session.name}
                                    </h3>
                                    {session.description && (
                                        <p className="text-gray-400 text-sm mb-4">
                                            {session.description}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-white">
                                                ${Number(session.price).toLocaleString()}
                                            </span>
                                            <span className="text-gray-400 text-sm ml-1">MXN</span>
                                        </div>
                                        <span className="text-gray-400 text-sm">
                                            {session.duration} min
                                        </span>
                                    </div>
                                    <Link
                                        href={`/p/${subdomain}/reservar?tipo=${session.id}`}
                                        className="mt-4 block w-full py-2 text-center rounded-lg transition-all"
                                        style={{
                                            backgroundColor: `${primaryColor}22`,
                                            color: primaryColor,
                                        }}
                                    >
                                        Reservar
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Contact Section */}
            <section className="py-16 px-6 border-t border-gray-800">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">
                        ¿Tienes preguntas?
                    </h2>
                    <p className="text-gray-400 mb-6">
                        Contáctame directamente para resolver cualquier duda
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {photographer.phone && (
                            <a
                                href={`tel:${photographer.phone}`}
                                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                            >
                                📞 {photographer.phone}
                            </a>
                        )}
                        <a
                            href={`mailto:${photographer.user?.email || ''}`}
                            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all"
                        >
                            ✉️ Enviar Email
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>© 2026 {photographer.businessName}. Powered by PhotoPro</p>
            </footer>
        </div>
    );
}
