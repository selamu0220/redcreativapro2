'use client';

import Link from 'next/link';
import { MainNavigation } from '../components/MainNavigation';
import Footer from '../components/Footer';
import { SignUpButton } from '@clerk/nextjs';

export default function PlanesPage() {
  const plans = [
    {
      name: "Gratis",
      price: "$0",
      period: "/mes",
      features: [
        "Acceso limitado a herramientas",
        "5 generaciones diarias",
        "Soporte básico"
      ],
      cta: "Comenzar Gratis",
      href: "signup" // Changed to identifier
    },
    {
      name: "Pro",
      price: "$29",
      period: "/mes",
      features: [
        "Acceso ilimitado a herramientas",
        "Generaciones ilimitadas",
        "Soporte prioritario",
        "Acceso a nuevos modelos"
      ],
      cta: "Suscribirse",
      href: "/dashboard",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Planes y Precios
        </h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">
          Elige el plan perfecto para tus necesidades
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border ${plan.popular ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200 dark:border-gray-700'}`}
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {plan.name}
              </h2>
              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 ml-2">{plan.period}</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.href === 'signup' ? (
                <SignUpButton mode="modal">
                  <button className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                    {plan.cta}
                  </button>
                </SignUpButton>
              ) : (
                <Link href={plan.href} className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'}`}>
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
