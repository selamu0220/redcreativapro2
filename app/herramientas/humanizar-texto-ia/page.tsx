import { Metadata } from 'next'
import { HumanizerWidget } from '@/components/tools/HumanizerWidget'
import { MainNavigation } from '@/app/components/MainNavigation'
import Footer from '@/app/components/Footer'
import { FAQSection } from '@/app/components/seo/FAQSection'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
    title: 'Humanizar Texto IA Gratis | Indetectable para Turnitin y GPTZero',
    description: 'Herramienta gratuita para humanizar textos escritos por IA. Haz que tu contenido sea indetectable para Turnitin, GPTZero y Originality.ai. ¡Pruébalo ahora!',
    alternates: {
        canonical: 'https://redcreativa.pro/herramientas/humanizar-texto-ia',
    },
}

export default function HumanizerPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans">
            <MainNavigation />

            <main className="pt-24 pb-12">
                {/* Hero Section with Tool */}
                <section className="container mx-auto px-4 text-center mb-16 relative">
                    {/* Background Gradients */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-purple-600/20 blur-[120px] -z-10 rounded-full" />

                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 tracking-tight">
                        Humanizar Texto IA <br className="hidden md:block" /> Indetectable
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                        Convierte textos de ChatGPT, Claude o Gemini en contenido 100% humano. <br />
                        <span className="text-purple-400 font-medium">Bypassea Turnitin, GPTZero y Originality.ai.</span>
                    </p>

                    <div className="max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300">
                        <HumanizerWidget />
                    </div>
                </section>

                {/* Value Props */}
                <section className="container mx-auto px-4 py-24 border-t border-white/5 bg-white/5">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">¿Por qué usar nuestro Humanizador?</h2>
                        <p className="text-gray-400">La única herramienta en español entrenada para engañar a los detectores más avanzados.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🕵️‍♂️</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">100% Indetectable</h3>
                            <p className="text-gray-400 leading-relaxed">Nuestro algoritmo elimina la "perplejidad" baja y el "burstiness" artificial, haciendo que tu texto parezca escrito por una persona real.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">🧠</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Mantiene el Sentido</h3>
                            <p className="text-gray-400 leading-relaxed">No es un simple spinner de sinónimos. Nuestra IA entiende el contexto semántico y reescribe sin perder el mensaje original.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-[#111] border border-white/10 hover:border-purple-500/50 transition-colors group">
                            <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <span className="text-2xl">⚡</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">Gratis y Rápido</h3>
                            <p className="text-gray-400 leading-relaxed">Empieza gratis sin tarjeta de crédito. Resultados en segundos para tus ensayos, blogs o correos electrónicos profesionales.</p>
                        </div>
                    </div>
                </section>

                {/* Testimonials (Inline) */}
                <section className="py-24 border-t border-white/5">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-16">Lo que dicen nuestros usuarios</h2>
                        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-gray-300 italic mb-4">"Increíble. Pasé mi tesis por Turnitin y me daba 45% AI. Después de usar Red Creativa bajó al 2%. Literalmente me salvó el semestre."</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold">JD</div>
                                    <div>
                                        <p className="font-bold text-sm">Juan Diego</p>
                                        <p className="text-xs text-gray-500">Estudiante de Derecho</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-gray-300 italic mb-4">"Lo uso para los artículos de mi blog. Google estaba penalizando mi contenido por ser muy 'robótico'. Ahora rankeo mucho mejor."</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-500 to-teal-500 flex items-center justify-center font-bold">M</div>
                                    <div>
                                        <p className="font-bold text-sm">Marta S.</p>
                                        <p className="text-xs text-gray-500">SEO Manager</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ for SEO */}
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <FAQSection
                        title="Preguntas Frecuentes sobre Humanizar IA"
                        items={[
                            { question: "¿Qué significa humanizar texto IA?", answer: "Significa reescribir el contenido generado por inteligencia artificial para añadir variaciones naturales, modismos y estructuras menos predecibles, haciéndolo parecer escrito por una persona." },
                            { question: "¿Es gratis esta herramienta?", answer: "Sí, ofrecemos un plan gratuito que te permite humanizar textos cortos diariamente. Para uso ilimitado, consulta nuestros planes Pro." },
                            { question: "¿Funciona para Turnitin?", answer: "Nuestra tecnología está diseñada para reducir significativamente la probabilidad de detección por herramientas como Turnitin y GPTZero, pero siempre recomendamos revisar el contenido final." },
                            { question: "¿Es seguro para SEO?", answer: "Absolutamente. De hecho, humanizar el texto mejora la legibilidad y el 'Expertise' (E-E-A-T), lo que ayuda a posicionar mejor en Google." }
                        ]}
                    />
                </div>

                {/* CTA Footer */}
                <section className="py-24 text-center">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto bg-gradient-to-b from-purple-900/50 to-purple-900/20 p-12 rounded-3xl border border-purple-500/30">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para escribir sin límites?</h2>
                            <p className="text-lg text-gray-300 mb-8">Únete a más de 10,000 escritores que ya usan Red Creativa Pro para generar contenido indetectable.</p>
                            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-gray-200" asChild>
                                <Link href="/dashboard">Empezar Gratis</Link>
                            </Button>
                        </div>
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}
