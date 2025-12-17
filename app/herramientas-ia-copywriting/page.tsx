'use client';

import Link from 'next/link';
import { MainNavigation } from '../components/MainNavigation';
import Footer from '../components/Footer';
import { useTranslation } from '../lib/language/context';

export default function HerramientasIAPage() {
  const { t } = useTranslation();

  const tools = [
    {
      title: t('navigation.aiWriter', 'common') || "Escritor IA",
      description: "Genera artículos, posts y contenido extenso con IA.",
      href: "/escritor-ia",
      icon: "✍️"
    },
    {
      title: t('navigation.aiEmails', 'common') || "Correos IA",
      description: "Crea campañas de email marketing efectivas.",
      href: "/correos-ia",
      icon: "📧"
    },
    {
      title: "Corrector IA",
      description: "Corrige gramática y estilo de tus textos.",
      href: "/corrector-textos-ia",
      icon: "📝"
    },
    {
      title: "Chat con Prompts",
      description: "Asistente inteligente con prompts predefinidos.",
      href: "/ai-browser",
      icon: "🤖"
    },
    {
      title: "Gestión de Contactos",
      description: "Administra tus leads y clientes.",
      href: "/contactos",
      icon: "👥"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Herramientas de IA para Copywriting
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
          Potencia tu escritura con nuestra suite de herramientas inteligentes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <Link 
              key={tool.href} 
              href={tool.href}
              className="block p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500"
            >
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {tool.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
