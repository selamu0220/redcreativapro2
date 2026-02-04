'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingCardProps {
    title: string;
    description: string;
    price: string;
    period?: string;
    features: PricingFeature[];
    popular?: boolean;
    popularLabel?: string;
    buttonText: string;
    buttonLink?: string;
    onButtonClick?: () => void;
    loading?: boolean;
    testId?: string;
}

export function PricingCard({
    title,
    description,
    price,
    period = '/mo',
    features,
    popular = false,
    popularLabel = 'Popular',
    buttonText,
    buttonLink,
    onButtonClick,
    loading = false,
    testId,
}: PricingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className={cn('relative', popular && 'z-10')}
        >
            <Card
                className={cn(
                    'relative h-full flex flex-col overflow-hidden transition-all',
                    popular
                        ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10'
                        : 'border-border hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg bg-card'
                )}
            >
                {popular && (
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-green-400" />
                )}

                <CardHeader className="pb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        </div>
                        {popular && (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                                <Sparkles className="w-3 h-3 mr-1 fill-current" />
                                {popularLabel}
                            </Badge>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-foreground">
                            {price}
                        </span>
                        {period && (
                            <span className="text-sm font-medium text-muted-foreground">{period}</span>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="flex-grow">
                    <ul className="space-y-4">
                        {features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div
                                    className={cn(
                                        'mt-1 w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                                        feature.included
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-muted text-muted-foreground'
                                    )}
                                >
                                    <Check className="w-3 h-3" />
                                </div>
                                <span
                                    className={cn(
                                        'text-sm',
                                        feature.included ? 'text-foreground/80' : 'text-muted-foreground line-through'
                                    )}
                                >
                                    {feature.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </CardContent>

                <CardFooter className="pt-8">
                    <Button
                        onClick={onButtonClick}
                        asChild={!!buttonLink}
                        disabled={loading}
                        className={cn(
                            'w-full h-12 text-base font-medium transition-all group',
                            popular
                                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        )}
                        data-testid={testId}
                    >
                        {buttonLink ? (
                            <Link href={buttonLink}>
                                {buttonText}
                            </Link>
                        ) : (
                            <span>{buttonText}</span>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
