'use client';

import { m } from 'framer-motion';
import { MagnifyingGlassIcon, CursorArrowRaysIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';

export default function MetaJourneySection() {
    return (
        <div className="w-full h-auto py-10 bg-zinc-950 rounded-xl border border-zinc-900 flex flex-col items-center relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />

            <h3 className="text-zinc-500 font-mono text-sm mb-8 uppercase tracking-widest text-center">
                Prueba de Concepto: <span className="text-zinc-200">Tu propia experiencia</span>
            </h3>

            <div className="relative">
                {/* The Vertical Line */}
                <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-zinc-800">
                    <m.div
                        className="w-full bg-rose-500 origin-top"
                        initial={{ height: "0%" }}
                        whileInView={{ height: "100%" }}
                        transition={{ duration: 2, ease: "linear" }}
                    />
                </div>

                <div className="space-y-12">
                    <JourneyStep
                        icon={<MagnifyingGlassIcon className="w-5 h-5 text-white" />}
                        title="Tu Búsqueda"
                        desc="Buscaste 'escritor ia', 'redactor seo' o similar en Google."
                        delay={0}
                    />

                    <JourneyStep
                        icon={<div className="text-xs font-bold bg-white text-black px-1 rounded">Rank #1</div>}
                        title="Nuestro Posicionamiento"
                        desc="La IA detectó tu intención de búsqueda y posicionó este artículo."
                        delay={0.5}
                    />

                    <JourneyStep
                        icon={<CursorArrowRaysIcon className="w-5 h-5 text-white" />}
                        title="Tu Clic"
                        desc="El título y la meta descripción (generados por IA) ganaron tu clic."
                        delay={1.0}
                    />

                    <JourneyStep
                        icon={<CheckBadgeIcon className="w-5 h-5 text-emerald-400" />}
                        title="Estás Aquí"
                        desc="Ahora estás leyendo esto. El sistema funciona. Copialo."
                        highlight
                        delay={1.5}
                    />
                </div>
            </div>
        </div>
    );
}

function JourneyStep({ icon, title, desc, delay, highlight = false }: any) {
    return (
        <m.div
            className="flex items-start gap-6 relative pl-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
        >
            <div className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 
                ${highlight ? 'bg-zinc-900 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-zinc-900 border-zinc-800'}
            `}>
                {icon}
            </div>

            <div className={`p-4 rounded-lg border max-w-xs ${highlight ? 'bg-zinc-900 border-zinc-700' : 'bg-transparent border-transparent'}`}>
                <h4 className={`font-bold text-sm ${highlight ? 'text-white' : 'text-zinc-300'}`}>{title}</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{desc}</p>
            </div>
        </m.div>
    )
}
