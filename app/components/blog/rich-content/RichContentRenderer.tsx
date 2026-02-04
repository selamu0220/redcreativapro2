import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { RichContentModule } from '@/lib/blog-data';
import { OptimizedImage } from '@/app/components/OptimizedImage';
import { KeyTakeaways } from './KeyTakeaways';
import { ComparisonTable } from './ComparisonTable';
import { ExpertQuote } from './ExpertQuote';
import { ProsCons } from './ProsCons';
import { StepProcess } from './StepProcess';
import { DataCard } from './DataCard';
import { ToolCard } from './ToolCard';
import { AlertBlock } from './AlertBlock';
import { FAQAccordion } from './FAQAccordion';
import { ROICalculator } from '@/app/components/tools/ROICalculator';
import { PromptGenerator } from '@/app/components/tools/PromptGenerator';
import { SEOScoreChecker } from '@/app/components/tools/SEOScoreChecker';
import { ThreeStepFramework } from '@/app/components/visuals/ThreeStepFramework';
import { AIMaturityCurve } from '@/app/components/visuals/AIMaturityCurve';

interface RichContentRendererProps {
    content: RichContentModule[];
}

export function RichContentRenderer({ content }: RichContentRendererProps) {
    return (
        <div className="space-y-8 my-8">
            {content.map((module, index) => {
                switch (module.type) {
                    case 'text':
                        return (
                            <div
                                key={index}
                                className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {module.content}
                                </ReactMarkdown>
                            </div>
                        );

                    case 'image':
                        return (
                            <figure key={index} className="my-8">
                                <div className="relative w-full h-80 md:h-[500px] rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
                                    <OptimizedImage
                                        src={module.src}
                                        alt={module.alt}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {module.caption && (
                                    <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
                                        {module.caption}
                                    </figcaption>
                                )}
                            </figure>
                        );

                    case 'key-takeaways':
                        return <KeyTakeaways key={index} title={module.title} points={module.points} />;

                    case 'comparison-table':
                        return <ComparisonTable key={index} {...module} />;

                    case 'expert-quote':
                        return <ExpertQuote key={index} {...module} />;

                    case 'pros-cons':
                        return <ProsCons key={index} {...module} />;

                    case 'step-process':
                        return <StepProcess key={index} {...module} />;

                    case 'data-card':
                        return <DataCard key={index} {...module} />;

                    case 'tool-card':
                        return <ToolCard key={index} {...module} />;

                    case 'alert':
                        return <AlertBlock key={index} {...module} />;

                    case 'faq-accordion':
                        return <FAQAccordion key={index} {...module} />;

                    case 'roi-calculator':
                        return <div key={index} className="my-12"><ROICalculator defaultArticleCount={module.defaultArticleCount} defaultCost={module.defaultCost} /></div>;

                    case 'prompt-generator':
                        return <div key={index} className="my-12"><PromptGenerator category={module.category} /></div>;

                    case 'seo-score-checker':
                        return <div key={index} className="my-12"><SEOScoreChecker showEmailCapture={module.showEmailCapture} /></div>;

                    case 'three-step-framework':
                        return <div key={index} className="my-12"><ThreeStepFramework variant={module.variant} /></div>;

                    case 'ai-maturity-curve':
                        return <div key={index} className="my-12"><AIMaturityCurve highlightStage={module.highlightStage} /></div>;

                    default:
                        return null;
                }
            })}
        </div>
    );
}
