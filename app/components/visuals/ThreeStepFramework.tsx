'use client';

import React from 'react';

interface ThreeStepFrameworkProps {
    variant?: 'horizontal' | 'vertical';
    className?: string;
}

export function ThreeStepFramework({ variant = 'horizontal', className = '' }: ThreeStepFrameworkProps) {
    const steps = [
        { number: '01', title: 'Investigar', subtitle: 'Keyword Research', icon: '🔍', color: '#8B5CF6' },
        { number: '02', title: 'Generar', subtitle: 'AI Writing', icon: '✨', color: '#3B82F6' },
        { number: '03', title: 'Optimizar', subtitle: 'Human Polish', icon: '🎯', color: '#10B981' }
    ];

    if (variant === 'vertical') {
        return (
            <div className={`relative ${className}`}>
                <svg viewBox="0 0 400 500" className="w-full max-w-md mx-auto">
                    <defs>
                        <linearGradient id="lineGradientV" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="50%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background */}
                    <rect x="0" y="0" width="400" height="500" fill="transparent" />

                    {/* Connecting Line */}
                    <line x1="60" y1="80" x2="60" y2="420" stroke="url(#lineGradientV)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 8" />

                    {steps.map((step, index) => {
                        const y = 60 + index * 170;
                        return (
                            <g key={step.number}>
                                {/* Circle */}
                                <circle cx="60" cy={y + 20} r="30" fill={step.color} opacity="0.2" />
                                <circle cx="60" cy={y + 20} r="22" fill={step.color} filter="url(#glow)" />

                                {/* Number */}
                                <text x="60" y={y + 26} fill="white" fontSize="14" fontWeight="bold" textAnchor="middle">
                                    {step.number}
                                </text>

                                {/* Title */}
                                <text x="110" y={y + 15} fill="white" fontSize="20" fontWeight="bold">
                                    {step.title}
                                </text>

                                {/* Subtitle */}
                                <text x="110" y={y + 38} fill="#9CA3AF" fontSize="14">
                                    {step.subtitle}
                                </text>

                                {/* Icon */}
                                <text x="330" y={y + 28} fontSize="32">
                                    {step.icon}
                                </text>
                            </g>
                        );
                    })}

                    {/* Title */}
                    <text x="200" y="480" fill="#6B7280" fontSize="12" textAnchor="middle" fontStyle="italic">
                        Sela's 3-Step Framework • Red Creativa Pro
                    </text>
                </svg>
            </div>
        );
    }

    // Horizontal variant (default)
    return (
        <div className={`relative ${className}`}>
            <svg viewBox="0 0 800 200" className="w-full">
                <defs>
                    <linearGradient id="lineGradientH" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter id="glowH">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background */}
                <rect x="0" y="0" width="800" height="200" fill="transparent" />

                {/* Connecting Line */}
                <line x1="130" y1="80" x2="670" y2="80" stroke="url(#lineGradientH)" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 6" />

                {steps.map((step, index) => {
                    const x = 130 + index * 270;
                    return (
                        <g key={step.number}>
                            {/* Outer glow circle */}
                            <circle cx={x} cy="80" r="40" fill={step.color} opacity="0.15" />

                            {/* Main circle */}
                            <circle cx={x} cy="80" r="32" fill={step.color} filter="url(#glowH)" />

                            {/* Icon inside circle */}
                            <text x={x} y="90" fontSize="28" textAnchor="middle">
                                {step.icon}
                            </text>

                            {/* Step number badge */}
                            <circle cx={x + 25} cy="55" r="14" fill="#1F2937" stroke={step.color} strokeWidth="2" />
                            <text x={x + 25} y="60" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                                {step.number}
                            </text>

                            {/* Title */}
                            <text x={x} y="145" fill="white" fontSize="18" fontWeight="bold" textAnchor="middle">
                                {step.title}
                            </text>

                            {/* Subtitle */}
                            <text x={x} y="168" fill="#9CA3AF" fontSize="12" textAnchor="middle">
                                {step.subtitle}
                            </text>
                        </g>
                    );
                })}

                {/* Footer branding */}
                <text x="400" y="195" fill="#4B5563" fontSize="10" textAnchor="middle" fontStyle="italic">
                    Sela's 3-Step Framework • Red Creativa Pro
                </text>
            </svg>
        </div>
    );
}
