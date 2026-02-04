import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de Red Creativa Pro',
};

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-8">Política de Privacidad</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Información que Recopilamos</h2>
              <p>
                En Red Creativa Pro, recopilamos la siguiente información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Información de cuenta:</strong> Email, nombre y preferencias de usuario</li>
                <li><strong>Contenido generado:</strong> Textos, emails y prompts que crea usando nuestras herramientas</li>
                <li><strong>Datos de uso:</strong> Estadísticas de uso de las herramientas y funcionalidades</li>
                <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador y datos de sesión</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Cómo Utilizamos su Información</h2>
              <p>
                Utilizamos la información recopilada para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar y mejorar nuestros servicios de IA</li>
                <li>Personalizar su experiencia en la plataforma</li>
                <li>Procesar pagos y gestionar suscripciones</li>
                <li>Enviar comunicaciones importantes sobre el servicio</li>
                <li>Analizar el uso para mejorar nuestras herramientas</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Compartir Información</h2>
              <p>
                No vendemos, alquilamos ni compartimos su información personal con terceros, excepto en los siguientes casos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Con su consentimiento explícito</li>
                <li>Para cumplir con obligaciones legales</li>
                <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
                <li>En caso de fusión, adquisición o venta de activos</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Seguridad de los Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies y tecnologías similares para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener su sesión activa</li>
                <li>Recordar sus preferencias</li>
                <li>Analizar el tráfico del sitio web</li>
                <li>Mejorar la funcionalidad de la plataforma</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Sus Derechos</h2>
              <p>
                Usted tiene derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a su información personal</li>
                <li>Rectificar datos inexactos</li>
                <li>Solicitar la eliminación de sus datos</li>
                <li>Limitar el procesamiento de su información</li>
                <li>Portabilidad de sus datos</li>
                <li>Oponerse al procesamiento</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Retención de Datos</h2>
              <p>
                Conservamos su información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera un período de retención más largo.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Cambios en esta Política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Contacto</h2>
              <p>
                Si tiene preguntas sobre esta Política de Privacidad o desea ejercer sus derechos, puede contactarnos en: privacy@redcreativapro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
