'use client';

import { motion } from 'framer-motion';
import { PaperAirplaneIcon, CommandLineIcon, GlobeAltIcon, ServerIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const integrations = [
    { name: 'Make.com', icon: <PaperAirplaneIcon className="w-5 h-5" />, color: 'bg-purple-500', x: -120, y: -60 },
    { name: 'Cursor IDE', icon: <CommandLineIcon className="w-5 h-5" />, color: 'bg-blue-500', x: 120, y: -60 },
    { name: 'WordPress', icon: <GlobeAltIcon className="w-5 h-5" />, color: 'bg-sky-500', x: -120, y: 60 },
    { name: 'Notion API', icon: <ServerIcon className="w-5 h-5" />, color: 'bg-zinc-100 invert', x: 120, y: 60 },
    { name: 'MCP Server', icon: <CircleStackIcon className="w-5 h-5" />, color: 'bg-emerald-500', x: 0, y: 90 },
];

export default function IntegrationShowcase() {
    return (
        <div className="w-full h-80 bg-black rounded-xl border border-zinc-800 relative overflow-hidden flex items-center justify-center">
            {/* Circuit Board Background */}
            <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, #333 1px, transparent 1px)',
                backgroundSize: '24px 24px'
            }} />

            {/* Central Node */}
            <div className="relative z-10 w-24 h-24 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center shadow-2xl shadow-rose-500/20">
                <div className="text-center">
                    <div className="text-2xl">🔴</div>
                    <div className="text-[10px] font-bold text-zinc-400 mt-1">CORE</div>
                </div>

                {/* Pulsing Rings */}
                <div className="absolute inset-0 rounded-full border border-rose-500/30 animate-ping opacity-20" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-4 rounded-full border border-rose-500/10 animate-pulse" />
            </div>

            {/* Nodes */}
            {integrations.map((item, index) => (
                <Node
                    key={index}
                    item={item}
                    index={index}
                />
            ))}
        </div>
    );
}

function Node({ item, index }: { item: any, index: number }) {
    return (
        <motion.div
            className="absolute z-10 flex flex-col items-center gap-2 cursor-pointer group"
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{ x: item.x, y: item.y, opacity: 1 }}
            transition={{ delay: index * 0.2, type: 'spring', stiffness: 100 }}
        >
            {/* Connection Line (SVG) */}
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] -z-10 pointer-events-none">
                <motion.line
                    x1="150"
                    y1="150"
                    x2={150 - item.x} // Inverse logic because we are inside the node relative to center? No, this is tricky.
                    y2={150 - item.y}
                    stroke="#333"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
                {/* Animated Packet */}
                <motion.circle r="3" fill="white">
                    <animateMotion
                        dur={`${2 + index}s`}
                        repeatCount="indefinite"
                        path={`M 150 150 L ${150 - item.x} ${150 - item.y}`}
                    />
                </motion.circle>
            </svg>

            {/* The Icon Node */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${item.color} text-white`}>
                {item.icon}
            </div>
            <span className="text-xs font-mono text-zinc-500 bg-black/50 px-2 py-1 rounded border border-zinc-800">
                {item.name}
            </span>
        </motion.div>
    )
}
