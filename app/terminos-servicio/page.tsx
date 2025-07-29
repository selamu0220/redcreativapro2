import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Términos y condiciones de uso de Red Creativa Pro',
};

export default function TerminosServicio() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-8">Términos de Servicio</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar Red Creativa Pro, usted acepta estar sujeto a estos Términos de Servicio y todas las leyes y regulaciones aplicables. Si no está de acuerdo con alguno de estos términos, no debe utilizar este servicio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Descripción del Servicio</h2>
              <p>
                Red Creativa Pro es una plataforma de inteligencia artificial que proporciona herramientas para la generación de contenido, redacción de emails y chat con prompts personalizados.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Registro y Cuenta de Usuario</h2>
              <p>
                Para utilizar ciertos servicios, debe crear una cuenta proporcionando información precisa y completa. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Uso Aceptable</h2>
              <p>
                Usted se compromete a utilizar el servicio únicamente para fines legales y de acuerdo con estos términos. No debe:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Utilizar el servicio para actividades ilegales o no autorizadas</li>
                <li>Intentar acceder a sistemas o datos no autorizados</li>
                <li>Interferir con el funcionamiento del servicio</li>
                <li>Transmitir contenido ofensivo, difamatorio o que infrinja derechos de terceros</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Propiedad Intelectual</h2>
              <p>
                El contenido generado por usted utilizando nuestras herramientas de IA le pertenece. Sin embargo, nos reservamos el derecho de utilizar datos agregados y anonimizados para mejorar nuestros servicios.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Limitación de Responsabilidad</h2>
              <p>
                Red Creativa Pro no será responsable de daños directos, indirectos, incidentales o consecuentes que resulten del uso o la imposibilidad de usar el servicio.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Modificaciones</h2>
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Contacto</h2>
              <p>
                Si tiene preguntas sobre estos Términos de Servicio, puede contactarnos en: legal@redcreativapro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}