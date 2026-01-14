import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">
            📸 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">PhotoPro</span>
          </h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu plataforma
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              todo-en-uno
            </span>
            <br />
            para fotografía
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Agenda sesiones, cobra por adelantado, gestiona clientes y entrega galerías
            profesionales. Todo desde tu propio subdominio.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/25"
            >
              Crear mi sitio gratis
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-gray-800/50 backdrop-blur text-white text-lg font-semibold rounded-xl border border-gray-600 hover:bg-gray-700/50 transition-all"
            >
              Ver características
            </a>
          </div>

          {/* Example subdomain */}
          <div className="mt-12 p-4 bg-gray-800/30 backdrop-blur rounded-xl inline-block">
            <p className="text-gray-400 text-sm mb-1">Tu sitio será algo como:</p>
            <p className="text-purple-400 font-mono text-lg">
              tunombre.photopro.com
            </p>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Todo lo que necesitas
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Agenda inteligente
              </h3>
              <p className="text-gray-400">
                Tus clientes reservan directamente en tu calendario. Sin intermediarios, sin llamadas.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
              <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">💳</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Cobro obligatorio
              </h3>
              <p className="text-gray-400">
                Recibe el pago al momento de la reserva. Olvídate de los no-shows y las excusas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800/30 backdrop-blur rounded-2xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all group">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl">🖼️</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Galerías privadas
              </h3>
              <p className="text-gray-400">
                Entrega tus fotos en galerías temporales y seguras. Tus clientes descargan fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-6">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          © 2026 PhotoPro. Hecho con 💜 para fotógrafos.
        </div>
      </footer>
    </div>
  );
}
