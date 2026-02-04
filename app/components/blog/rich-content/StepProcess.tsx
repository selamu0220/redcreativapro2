import React from 'react';
import { cn } from '@/lib/utils';
import * as Icons from 'lucide-react';

interface StepProcessProps {
    title?: string;
    steps: {
        title: string;
        description: string;
        icon?: string;
    }[];
}

export function StepProcess({ title, steps }: StepProcessProps) {
    return (
        <div className="my-12">
            {title && (
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                    {title}
                </h3>
            )}

            <div className="relative space-y-8">
                {/* Connection Line */}
                <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800" />

                {steps.map((step, index) => {
                    // Dynamic Icon Rendering
                    const IconComponent = step.icon && (Icons as any)[step.icon]
                        ? (Icons as any)[step.icon]
                        : Icons.Circle;

                    return (
                        <div key={index} className="relative flex gap-6">
                            {/* Step Number/Icon */}
                            <div className="relative flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-gray-900 border-2 border-blue-500 flex items-center justify-center z-10 shadow-sm">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                    {step.icon ? <IconComponent className="w-5 h-5" /> : index + 1}
                                </span>
                            </div>

                            {/* Step Content */}
                            <div className="pt-2 pb-6">
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {step.title}
                                </h4>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
