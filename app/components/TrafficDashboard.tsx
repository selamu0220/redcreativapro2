'use client';

/**
 * Traffic Accelerator Dashboard Component
 * 
 * Displays traffic analysis, SEO opportunities, and growth strategy
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Target, Zap, CheckCircle2, Clock, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    TrafficAcceleratorService,
    type TrafficStrategy,
    type SEOOpportunity,
} from '@/app/lib/traffic-accelerator';
import {
    TrafficReportingService,
    type MonthlyReport,
    type ProgressSnapshot,
} from '@/app/lib/traffic-reporting';

interface TrafficDashboardProps {
    userId: string;
}

export function TrafficDashboard({ userId }: TrafficDashboardProps) {
    const [strategy, setStrategy] = useState<TrafficStrategy | null>(null);
    const [progress, setProgress] = useState<ProgressSnapshot | null>(null);
    const [loading, setLoading] = useState(true);

    const trafficService = new TrafficAcceleratorService();
    const reportingService = new TrafficReportingService();

    useEffect(() => {
        loadData();
    }, [userId]);

    const loadData = async () => {
        setLoading(true);

        try {
            // Load strategy
            const userStrategy = await trafficService.generateUserStrategy(userId, 10000, 6);
            setStrategy(userStrategy);

            // Load progress
            const goal = await reportingService.createGoal(userId, 10000, 6, 1500);
            const currentProgress = reportingService.calculateProgress(goal, 2500, 2);
            setProgress(currentProgress);
        } catch (error) {
            console.error('Failed to load traffic data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Analizando tu tráfico...</p>
                </div>
            </div>
        );
    }

    if (!strategy || !progress) {
        return (
            <div className="text-center p-12">
                <p className="text-muted-foreground">No se pudo cargar la estrategia de tráfico</p>
            </div>
        );
    }

    const progressPercentage = (progress.monthlyVisitors / strategy.goal.targetMonthlyVisitors) * 100;

    return (
        <div className="space-y-6">
            {/* Goal Overview */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Tu Objetivo de Tráfico
                            </CardTitle>
                            <CardDescription>
                                De {strategy.goal.currentVisitors.toLocaleString()} a{' '}
                                {strategy.goal.targetMonthlyVisitors.toLocaleString()} visitantes/mes
                            </CardDescription>
                        </div>

                        <Badge variant={progress.onTrack ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                            {progress.onTrack ? '✓ En camino' : '⚠ Ajustar plan'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progreso Actual</span>
                            <span className="text-2xl font-bold text-primary">
                                {progress.monthlyVisitors.toLocaleString()}
                            </span>
                        </div>

                        <Progress value={progressPercentage} className="h-3" />

                        <p className="text-xs text-muted-foreground mt-2">
                            {progress.onTrack
                                ? `¡Excelente! Estás ${Math.abs(progress.behindAhead)} visitantes por encima del objetivo`
                                : `Necesitas ${Math.abs(progress.behindAhead)} visitantes más para estar en camino`}
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <p className="text-xs text-muted-foreground">Tasa de Crecimiento</p>
                            <p className="text-2xl font-bold">+{progress.growthRate.toFixed(1)}%</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Objetivo Mensual</p>
                            <p className="text-2xl font-bold">+{strategy.goal.requiredGrowthRate.toFixed(1)}%</p>
                        </div>

                        <div>
                            <p className="text-xs text-muted-foreground">Proyección Final</p>
                            <p className="text-2xl font-bold">{progress.projectedFinalVisitors.toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Wins */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        Quick Wins - Alto Impacto, Bajo Esfuerzo
                    </CardTitle>
                    <CardDescription>
                        Implementa estas acciones primero para resultados rápidos
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-4">
                        {strategy.quickWins.slice(0, 3).map((opportunity) => (
                            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Roadmap */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Hoja de Ruta - Próximos 6 Meses
                    </CardTitle>
                    <CardDescription>
                        Plan mensual para alcanzar tu objetivo
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        {strategy.prioritizedRoadmap.map((monthPlan) => (
                            <div key={monthPlan.month} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="rounded-full bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center font-bold">
                                        M{monthPlan.month}
                                    </div>
                                    {monthPlan.month < strategy.prioritizedRoadmap.length && (
                                        <div className="w-0.5 h-full bg-border mt-2" />
                                    )}
                                </div>

                                <div className="flex-1 pb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-semibold">Mes {monthPlan.month}</h4>
                                        <Badge variant="outline">
                                            {monthPlan.expectedVisitors.toLocaleString()} visitantes
                                        </Badge>
                                    </div>

                                    <ul className="space-y-2">
                                        {monthPlan.actions.map((action) => (
                                            <li key={action.id} className="text-sm text-muted-foreground flex items-start gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                {action.title}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* All Opportunities */}
            <Card>
                <CardHeader>
                    <CardTitle>Todas las Oportunidades SEO</CardTitle>
                    <CardDescription>
                        {strategy.opportunities.length} acciones identificadas, ordenadas por prioridad
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="space-y-3">
                        {strategy.opportunities.map((opportunity) => (
                            <OpportunityCard key={opportunity.id} opportunity={opportunity} detailed />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function OpportunityCard({
    opportunity,
    detailed = false,
}: {
    opportunity: SEOOpportunity;
    detailed?: boolean;
}) {
    const [expanded, setExpanded] = useState(false);

    const impactColor = {
        low: 'text-gray-500',
        medium: 'text-yellow-500',
        high: 'text-green-500',
    }[opportunity.impact];

    const effortColor = {
        low: 'text-green-500',
        medium: 'text-yellow-500',
        high: 'text-red-500',
    }[opportunity.effort];

    return (
        <div className="rounded-lg border p-4 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{opportunity.title}</h4>
                        <Badge variant="outline" className="text-xs">
                            {opportunity.type}
                        </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                        {opportunity.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Impacto:</span>
                            <span className={`font-semibold ${impactColor}`}>
                                {opportunity.impact.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Esfuerzo:</span>
                            <span className={`font-semibold ${effortColor}`}>
                                {opportunity.effort.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <ArrowUp className="h-3 w-3 text-primary" />
                            <span className="font-semibold text-primary">
                                +{opportunity.estimatedTrafficIncrease}%
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">Prioridad:</span>
                            <span className="font-semibold">{opportunity.priority}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {detailed && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full justify-start text-xs"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? '− Ocultar pasos' : '+ Ver pasos de implementación'}
                    </Button>

                    {expanded && (
                        <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">
                                Pasos para implementar:
                            </p>
                            <ol className="space-y-2">
                                {opportunity.steps.map((step, index) => (
                                    <li key={index} className="text-sm flex gap-2">
                                        <span className="text-muted-foreground font-mono">{index + 1}.</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
