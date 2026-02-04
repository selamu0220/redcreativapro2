'use client';

import React from 'react';

interface AIMaturityCurveProps {
    highlightStage?: 1 | 2 | 3 | 4 | 5;
    className?: string;
}

const STAGES = [
    { id: 1, label: 'Experimental', description: 'Pruebas aisladas', x: 80, y: 280, color: '#EF4444' },
    { id: 2, label: 'Departamental', description: 'Uso en equipos', x: 200, y: 220, color: '#F97316' },
    { id: 3, label: 'Operacional', description: 'Flujos integrados', x: 350, y: 140, color: '#EAB308' },
    { id: 4, label: 'Estratégico', description: 'Decisiones clave', x: 520, y: 80, color: '#22C55E' },
    { id: 5, label: 'Transformacional', description: 'Modelo de negocio', x: 700, y: 50, color: '#8B5CF6' }
];

export function AIMaturityCurve({ highlightStage, className = '' }: AIMaturityCurveProps) {
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="0 0 800 350" className="w-full">
                <defs>
                    <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="25%" stopColor="#F97316" />
                        <stop offset="50%" stopColor="#EAB308" />
                        <stop offset="75%" stopColor="#22C55E" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                    <filter id="curveShadow">
                        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Grid lines */}
                <g stroke="#374151" strokeWidth="1" opacity="0.3">
                    <line x1="50" y1="300" x2="750" y2="300" />
                    <line x1="50" y1="200" x2="750" y2="200" strokeDasharray="4 4" />
                    <line x1="50" y1="100" x2="750" y2="100" strokeDasharray="4 4" />
                </g>

                {/* Y-axis labels */}
                <text x="35" y="305" fill="#6B7280" fontSize="10" textAnchor="end">Bajo</text>
                <text x="35" y="205" fill="#6B7280" fontSize="10" textAnchor="end">Medio</text>
                <text x="35" y="105" fill="#6B7280" fontSize="10" textAnchor="end">Alto</text>

                {/* Y-axis title */}
                <text x="15" y="200" fill="#9CA3AF" fontSize="11" textAnchor="middle" transform="rotate(-90, 15, 200)">
                    Valor Generado
                </text>

                {/* Area under curve */}
                <path
                    d="M 80 280 Q 140 250 200 220 T 350 140 T 520 80 T 700 50 L 700 300 L 80 300 Z"
                    fill="url(#areaGradient)"
                />

                {/* Main curve */}
                <path
                    d="M 80 280 Q 140 250 200 220 T 350 140 T 520 80 T 700 50"
                    fill="none"
                    stroke="url(#curveGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    filter="url(#curveShadow)"
                />

                {/* Stage points and labels */}
                {STAGES.map((stage) => {
                    const isHighlighted = highlightStage === stage.id;
                    return (
                        <g key={stage.id}>
                            {/* Outer pulse circle for highlighted */}
                            {isHighlighted && (
                                <circle
                                    cx={stage.x}
                                    cy={stage.y}
                                    r="20"
                                    fill={stage.color}
                                    opacity="0.2"
                                >
                                    <animate attributeName="r" values="20;30;20" dur="2s" repeatCount="indefinite" />
                                    <animate attributeName="opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite" />
                                </circle>
                            )}

                            {/* Main point */}
                            <circle
                                cx={stage.x}
                                cy={stage.y}
                                r={isHighlighted ? 14 : 10}
                                fill={stage.color}
                                stroke="white"
                                strokeWidth="3"
                            />

                            {/* Stage number */}
                            <text
                                x={stage.x}
                                y={stage.y + 4}
                                fill="white"
                                fontSize="10"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {stage.id}
                            </text>

                            {/* Label background */}
                            <rect
                                x={stage.x - 45}
                                y={stage.y + 18}
                                width="90"
                                height="38"
                                rx="4"
                                fill={isHighlighted ? stage.color : '#1F2937'}
                                opacity={isHighlighted ? 1 : 0.8}
                            />

                            {/* Label text */}
                            <text
                                x={stage.x}
                                y={stage.y + 34}
                                fill="white"
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                            >
                                {stage.label}
                            </text>
                            <text
                                x={stage.x}
                                y={stage.y + 48}
                                fill={isHighlighted ? 'rgba(255,255,255,0.8)' : '#9CA3AF'}
                                fontSize="9"
                                textAnchor="middle"
                            >
                                {stage.description}
                            </text>
                        </g>
                    );
                })}

                {/* X-axis title */}
                <text x="400" y="340" fill="#9CA3AF" fontSize="11" textAnchor="middle">
                    Madurez de Adopción IA
                </text>

                {/* Branding */}
                <text x="750" y="340" fill="#4B5563" fontSize="9" textAnchor="end" fontStyle="italic">
                    Red Creativa Pro
                </text>
            </svg>
        </div>
    );
}
