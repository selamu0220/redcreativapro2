import { Metadata } from "next";
import { Home, ArrowLeft, Search, FileText, Mail, MessageSquare } from "lucide-react";
import { LanguageLink } from "@/app/components/LanguageLink";

export const metadata: Metadata = {
  title: "Página no encontrada - 404",
  description: "La página que buscas no existe. Regresa al inicio o explora nuestras herramientas de IA para escritura profesional.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-orange-500 dark:text-orange-400 mb-4">
            404
          </h1>
          <div className="w-24 h-1 bg-orange-500 dark:bg-orange-400 mx-auto rounded-full"></div>
        </div>

        {/* Error Message */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            Pero no te preocupes, puedes encontrar lo que necesitas en nuestras herramientas de IA.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <LanguageLink
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Volver al inicio
          </LanguageLink>

          <LanguageLink
            href="/escritor-ia"
            className="inline-flex items-center justify-center px-6 py-3 bg-white hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white font-semibold rounded-lg border border-gray-300 dark:border-slate-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Página anterior
          </LanguageLink>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <LanguageLink
            href="/escritor-ia"
            className="group p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Escritor IA
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Genera contenido profesional con IA
              </p>
            </div>
          </LanguageLink>



          <LanguageLink
            href="/prompts"
            className="group p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-500"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/50 transition-colors">
                <MessageSquare className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Prompts IA
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Usa prompts personalizados para generar contenido
              </p>
            </div>
          </LanguageLink>
        </div>

        {/* Help Text */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte.
          </p>
        </div>

        {/* Structured Data for 404 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Página no encontrada - 404",
              description: "La página solicitada no existe en Red Creativa Pro.",
              url: "https://redcreativa.pro/404",
              mainEntity: {
                "@type": "Thing",
                name: "Error 404",
                description: "Página no encontrada",
              },
              breadcrumb: {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Inicio",
                    item: "https://www.redcreativa.pro",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "404 - Página no encontrada",
                  },
                ],
              },
            }),
          }}
        />
      </div>
    </div>
  );
}