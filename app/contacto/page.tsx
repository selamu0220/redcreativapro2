import { Metadata } from 'next'
import { Button } from '../components/ui/button'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'

export const metadata: Metadata = {
  title: 'Contacto | Habla con el Creador de Red Creativa Pro',
  description: '¿Tienes dudas sobre Red Creativa Pro? Habla directamente con Sela, el creador. Soporte personalizado, respuestas rápidas y atención real - no bots.',
  keywords: ['contacto Red Creativa Pro', 'soporte IA escritura', 'ayuda herramientas IA', 'atención al cliente Red Creativa'],
  authors: [{ name: 'Red Creativa Pro' }],
  alternates: {
    canonical: 'https://redcreativa.pro/contacto'
  },
  openGraph: {
    title: 'Contacto | Habla con el Creador de Red Creativa Pro',
    description: '¿Tienes dudas sobre Red Creativa Pro? Habla directamente con Sela, el creador. Soporte personalizado, respuestas rápidas.',
    type: 'website',
    url: 'https://redcreativa.pro/contacto',
    siteName: 'Red Creativa Pro',
  },
}

import ContactoClient from './ContactoClient'

export default function ContactoPage() {
  return <ContactoClient />
}
