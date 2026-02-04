import { Metadata } from 'next'
import { PlaygroundWidget } from '@/components/tools/PlaygroundWidget'
import { MainNavigation } from '@/app/components/MainNavigation'
import Footer from '@/app/components/Footer'
import { FAQSection } from '@/app/components/seo/FAQSection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Lock, Wand2 } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Generador de Textos IA Gratis sin Registro | Playground Red Creativa',
    description: 'Prueba el mejor generador de textos con IA gratuito. Sin registro, sin tarjeta de crédito. Escribe blogs, ensayos y correos en segundos.',
    alternates: {
        canonical: 'https://redcreativa.pro/playground',
    },
}

export default function PlaygroundPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            <MainNavigation />

            <main className="pt-24 pb-12">
                {/* Hero Section with Tool */}
                <section className="container mx-auto px-4 text-center mb-16 relative">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-indigo-600/10 blur-[120px] -z-10 rounded-full" />

                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 tracking-tight">
                        Generador de Textos IA <br className="hidden md:block" /> Gratis y Sin Registro
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                        Escribe artículos, correos y tareas en segundos con nuestra IA avanzada. <br />
                        <span className="text-indigo-400 font-medium">Prueba libre. Cero fricción.</span>
                    </p>

                    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <PlaygroundWidget />
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-4 py-24 border-t border-white/5 bg-white/5">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">¿Por qué usar el Playground de Red Creativa?</h2>
                        <p className="text-gray-400">Diseñado para ser la forma más rápida de usar IA en español.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Lock className="h-6 w-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Sin Registro Obligatorio</h3>
                            <p className="text-gray-400 leading-relaxed">No pierdas tiempo creando cuentas si solo necesitas un texto rápido. Entra y escribe.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Wand2 className="h-6 w-6 text-purple-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Calidad GPT-4 Turbo</h3>
                            <p className="text-gray-400 leading-relaxed">Usamos los modelos más avanzados optimizados para redacción en español. Nada de traducciones baratas.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-indigo-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">SEO Automático</h3>
                            <p className="text-gray-400 leading-relaxed">Nuestra IA ya piensa en Google. Estructura tus textos para que posicionen mejor desde el primer borrador.</p>
                        </div>
                    </div>
                </section>

                {/* Use Cases */}
                <section className="py-24 border-t border-white/5">
                    <div className="container mx-auto px-4">
                        <h2 className="text-3xl font-bold mb-16 text-center">Todo lo que puedes crear gratis</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                            {['Blogs para SEO', 'Correos de Venta', 'Ensayos Académicos', 'Copy para Redes'].map((item, i) => (
                                <div key={i} className="p-6 rounded-xl bg-zinc-900/50 border border-white/5 text-center hover:bg-zinc-900 transition-colors">
                                    <p className="font-bold text-lg">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>


                {/* FAQ for SEO */}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <FAQSection
                        title="Preguntas Frecuentes sobre el Generador IA"
                        items={[
                            { question: "¿Es realmente gratis?", answer: "Sí, el Playground te permite generar hasta 3 textos diarios de forma totalmente gratuita y sin necesidad de registrarte." },
                            { question: "¿Qué tecnología usa?", answer: "Utilizamos una combinación de modelos avanzados (incluyendo GPT-4o y Claude 3.5 Sonnet) optimizados específicamente para la redacción en español." },
                            { question: "¿Los textos son originales?", answer: "Absolutamente. Cada generación es única y libre de plagio. Sin embargo, siempre recomendamos revisar y personalizar el contenido." },
                            { question: "¿Puedo guardar mis textos?", answer: "En el modo invitado (sin registro) no guardamos tus textos por privacidad. Si deseas un historial y editor avanzado, puedes crear una cuenta gratuita." }
                        ]}
                    />
                </div>

                {/* CTA Footer */}
                <section className="py-24 text-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto bg-gradient-to-b from-indigo-900/50 to-indigo-900/20 p-12 rounded-3xl border border-indigo-500/30">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Necesitas más potencia?</h2>
                            <p className="text-lg text-gray-300 mb-8">Desbloquea el Editor Pro con historial, plantillas ilimitadas y modo Stealth.</p>
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200" asChild>
                                <Link href="/dashboard">Crear Cuenta Gratis</Link>
                            </Button>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
