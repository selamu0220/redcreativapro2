export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">Red Creativa Pro</h1>
        <p className="text-xl mb-8">Plataforma de Marketing con IA</p>
        <div className="space-x-4">
          <a href="/auth" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Iniciar Sesión
          </a>
          <a href="/dashboard" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Dashboard
          </a>
          <a href="/test-simple" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Test Page
          </a>
        </div>
      </div>
    </div>
  )
}