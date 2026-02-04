import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal e información corporativa de Red Creativa Pro',
};

export default function AvisoLegal() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold text-foreground mb-8">Aviso Legal</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-sm text-muted-foreground mb-8">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Datos Identificativos</h2>
              <div className="bg-muted/50 border border-border rounded-lg p-6">
                <p><strong>Denominación social:</strong> Red Creativa Pro S.L.</p>
                <p><strong>Domicilio social:</strong> Calle Innovación, 123, 28001 Madrid, España</p>
                <p><strong>CIF:</strong> B-12345678</p>
                <p><strong>Email:</strong> info@redcreativapro.com</p>
                <p><strong>Teléfono:</strong> +34 900 123 456</p>
                <p><strong>Registro Mercantil:</strong> Madrid, Tomo 1234, Folio 567, Hoja M-123456</p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Objeto</h2>
              <p>
                El presente aviso legal regula el uso del sitio web redcreativapro.com (en adelante, "el sitio web"), del que es titular Red Creativa Pro S.L. (en adelante, "Red Creativa Pro").
              </p>
              <p>
                La navegación por el sitio web atribuye la condición de usuario del mismo e implica la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este Aviso Legal.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Condiciones de Uso</h2>
              <p>
                El acceso y uso de este sitio web se rige por la legalidad vigente y por el principio de buena fe, comprometiéndose el usuario a realizar un uso adecuado del sitio web.
              </p>
              <p>
                Quedan prohibidos los usos no autorizados del sitio web, en particular aquellos que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sean contrarios a la ley, la moral y las buenas costumbres</li>
                <li>Infrinjan los derechos de propiedad intelectual o industrial</li>
                <li>Dañen los sistemas físicos y lógicos de Red Creativa Pro</li>
                <li>Introduzcan virus informáticos en la red</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Propiedad Intelectual e Industrial</h2>
              <p>
                Red Creativa Pro es titular de todos los derechos de propiedad intelectual e industrial del sitio web, así como de los elementos contenidos en el mismo (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, programas de ordenador necesarios para su funcionamiento, acceso y uso, etc.).
              </p>
              <p>
                Todos los derechos reservados. En virtud de lo dispuesto en los artículos 8 y 32.1, párrafo segundo, de la Ley de Propiedad Intelectual, quedan expresamente prohibidas la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web, con fines comerciales, en cualquier soporte y por cualquier medio técnico, sin la autorización de Red Creativa Pro.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Exclusión de Garantías y Responsabilidad</h2>
              <p>
                Red Creativa Pro no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Errores u omisiones en los contenidos</li>
                <li>Falta de disponibilidad del portal o la transmisión de virus o programas maliciosos</li>
                <li>Uso ilícito o incorrecto del sitio web</li>
                <li>Falta de veracidad, exactitud, exhaustividad o actualidad de los contenidos</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Modificaciones</h2>
              <p>
                Red Creativa Pro se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en su portal.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Enlaces</h2>
              <p>
                En el caso de que en el sitio web se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, Red Creativa Pro no ejercerá ningún tipo de control sobre dichos sitios y contenidos.
              </p>
              <p>
                En ningún caso Red Creativa Pro asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno, ni garantizará la disponibilidad técnica, calidad, fiabilidad, exactitud, amplitud, veracidad, validez y constitucionalidad de cualquier material o información contenida en ninguno de dichos hipervínculos u otros sitios de Internet.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Derecho de Exclusión</h2>
              <p>
                Red Creativa Pro se reserva el derecho a denegar o retirar el acceso a portal y/o los servicios ofrecidos sin necesidad de preaviso, a instancia propia o de un tercero, a aquellos usuarios que incumplan las presentes Condiciones Generales de Uso.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Generalidades</h2>
              <p>
                Red Creativa Pro perseguirá el incumplimiento de las presentes condiciones así como cualquier utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Legislación Aplicable y Jurisdicción</h2>
              <p>
                La relación entre Red Creativa Pro y el Usuario se regirá por la normativa española vigente y cualquier controversia se someterá a los Juzgados y tribunales de la ciudad de Madrid.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">11. Contacto</h2>
              <p>
                Para cualquier consulta relacionada con este Aviso Legal, puede contactarnos en: legal@redcreativapro.com
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
