'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface KnowledgeGraphVizProps {
    entityCount: number; // Number of entities detected
    isAnalyzing: boolean;
}

export function KnowledgeGraphViz({ entityCount, isAnalyzing }: KnowledgeGraphVizProps) {
    // Generate nodes based on entity count (max 15 for aesthetics)
    // If analyzing, show chaotic spinning nodes

    // We simulate a graph with fixed positions for stability, but varying visibility
    const nodes = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 6 + 4
    }));

    return (
        <div className="relative w-full h-40 bg-zinc-950/50 rounded-lg border border-zinc-900 overflow-hidden shadow-inner group">
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_14px]" />

            {/* Central Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <motion.div
                    className="w-12 h-12 rounded-full border-2 border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center relative z-10"
                    animate={{ scale: isAnalyzing ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                </motion.div>
                {/* Radar Scan Effect */}
                <motion.div
                    className="absolute top-1/2 left-1/2 w-40 h-40 border-r border-indigo-500/20 rounded-full from-indigo-500/0 to-indigo-500/10 bg-gradient-to-t origin-bottom-left"
                    style={{ x: '-50%', y: '-50%' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                />
            </div>

            {/* Nodes */}
            {nodes.map((node, i) => {
                // Show node if index < entityCount
                const visible = i < entityCount || isAnalyzing;

                return (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-indigo-400/50 bg-zinc-950 flex items-center justify-center z-20"
                        style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                            width: node.size * 2,
                            height: node.size * 2,
                        }}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: visible ? 1 : 0.1,
                            scale: visible ? 1 : 0.5,
                            boxShadow: visible ? `0 0 ${node.size * 2}px rgba(99, 102, 241, 0.4)` : 'none'
                        }}
                    >
                        <div className={`w-1 h-1 rounded-full ${visible ? 'bg-indigo-400' : 'bg-zinc-800'}`} />

                        {/* Connecting Lines (Simulated) */}
                        {visible && (
                            <svg className="absolute top-1/2 left-1/2 w-40 h-40 pointer-events-none opacity-20 overflow-visible" style={{ transform: 'translate(-50%, -50%)' }}>
                                <line x1="50%" y1="50%" x2={`${50 + (Math.random() - 0.5) * 100}%`} y2={`${50 + (Math.random() - 0.5) * 100}%`} stroke="currentColor" strokeWidth="1" className="text-indigo-500" />
                            </svg>
                        )}
                    </motion.div>
                );
            })}

            {/* Stats Overlay */}
            <div className="absolute bottom-2 right-2 text-[10px] uppercase font-mono text-indigo-400/60 font-bold bg-zinc-950/80 px-2 py-1 rounded border border-indigo-500/20 backdrop-blur-sm">
                Graph Nodes: {entityCount > 15 ? '15+' : entityCount}
            </div>
        </div>
    );
}
