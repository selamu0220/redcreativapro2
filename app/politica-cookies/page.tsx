import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre el uso de cookies en Red Creativa Pro',
};

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Cookies</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">¿Qué son las Cookies?</h2>
              <p>
                Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Nos ayudan a hacer que nuestro sitio web funcione, o funcione de manera más eficiente, así como a proporcionar información a los propietarios del sitio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Tipos de Cookies que Utilizamos</h2>
              
              <div className="space-y-6">
                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Cookies Esenciales</h3>
                  <p className="mb-3">
                    Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar en nuestros sistemas.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Cookies de sesión de usuario</li>
                    <li>Cookies de autenticación</li>
                    <li>Cookies de seguridad</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Cookies de Funcionalidad</h3>
                  <p className="mb-3">
                    Estas cookies permiten que el sitio web proporcione una funcionalidad y personalización mejoradas.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Preferencias de tema (modo oscuro/claro)</li>
                    <li>Configuraciones de idioma</li>
                    <li>Preferencias de usuario</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Cookies Analíticas</h3>
                  <p className="mb-3">
                    Estas cookies nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Estadísticas de uso</li>
                    <li>Análisis de rendimiento</li>
                    <li>Métricas de engagement</li>
                  </ul>
                </div>

                <div className="border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-3">Cookies de Marketing</h3>
                  <p className="mb-3">
                    Estas cookies pueden ser establecidas a través de nuestro sitio por nuestros socios publicitarios.
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Seguimiento de conversiones</li>
                    <li>Personalización de anuncios</li>
                    <li>Remarketing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Cookies de Terceros</h2>
              <p>
                Utilizamos servicios de terceros que pueden establecer cookies en su dispositivo:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Stripe:</strong> Para procesar pagos de manera segura</li>
                <li><strong>Google Analytics:</strong> Para analizar el tráfico del sitio web</li>
                <li><strong>Vercel:</strong> Para el hosting y análisis de rendimiento</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Gestión de Cookies</h2>
              <p>
                Puede controlar y/o eliminar las cookies como desee. Puede eliminar todas las cookies que ya están en su computadora y puede configurar la mayoría de los navegadores para evitar que se coloquen.
              </p>
              
              <div className="bg-muted/50 border border-border rounded-lg p-6 mt-4">
                <h4 className="font-semibold text-foreground mb-3">Configuración del Navegador:</h4>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Chrome:</strong> Configuración &gt; Privacidad y seguridad &gt; Cookies</li>
                  <li><strong>Firefox:</strong> Opciones &gt; Privacidad y seguridad &gt; Cookies</li>
                  <li><strong>Safari:</strong> Preferencias &gt; Privacidad &gt; Cookies</li>
                  <li><strong>Edge:</strong> Configuración &gt; Privacidad &gt; Cookies</li>
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Consentimiento</h2>
              <p>
                Al continuar utilizando nuestro sitio web después de que se le haya informado sobre nuestro uso de cookies, usted consiente nuestro uso de cookies como se describe en esta política.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Cookies de vez en cuando para reflejar cambios en las cookies que utilizamos o por otras razones operativas, legales o reglamentarias.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Contacto</h2>
              <p>
                Si tiene preguntas sobre nuestra Política de Cookies, puede contactarnos en: cookies@redcreativapro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
