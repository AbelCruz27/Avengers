import Link from 'next/link';

const plans = [
    {
        name: 'Básico',
        price: 299,
        period: 'mes',
        description: 'Perfecto para empezar',
        features: [
            '1 Subdominio personalizado',
            'Hasta 50 sesiones/mes',
            '5 GB almacenamiento',
            'Calendario de reservas',
            'Pagos en línea',
            'Soporte por email',
        ],
        cta: 'Comenzar Gratis',
        popular: false,
    },
    {
        name: 'Profesional',
        price: 599,
        period: 'mes',
        description: 'Para fotógrafos establecidos',
        features: [
            'Todo del plan Básico',
            'Sesiones ilimitadas',
            '50 GB almacenamiento',
            'Galerías para clientes',
            'Contratos digitales',
            'Marca personalizada',
            'Soporte prioritario',
        ],
        cta: 'Empezar Ahora',
        popular: true,
    },
    {
        name: 'Estudio',
        price: 1299,
        period: 'mes',
        description: 'Para equipos y estudios',
        features: [
            'Todo del plan Profesional',
            'Múltiples usuarios',
            '200 GB almacenamiento',
            'API personalizada',
            'Reportes avanzados',
            'Onboarding dedicado',
            'Soporte 24/7',
        ],
        cta: 'Contactar Ventas',
        popular: false,
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="py-6 px-6 border-b border-gray-800">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold text-white">
                        📸 PhotoPro
                    </Link>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/register"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            Registrarse
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="py-16 px-6 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    Planes y Precios
                </h1>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Elige el plan perfecto para tu negocio de fotografía
                </p>
            </section>

            {/* Pricing Cards */}
            <section className="py-8 px-6">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-gray-800/50 backdrop-blur rounded-2xl p-8 border transition-all ${plan.popular
                                    ? 'border-purple-500 scale-105 shadow-xl shadow-purple-500/20'
                                    : 'border-gray-700/50 hover:border-gray-600'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                                    Más Popular
                                </div>
                            )}

                            <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{plan.description}</p>

                            <div className="mb-6">
                                <span className="text-4xl font-bold text-white">${plan.price}</span>
                                <span className="text-gray-400">/{plan.period}</span>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-green-400 mt-0.5">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="/register"
                                className={`block w-full py-3 text-center font-semibold rounded-xl transition-all ${plan.popular
                                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                                        : 'bg-gray-700 text-white hover:bg-gray-600'
                                    }`}
                            >
                                {plan.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-white text-center mb-8">
                        Preguntas Frecuentes
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: '¿Puedo cambiar de plan después?',
                                a: 'Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican al siguiente ciclo de facturación.',
                            },
                            {
                                q: '¿Hay período de prueba?',
                                a: 'Ofrecemos 14 días de prueba gratis en todos los planes, sin necesidad de tarjeta de crédito.',
                            },
                            {
                                q: '¿Cómo funcionan los pagos?',
                                a: 'Aceptamos tarjetas de crédito/débito y transferencias bancarias. La facturación es mensual o anual (con 20% de descuento).',
                            },
                            {
                                q: '¿Puedo cancelar cuando quiera?',
                                a: 'Absolutamente. No hay contratos de permanencia. Puedes cancelar tu suscripción en cualquier momento.',
                            },
                        ].map((faq) => (
                            <details
                                key={faq.q}
                                className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-4 group"
                            >
                                <summary className="font-medium text-white cursor-pointer list-none flex items-center justify-between">
                                    {faq.q}
                                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-400 mt-3">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-gray-800 text-center text-gray-500">
                © 2026 PhotoPro. Todos los derechos reservados.
            </footer>
        </div>
    );
}
