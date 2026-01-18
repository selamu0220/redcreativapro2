'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SparklesIcon, CodeBracketIcon, TagIcon, BoltIcon } from '@heroicons/react/24/outline';

export default function TechSpecsAnimation() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 5); // 0: Start, 1: H1, 2: Meta, 3: Schema, 4: Gold/Done
        }, 1500);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="w-full h-64 bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>

            {/* Central Document */}
            <motion.div
                className={`w-32 h-40 bg-zinc-800 rounded-lg border-2 flex flex-col items-center justify-center relative z-10 transition-colors duration-500 ${step === 4 ? 'border-amber-400 bg-amber-900/10 shadow-[0_0_30px_rgba(251,191,36,0.2)]' : 'border-zinc-700'
                    }`}
                animate={{
                    scale: step === 4 ? 1.05 : 1,
                }}
            >
                <div className="w-20 h-2 bg-zinc-700 rounded mb-2 overflow-hidden">
                    {step >= 1 && <motion.div layoutId="line1" className="h-full bg-emerald-500" />}
                </div>
                <div className="w-24 h-2 bg-zinc-700 rounded mb-2 overflow-hidden">
                    {step >= 2 && <motion.div layoutId="line2" className="h-full bg-emerald-500" />}
                </div>
                <div className="w-24 h-2 bg-zinc-700 rounded mb-2 overflow-hidden">
                    {step >= 3 && <motion.div layoutId="line3" className="h-full bg-emerald-500" />}
                </div>
                <div className="w-16 h-2 bg-zinc-700 rounded overflow-hidden">
                    {step >= 3 && <motion.div layoutId="line4" className="h-full bg-emerald-500" />}
                </div>

                {/* Success Stamp */}
                {step === 4 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="bg-amber-500/90 text-black font-bold px-3 py-1 rounded text-xs tracking-wider transform -rotate-12 border-2 border-amber-300">
                            VENDIBLE
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Floating Injectors */}
            <Injector
                active={step === 1}
                side="left"
                top="20%"
                label="H1 Optimization"
                icon={<TagIcon className="w-4 h-4" />}
                color="text-blue-400"
            />
            <Injector
                active={step === 2}
                side="right"
                top="40%"
                label="Meta Description (CTR)"
                icon={<SparklesIcon className="w-4 h-4" />}
                color="text-purple-400"
            />
            <Injector
                active={step === 3}
                side="left"
                top="60%"
                label="Schema.org JSON-LD"
                icon={<CodeBracketIcon className="w-4 h-4" />}
                color="text-orange-400"
            />

            {/* Status Text */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-xs text-zinc-500 uppercase tracking-widest">
                {step === 0 && "Analizando estructura..."}
                {step === 1 && "Inyectando Semántica..."}
                {step === 2 && "Maximizando CTR..."}
                {step === 3 && "Estructurando Datos..."}
                {step === 4 && <span className="text-amber-500 font-bold animate-pulse">Ready to Rank</span>}
            </div>
        </div>
    );
}

function Injector({ active, side, top, label, icon, color }: { active: boolean, side: 'left' | 'right', top: string, label: string, icon: any, color: string }) {
    return (
        <motion.div
            className={`absolute flex items-center gap-2 ${side === 'left' ? 'left-4 flex-row' : 'right-4 flex-row-reverse'}`}
            style={{ top }}
            initial={{ opacity: 0, x: side === 'left' ? -20 : 20 }}
            animate={{
                opacity: active ? 1 : 0.3,
                x: active ? 0 : (side === 'left' ? -10 : 10),
                scale: active ? 1.1 : 0.9
            }}
        >
            <div className={`p-2 rounded-full bg-zinc-800 border border-zinc-700 ${active ? color : 'text-zinc-600'}`}>
                {icon}
            </div>
            <div className={`text-xs font-semibold ${active ? 'text-zinc-200' : 'text-zinc-600'}`}>
                {label}
            </div>
            {active && (
                <motion.div
                    layoutId="beam"
                    className={`absolute ${side === 'left' ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-12 h-[2px] bg-gradient-to-r from-transparent via-${color.replace('text-', '')} to-transparent`}
                />
            )}
        </motion.div>
    );
}
