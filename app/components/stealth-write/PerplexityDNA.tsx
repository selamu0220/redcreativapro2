'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PerplexityDNAProps {
    score: number; // 0-100 (Humanity Score)
    isAnalyzing: boolean;
    className?: string;
}

export function PerplexityDNA({ score, isAnalyzing, className = "" }: PerplexityDNAProps) {
    const [bars, setBars] = useState<number[]>(Array(30).fill(50));

    // Determine state based on score
    const isSafe = score >= 75;
    const isRisk = score < 50;

    // Colors
    const safeColor = "bg-emerald-500";
    const mediumColor = "bg-amber-500";
    const riskColor = "bg-red-500";

    const activeColor = isSafe ? safeColor : isRisk ? riskColor : mediumColor;

    useEffect(() => {
        if (isAnalyzing) {
            // Chaos mode during analysis
            const interval = setInterval(() => {
                setBars(prev => prev.map(() => Math.random() * 100));
            }, 100);
            return () => clearInterval(interval);
        } else {
            // Stable pattern based on score
            // If high score -> smooth wave
            // If low score -> spiky static
            const newBars = Array.from({ length: 30 }).map((_, i) => {
                if (isSafe) {
                    // Smooth Sine Wave
                    return 30 + Math.sin(i * 0.5) * 20 + Math.random() * 10;
                } else {
                    // Spiky Static
                    return Math.random() * 80 + 10;
                }
            });
            setBars(newBars);
        }
    }, [isAnalyzing, score, isSafe]);

    return (
        <div className={`flex items-end justify-between h-16 w-full gap-[2px] opacity-90 ${className}`}>
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    className={`rounded-t-sm w-full ${activeColor} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                    initial={{ height: "20%" }}
                    animate={{
                        height: `${height}%`,
                        opacity: isAnalyzing ? [0.5, 1, 0.5] : 1,
                        backgroundColor: isSafe ? undefined : isRisk && Math.random() > 0.8 ? '#ef4444' : undefined
                    }}
                    transition={{
                        type: "spring",
                        stiffness: isSafe ? 50 : 300,
                        damping: isSafe ? 15 : 5,
                        mass: 1,
                        repeat: isAnalyzing ? Infinity : 0
                    }}
                />
            ))}
        </div>
    );
}
