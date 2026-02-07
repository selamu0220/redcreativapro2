'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Type, AlignLeft } from 'lucide-react'
import Link from 'next/link'

export function MetadataCalculatorClient() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const titleLength = title.length
  const descriptionLength = description.length

  const titleStatus = titleLength > 60 ? 'error' : titleLength > 50 ? 'warning' : 'success'
  const descStatus = descriptionLength > 160 ? 'error' : descriptionLength > 155 ? 'warning' : 'success'

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Calculadora de Meta Tags SEO</h1>
          <p className="text-xl text-muted-foreground">
            Optimiza la longitud de tus meta titles y descriptions para Google
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Meta Title
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Escribe tu meta title aquí..."
                className="text-lg"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{titleLength} caracteres</span>
                <Badge variant={titleStatus === 'success' ? 'default' : titleStatus === 'warning' ? 'secondary' : 'destructive'}>
                  {titleStatus === 'success' ? 'Perfecto' : titleStatus === 'warning' ? 'Cuidado' : 'Muy largo'}
                </Badge>
              </div>
              <Progress 
                value={Math.min((titleLength / 60) * 100, 100)} 
                className={getProgressColor(titleStatus)}
              />
              <div className="flex items-start gap-2 text-sm">
                {titleStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                )}
                <span className="text-muted-foreground">
                  {titleStatus === 'success' 
                    ? 'Longitud ideal para Google (50-60 caracteres)' 
                    : titleStatus === 'warning'
                    ? 'Cerca del límite. Google trunca después de 60 caracteres'
                    : 'Demasiado largo. Será truncado en los resultados'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5" />
                Meta Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe tu meta description aquí..."
                className="text-lg min-h-[100px]"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{descriptionLength} caracteres</span>
                <Badge variant={descStatus === 'success' ? 'default' : descStatus === 'warning' ? 'secondary' : 'destructive'}>
                  {descStatus === 'success' ? 'Perfecto' : descStatus === 'warning' ? 'Cuidado' : 'Muy largo'}
                </Badge>
              </div>
              <Progress 
                value={Math.min((descriptionLength / 160) * 100, 100)} 
                className={getProgressColor(descStatus)}
              />
              <div className="flex items-start gap-2 text-sm">
                {descStatus === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                )}
                <span className="text-muted-foreground">
                  {descStatus === 'success' 
                    ? 'Longitud ideal (150-160 caracteres)' 
                    : descStatus === 'warning'
                    ? 'Cerca del límite. Google trunca después de 160 caracteres'
                    : 'Demasiado larga. Será truncada en los resultados'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vista Previa en Google</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 max-w-2xl">
              <div className="text-blue-600 text-xl mb-1 truncate">
                {title || 'Título de tu página'}
              </div>
              <div className="text-green-700 text-sm mb-2">
                https://tusitio.com › pagina
              </div>
              <div className="text-gray-600 text-sm line-clamp-2">
                {description || 'Descripción de tu página que aparecerá en los resultados de búsqueda de Google...'}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">¿Quieres optimizar todo tu contenido?</h2>
          <p className="text-muted-foreground mb-6">
            Red Creativa Pro genera automáticamente meta titles y descriptions optimizados para SEO
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Probar Red Creativa Pro Gratis
          </Link>
        </div>
      </div>
    </main>
  )
}
