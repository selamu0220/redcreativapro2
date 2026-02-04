'use client';

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useOptimizedAuth } from '../hooks/useOptimizedAuth';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FeatureGate } from '@/components/feature-gate';


interface ImportResult {
  message: string;
  importedCount: number;
  errors?: string[];
}

export default function ImportExportPage() {
  const { user } = useAuth();
  const { post, get } = useAuthenticatedFetch();
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'contacts' | 'templates'>('contacts');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !user?.email) {
      alert('Por favor selecciona un archivo y asegúrate de estar autenticado');
      return;
    }

    // Validar que el archivo sea CSV
    if (!(selectedFile.name || '').toLowerCase().endsWith('.csv')) {
      alert('Error: Por favor selecciona un archivo CSV válido (.csv)');
      return;
    }

    // Validar el contenido del archivo
    try {
      const fileContent = await selectedFile.text();
      if (!fileContent.trim()) {
        alert('Error: El archivo está vacío');
        return;
      }

      // Verificar que tenga estructura de CSV
      const lines = fileContent.split('\n');
      if (lines.length < 2) {
        alert('Error: El archivo debe tener al menos una fila de encabezados y una fila de datos');
        return;
      }

      // Verificar que tenga columna de email
      const headers = lines[0].toLowerCase();
      if (!headers.includes('email')) {
        alert('Error: El archivo CSV debe contener una columna "email"');
        return;
      }
    } catch (error) {
      alert('Error: No se pudo leer el archivo. Verifica que sea un archivo CSV válido.');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    console.log('[FRONTEND] Starting import process...');
    console.log('[FRONTEND] File:', selectedFile.name || 'unknown', 'Size:', selectedFile.size || 0);
    console.log('[FRONTEND] Import type:', importType);
    console.log('[FRONTEND] User email:', user.email);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('[FRONTEND] Sending request to:', `/api/import/${importType}`);

      let result;
      try {
        result = await post(`/api/import/${importType}`, formData);
      } catch (jsonError) {
        // Error al procesar la respuesta
        console.error('❌ [FRONTEND] Error parsing JSON response:', jsonError);
        console.error('❌ [FRONTEND] Full error details:', jsonError);

        // Mostrar error genérico
        const errorMessage = jsonError instanceof Error ? jsonError.message : String(jsonError);
        if (errorMessage.includes('SyntaxError') || errorMessage.includes('Unexpected token')) {
          alert(`❌ Error de Formato: El servidor devolvió una respuesta inválida.\n\n🔧 Posibles soluciones:\n• Verifica que el archivo tenga extensión .csv\n• Asegúrate de que el archivo no esté corrupto\n• Revisa la consola del navegador para más detalles\n\n💡 Prueba con los archivos de ejemplo: test-contacts.csv o test-simple.csv`);
        } else {
          alert(`❌ Error del Servidor: ${errorMessage}\n\n🔧 Verifica:\n• Que el archivo sea un CSV válido\n• Que tengas permisos de importación\n• Revisa la consola para más detalles`);
        }
        return;
      }

      setImportResult(result);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error importing:', error);
      alert('Error al importar el archivo');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (type: 'contacts' | 'templates') => {
    if (!user?.email) {
      alert('Por favor asegúrate de estar autenticado');
      return;
    }

    setIsExporting(true);

    try {
      // For blob responses, we need to use fetch directly since get() returns JSON
      const response = await fetch(`/api/export/${type}`, {
        method: 'GET',
        headers: {
          'x-user-email': user.email
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p>Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Importar y Exportar Datos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Importación */}
        <Card>
          <CardHeader>
            <CardTitle>Importar desde CSV</CardTitle>
            <CardDescription>
              Importa contactos o plantillas desde un archivo CSV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo de datos a importar:
              </label>
              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value as 'contacts' | 'templates')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="contacts">Contactos</option>
                <option value="templates">Plantillas</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Seleccionar archivo CSV:
              </label>
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">📋 Formato requerido del archivo CSV</h4>
                <p className="text-blue-700 mb-3 text-sm">
                  Tu archivo CSV debe tener las siguientes columnas:
                </p>
                <ul className="text-blue-700 mb-3 ml-4 text-sm">
                  <li><strong>• email</strong> (obligatorio): La dirección de correo electrónico del contacto</li>
                  <li><strong>• name</strong> (opcional): El nombre del contacto</li>
                  <li><strong>• tags</strong> (opcional): Etiquetas separadas por comas</li>
                </ul>
                <div className="bg-white border border-blue-300 rounded p-3">
                  <p className="text-sm font-semibold text-blue-800 mb-1">Ejemplo:</p>
                  <code className="text-sm text-blue-600">
                    email,name,tags<br />
                    juan@ejemplo.com,Juan Pérez,cliente,activo<br />
                    maria@ejemplo.com,María García,prospecto
                  </code>
                </div>
                <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800">
                    💡 <strong>Para probar:</strong> Hay archivos CSV de ejemplo en la carpeta del proyecto: <code>test-contacts.csv</code> y <code>test-simple.csv</code>
                  </p>
                </div>
              </div>

              {/* Troubleshooting section */}
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <h3 className="text-yellow-800 font-medium mb-2">🔧 Solución de problemas:</h3>
                <div className="text-yellow-700 text-sm space-y-2">
                  <p><strong>Error "SyntaxError: Unexpected token 'E'":</strong></p>
                  <ul className="list-disc list-inside text-xs space-y-1 ml-2">
                    <li>Este error indica que el servidor devolvió CSV en lugar de JSON</li>
                    <li>Verifica que el archivo tenga la extensión .csv</li>
                    <li>Asegúrate de que el archivo no esté vacío</li>
                    <li>Revisa que la primera línea contenga los encabezados correctos</li>
                    <li>Si persiste, revisa la consola del navegador para más detalles</li>
                  </ul>
                  <p className="mt-2"><strong>Pasos para probar:</strong></p>
                  <ol className="list-decimal list-inside text-xs space-y-1 ml-2">
                    <li>Usa uno de los archivos de prueba (test-contacts.csv o test-simple.csv)</li>
                    <li>Selecciona "Contactos" como tipo de importación</li>
                    <li>Haz clic en "Importar" y revisa los logs en la consola</li>
                  </ol>
                </div>
              </div>
            </div>

            <Button
              onClick={handleImport}
              disabled={!selectedFile || isImporting}
              className="w-full"
            >
              {isImporting ? 'Importando...' : 'Importar'}
            </Button>

            {importResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800 font-medium">{importResult.message}</p>
                <p className="text-green-600">Registros importados: {importResult.importedCount}</p>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-600 font-medium">Errores encontrados:</p>
                    <ul className="text-red-600 text-sm list-disc list-inside">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... y {importResult.errors.length - 5} errores más</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Exportación */}
        <FeatureGate>
          <Card>
            <CardHeader>
              <CardTitle>Exportar a CSV</CardTitle>
              <CardDescription>
                Descarga tus contactos o plantillas en formato CSV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Button
                  onClick={() => handleExport('contacts')}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  {isExporting ? 'Exportando...' : 'Exportar Contactos'}
                </Button>

                <Button
                  onClick={() => handleExport('templates')}
                  disabled={isExporting}
                  className="w-full"
                  variant="outline"
                >
                  {isExporting ? 'Exportando...' : 'Exportar Plantillas'}
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Formato de CSV para contactos:</strong></p>
                <p>email, name, tags, additionalContext</p>
                <br />
                <p><strong>Formato de CSV para plantillas:</strong></p>
                <p>name, subject, content, category, tags</p>
              </div>
            </CardContent>
          </Card>
        </FeatureGate>

      </div>
    </div>
  );
}
