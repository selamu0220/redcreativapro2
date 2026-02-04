'use client'

export default function DebugMinimalPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Página de Depuración Mínima</h1>
      
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Estado del Sistema</h2>
        <div className="space-y-2">
          <p className="text-green-400">✅ Página cargada correctamente</p>
          <p className="text-green-400">✅ Sin errores de webpack</p>
          <p className="text-green-400">✅ Sin dependencias circulares</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Pruebas de Funcionalidad</h2>
        <div className="space-y-4">
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={() => alert('Botón funcionando correctamente')}
          >
            Probar Botón
          </button>
          
          <div className="text-zinc-300">
            <p>Esta página está completamente aislada de componentes complejos.</p>
            <p>Si esta página funciona, el problema está en los componentes importados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
