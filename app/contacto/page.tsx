import { Metadata } from 'next'
import { Button } from '../components/ui/button'
import SimpleLanguageToggle from '@/app/components/SimpleLanguageToggle'

export const metadata: Metadata = {
  title: 'Contacto - Red Creativa Pro',
  description: 'Ponte en contacto con nuestro equipo de soporte. Estamos aquí para ayudarte con cualquier pregunta o problema.',
  keywords: ['contacto', 'soporte', 'ayuda', 'Red Creativa Pro', 'atención al cliente'],
  authors: [{ name: 'Red Creativa Pro' }],
  openGraph: {
    title: 'Contacto - Red Creativa Pro',
    description: 'Ponte en contacto con nuestro equipo de soporte. Estamos aquí para ayudarte con cualquier pregunta o problema.',
    type: 'website',
  },
}

import ContactoClient from './ContactoClient'

export default function ContactoPage() {
  return <ContactoClient />
}