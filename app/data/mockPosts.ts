import { Post } from '../types/blog';

export const mockPosts: Post[] = [
  {
    id: '1',
    title: 'Cómo usar IA para escribir mejor: Guía completa 2025',
    excerpt: 'Descubre las mejores técnicas y herramientas de inteligencia artificial para mejorar tu escritura profesional y crear contenido de calidad.',
    category: 'Escritura IA',
    readTime: '8 min',
    date: '2025-01-29',
    image: '/blog/ia-escritura.jpg',
    slug: 'como-usar-ia-para-escribir-mejor',
    author: 'Red Creativa Pro',
    tags: ['IA', 'Escritura', 'Productividad'],
    published: true
  },
  {
    id: '2',
    title: 'Automatizar correos electrónicos con IA en 2025',
    excerpt: 'Aprende a crear emails profesionales automáticamente usando inteligencia artificial. Ahorra tiempo y mejora tus comunicaciones.',
    category: 'Email Marketing',
    readTime: '6 min',
    date: '2025-01-28',
    image: '/blog/email-automation.jpg',
    slug: 'automatizar-correos-electronicos-ia',
    author: 'Red Creativa Pro',
    tags: ['Email Marketing', 'Automatización', 'IA'],
    published: true
  },
  {
    id: '3',
    title: 'Los 50 mejores prompts de IA para escritura profesional',
    excerpt: 'Colección completa de prompts probados para generar contenido de calidad con herramientas de inteligencia artificial.',
    category: 'Prompts IA',
    readTime: '12 min',
    date: '2025-01-27',
    image: '/blog/prompts-ia.jpg',
    slug: 'mejores-prompts-ia-escritura',
    author: 'Red Creativa Pro',
    tags: ['Prompts', 'IA', 'Escritura'],
    published: true
  }
];
