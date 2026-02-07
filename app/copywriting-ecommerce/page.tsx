import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Star, ShoppingCart, Tag, Percent, TrendingUp, DollarSign, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Copywriting para eCommerce 2025 | Descripciones que Venden +50 Plantillas',
  description: 'Aprende copywriting específico para tiendas online. Descripciones de producto, emails de carrito abandonado y campañas que convierten. Templates optimizados para Shopify, WooCommerce.',
  keywords: ['copywriting ecommerce', 'descripciones producto ia', 'tienda online copywriting', 'carrito abandonado email', 'productos ia ventas', 'shopify copywriting', 'woocommerce ia', 'ecommerce ventas'],
  alternates: { canonical: 'https://redcreativa.pro/copywriting-ecommerce' },
  openGraph: {
    title: 'Copywriting para eCommerce 2025 | Descripciones que Venden',
    description: 'Aprende copywriting para tiendas online.',
    type: 'website',
    images: [{ url: 'https://redcreativa.pro/api/og?title=Copywriting+eCommerce', width: 1200, height: 630 }]
  },
  twitter: { card: 'summary_large_image', title: 'Copywriting eCommerce 2025', description: 'Descripciones que venden' }
}

const tiposCopy = [
  { nombre: 'Título de Producto', descripcion: 'Gancho + beneficio + urgencia', longitud: '60-70 caracteres', conversion: '+25%' },
  { nombre: 'Descripción Larga', descripcion: 'Problema, solución, beneficios, prueba', longitud: '300-500 palabras', conversion: '+30%' },
  { nombre: 'Bullets de Beneficios', descripcion: '5-8 puntos cortos con emojis', longitud: '200-300 caracteres', conversion: '+20%' },
  { nombre: 'Email Carrito Abandonado', descripcion: 'Recordatorio + urgencia + CTA', longitud: '150-200 palabras', conversion: '+40%' },
  { nombre: 'Anuncio Facebook/Instagram', descripcion: 'Gancho + prueba social + CTA', longitud: '125 caracteres', conversion: '+35%' },
  { nombre: 'Popup de Sale', descripcion: 'Urgencia + discount + CTA', longitud: '50 palabras', conversion: '+50%' },
]

const elementos = [
  { nombre: 'Headline', descripcion: 'Beneficio principal en 8 palabras', ejemplo: 'Piel Suave en 7 Días o te Devolvemos' },
  { nombre: 'Subheader', descripcion: 'Refuerza el beneficio', ejemplo: 'Formula dermatológicamente testada' },
  { nombre: 'Benefits', descripcion: 'Lista de ventajas', ejemplo: '✓ Sin parabenos ✓ Cruelty free' },
  { nombre: 'Features', descripcion: 'Especificaciones técnicas', ejemplo: 'Peso: 50ml | Origen: Francia' },
  { nombre: 'Social Proof', descripcion: 'Testimonios y ratings', ejemplo: '4.9/5 (2,400 opiniones)' },
  { nombre: 'CTA', descripcion: 'Llamada a la acción clara', ejemplo: 'Comprar Ahora -10%' },
]

const plantillas = [
  { tipo: 'Producto Físico', estructura: 'Beneficio → Problema → Solución → Prueba → CTA', plataforma: 'Shopify, Woo' },
  { tipo: 'Producto Digital', estructura: 'Resultado → Transformación → Contenido → Bonus → CTA', plataforma: 'Kajabi, Teachable' },
  { tipo: 'Servicio', estructura: 'Problema → Metodología → Resultados → Garantía → CTA', plataforma: 'Web propia' },
  { tipo: 'Suscripción', estructura: 'Beneficio mensual → Costo ahorro → Urgencia → CTA', plataforma: 'ReCharge, Stripe' },
]

export default function CopywritingEcommercePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4" variant="outline"> <ShoppingCart className="w-3 h-3 mr-1" /> Guía 2025 </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Copywriting para <span className="text-primary">eCommerce</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprende a escribir descripciones de producto, emails y anuncios que convierten visitantes 
            en compradores. Templates optimizados para Shopify, WooCommerce y cualquier plataforma.
          </p>
        </div>

        {/* CTA Principal */}
        <Card className="mb-16 border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
          <CardContent className="p-8 text-center">
            <Badge className="mb-4 bg-green-500/10 text-green-600">+50 Plantillas</Badge>
            <h2 className="text-3xl font-bold mb-4">Vende Más con Mejor Copy</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Nuestras plantillas de copywriting para eCommerce están probadas para 
              aumentar conversiones en tiendas online.
            </p>
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Descripciones producto</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Carrito abandonado</div>
              <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4" /> Anuncios</div>
            </div>
            <Button size="lg" asChild><Link href="/prompts/ecommerce">Ver Plantillas <ArrowRight className="w-4 h-4 ml-2" /></Link></Button>
          </CardContent>
        </Card>

        {/* Tipos de Copy */}
        <h2 className="text-3xl font-bold mb-8 text-center">Tipos de Copy para eCommerce</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {tiposCopy.map ((tipo, i) => (
            <Card key={i} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold">{tipo.nombre}</h3>
                  <Badge variant="secondary">{tipo.longitud}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{tipo.descripcion}</p>
                <p className="text-sm text-green-600 font-medium">Conversión: {tipo.conversion}</p>
              </CardContent>
              </Card>
          ))}
        </div>

        {/* Elementos */}
        <h2 className="text-3xl font-bold mb-8 text-center">Estructura de una Ficha de Producto</h2>
        <Card className="mb-16 overflow-hidden">
          <CardHeader><CardTitle className="flex items-center gap-2"><Package className="w-5 h-5" /> Elementos de Conversión</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {elementos.map ((elem, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <h3 className="font-bold mb-2 text-primary">{elem.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{elem.descripcion}</p>
                  <p className="text-xs italic">"{elem.ejemplo}"</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plantillas por Tipo */}
        <h2 className="text-3xl font-bold mb-8 text-center">Plantillas por Tipo de Producto</h2>
        <Card className="mb-16 overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Estructura</th>
                  <th className="text-left p-4">Plataforma</th>
                </tr>
              </thead>
              <tbody>
                {plantillas.map ((plant, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4 font-bold">{plant.tipo}</td>
                    <td className="p-4 text-muted-foreground">{plant.estructura}</td>
                    <td className="p-4">{plant.plataforma}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Métricas */}
        <h2 className="text-3xl font-bold mb-8 text-center">Impacto del Copywriting</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6">
            <DollarSign className="w-10 h-10 mx-auto mb-3 text-green-500" />
            <h3 className="text-3xl font-bold mb-2">+35%</h3>
            <p className="text-sm text-muted-foreground">Más ventas</p>
          </Card>
          <Card className="text-center p-6">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-blue-500" />
            <h3 className="text-3xl font-bold mb-2">+40%</h3>
            <p className="text-sm text-muted-foreground">Recuperación carrito</p>
          </Card>
          <Card className="text-center p-6">
            <Percent className="w-10 h-10 mx-auto mb-3 text-purple-500" />
            <h3 className="text-3xl font-bold mb-2">+50%</h3>
            <p className="text-sm text-muted-foreground">CTR emails</p>
          </Card>
          <Card className="text-center p-6">
            <Tag className="w-10 h-10 mx-auto mb-3 text-orange-500" />
            <h3 className="text-3xl font-bold mb-2">+25%</h3>
            <p className="text-sm text-muted-foreground">CTR anuncios</p>
          </Card>
        </div>

        {/* CTA Final */}
        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Listo para vender más?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Accede a +50 plantillas de copywriting para eCommerce y 
            aumenta tus ventas hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild><Link href="/prompts/ecommerce">Ver Plantillas <ArrowRight className="h-4 w-4 ml-2" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/">Probar Gratis</Link></Button>
          </div>
        </div>
      </div>
    </main>
  )
}
