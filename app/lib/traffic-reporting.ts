/**
 * Traffic Reporting System
 * 
 * Tracks traffic goals, generates reports, and adjusts strategies based on progress.
 * 
 * Requirements: 11.4, 11.5
 */

import { TrafficMetrics, TrafficStrategy } from './traffic-accelerator';

export interface TrafficGoal {
    id: string;
    userId: string;
    targetMonthlyVisitors: number;
    timeframeMonths: number;
    startDate: Date;
    endDate: Date;
    initialVisitors: number;
    status: 'active' | 'completed' | 'paused' | 'failed';
}

export interface ProgressSnapshot {
    date: Date;
    monthlyVisitors: number;
    growthRate: number; // Percentage from previous month
    behindAhead: number; // Visitors behind/ahead of target
    projectedFinalVisitors: number;
    onTrack: boolean;
}

export interface ImplementedAction {
    id: string;
    opportunityId: string;
    title: string;
    implementedDate: Date;
    category: string;
    estimatedImpact: number; // Percentage
    actualImpact?: number; // Measured after implementation
    status: 'planned' | 'in-progress' | 'completed' | 'measuring';
}

export interface MonthlyReport {
    month: number;
    startDate: Date;
    endDate: Date;
    metrics: {
        visitors: number;
        growthFromPrevious: number; // Percentage
        growthFromStart: number; // Percentage
        targetVisitors: number;
        variance: number; // Difference from target
    };
    implementedActions: ImplementedAction[];
    topWins: Array<{
        action: string;
        impact: number;
        trafficIncrease: number;
    }>;
    nextSteps: string[];
    strategyAdjustments: string[];
    roi: {
        timeInvested: number; // Hours
        trafficGained: number;
        valuePerVisitor: number; // Estimated in euros
        totalValue: number;
    };
}

export interface FullReport {
    goal: TrafficGoal;
    currentProgress: ProgressSnapshot;
    monthlyReports: MonthlyReport[];
    overallSummary: {
        totalVisitorsGained: number;
        averageMonthlyGrowth: number;
        totalActionsImplemented: number;
        roi: {
            totalTimeInvested: number;
            totalTrafficGained: number;
            totalValue: number;
        };
        topPerformingActions: Array<{
            title: string;
            impact: number;
            category: string;
        }>;
    };
    recommendations: string[];
}

/**
 * Service for tracking traffic goals and generating reports
 */
export class TrafficReportingService {
    /**
     * Create a new traffic goal
     */
    async createGoal(
        userId: string,
        targetMonthlyVisitors: number,
        timeframeMonths: number,
        initialVisitors: number
    ): Promise<TrafficGoal> {
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + timeframeMonths);

        return {
            id: `goal-${Date.now()}-${userId}`,
            userId,
            targetMonthlyVisitors,
            timeframeMonths,
            startDate,
            endDate,
            initialVisitors,
            status: 'active',
        };
    }

    /**
     * Calculate current progress toward goal
     */
    calculateProgress(
        goal: TrafficGoal,
        currentVisitors: number,
        monthsElapsed: number
    ): ProgressSnapshot {
        const expectedProgressRate = monthsElapsed / goal.timeframeMonths;
        const expectedVisitors =
            goal.initialVisitors +
            (goal.targetMonthlyVisitors - goal.initialVisitors) * expectedProgressRate;

        const actualProgress = currentVisitors - goal.initialVisitors;
        const expectedProgress = expectedVisitors - goal.initialVisitors;
        const behindAhead = actualProgress - expectedProgress;

        // Project final visitors based on current growth rate
        const monthlyGrowthRate =
            actualProgress / goal.initialVisitors / monthsElapsed;
        const projectedFinalVisitors =
            goal.initialVisitors * Math.pow(1 + monthlyGrowthRate, goal.timeframeMonths);

        const growthRate =
            monthsElapsed > 0
                ? ((currentVisitors - goal.initialVisitors) / goal.initialVisitors) * 100
                : 0;

        return {
            date: new Date(),
            monthlyVisitors: currentVisitors,
            growthRate,
            behindAhead: Math.round(behindAhead),
            projectedFinalVisitors: Math.round(projectedFinalVisitors),
            onTrack: behindAhead >= 0,
        };
    }

    /**
     * Track an implemented action
     */
    async trackAction(
        goalId: string,
        opportunityId: string,
        title: string,
        category: string,
        estimatedImpact: number
    ): Promise<ImplementedAction> {
        return {
            id: `action-${Date.now()}-${opportunityId}`,
            opportunityId,
            title,
            implementedDate: new Date(),
            category,
            estimatedImpact,
            status: 'completed',
        };
    }

    /**
     * Measure actual impact of an action (after sufficient time has passed)
     */
    async measureActionImpact(
        actionId: string,
        beforeVisitors: number,
        afterVisitors: number
    ): Promise<number> {
        const growthRate = ((afterVisitors - beforeVisitors) / beforeVisitors) * 100;
        return Math.round(growthRate * 10) / 10; // Round to 1 decimal
    }

    /**
     * Generate monthly report
     */
    generateMonthlyReport(
        month: number,
        goal: TrafficGoal,
        previousVisitors: number,
        currentVisitors: number,
        actions: ImplementedAction[]
    ): MonthlyReport {
        const startDate = new Date(goal.startDate);
        startDate.setMonth(startDate.getMonth() + month - 1);

        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);

        const growthFromPrevious =
            previousVisitors > 0
                ? ((currentVisitors - previousVisitors) / previousVisitors) * 100
                : 0;

        const growthFromStart =
            ((currentVisitors - goal.initialVisitors) / goal.initialVisitors) * 100;

        const monthsElapsed = month;
        const expectedProgressRate = monthsElapsed / goal.timeframeMonths;
        const targetVisitors =
            goal.initialVisitors +
            (goal.targetMonthlyVisitors - goal.initialVisitors) * expectedProgressRate;

        // Identify top wins
        const completedActions = actions.filter(a => a.actualImpact !== undefined);
        const topWins = completedActions
            .sort((a, b) => (b.actualImpact || 0) - (a.actualImpact || 0))
            .slice(0, 3)
            .map(action => ({
                action: action.title,
                impact: action.actualImpact || 0,
                trafficIncrease: Math.round(currentVisitors * (action.actualImpact || 0) / 100),
            }));

        // Determine next steps
        const variance = currentVisitors - targetVisitors;
        const nextSteps: string[] = [];

        if (variance < 0) {
            nextSteps.push('Acelerar implementación de acciones de alto impacto');
            nextSteps.push('Revisar y optimizar acciones ya implementadas');
            nextSteps.push('Considerar tácticas adicionales de crecimiento rápido');
        } else {
            nextSteps.push('Mantener el ritmo actual de implementación');
            nextSteps.push('Documentar estrategias exitosas para replicar');
            nextSteps.push('Explorar oportunidades de optimización adicional');
        }

        // Strategy adjustments
        const strategyAdjustments: string[] = [];

        if (growthFromPrevious < 5) {
            strategyAdjustments.push('Incrementar frecuencia de publicación de contenido');
            strategyAdjustments.push('Revisar estrategia de keywords');
        }

        if (topWins.length > 0) {
            strategyAdjustments.push(
                `Escalar tácticas similares a "${topWins[0].action}"`
            );
        }

        // Calculate ROI
        const avgTimePerAction = 4; // hours
        const timeInvested = actions.length * avgTimePerAction;
        const trafficGained = currentVisitors - previousVisitors;
        const valuePerVisitor = 0.5; // €0.50 per visitor (conservative estimate)
        const totalValue = trafficGained * valuePerVisitor;

        return {
            month,
            startDate,
            endDate,
            metrics: {
                visitors: currentVisitors,
                growthFromPrevious: Math.round(growthFromPrevious * 10) / 10,
                growthFromStart: Math.round(growthFromStart * 10) / 10,
                targetVisitors: Math.round(targetVisitors),
                variance: Math.round(variance),
            },
            implementedActions: actions,
            topWins,
            nextSteps,
            strategyAdjustments,
            roi: {
                timeInvested,
                trafficGained,
                valuePerVisitor,
                totalValue: Math.round(totalValue * 100) / 100,
            },
        };
    }

    /**
     * Generate comprehensive report with all months
     */
    async generateFullReport(
        goalId: string,
        monthlyData: Array<{
            month: number;
            visitors: number;
            actions: ImplementedAction[];
        }>
    ): Promise<Partial<FullReport>> {
        // In production, fetch goal from database
        const goal: TrafficGoal = {
            id: goalId,
            userId: 'user-123',
            targetMonthlyVisitors: 10000,
            timeframeMonths: 6,
            startDate: new Date(),
            endDate: new Date(),
            initialVisitors: 1500,
            status: 'active',
        };

        const monthlyReports: MonthlyReport[] = [];
        let previousVisitors = goal.initialVisitors;

        for (const data of monthlyData) {
            const report = this.generateMonthlyReport(
                data.month,
                goal,
                previousVisitors,
                data.visitors,
                data.actions
            );
            monthlyReports.push(report);
            previousVisitors = data.visitors;
        }

        // Calculate overall summary
        const currentVisitors = monthlyData[monthlyData.length - 1]?.visitors || goal.initialVisitors;
        const totalVisitorsGained = currentVisitors - goal.initialVisitors;

        const averageMonthlyGrowth = monthlyReports.reduce(
            (sum, report) => sum + report.metrics.growthFromPrevious,
            0
        ) / monthlyReports.length;

        const allActions = monthlyReports.flatMap(r => r.implementedActions);
        const totalActionsImplemented = allActions.length;

        const totalTimeInvested = monthlyReports.reduce(
            (sum, report) => sum + report.roi.timeInvested,
            0
        );

        const totalValue = monthlyReports.reduce(
            (sum, report) => sum + report.roi.totalValue,
            0
        );

        // Identify top performing actions across all months
        const actionsWithImpact = allActions.filter(a => a.actualImpact !== undefined);
        const topPerformingActions = actionsWithImpact
            .sort((a, b) => (b.actualImpact || 0) - (a.actualImpact || 0))
            .slice(0, 5)
            .map(action => ({
                title: action.title,
                impact: action.actualImpact || 0,
                category: action.category,
            }));

        // Generate recommendations
        const currentProgress = this.calculateProgress(
            goal,
            currentVisitors,
            monthlyData.length
        );

        const recommendations: string[] = [];

        if (!currentProgress.onTrack) {
            recommendations.push(
                `Estás ${Math.abs(currentProgress.behindAhead)} visitantes por debajo del objetivo. ` +
                'Considera implementar quick wins adicionales.'
            );
        } else {
            recommendations.push(
                `¡Excelente progreso! Estás ${currentProgress.behindAhead} visitantes por encima del objetivo.`
            );
        }

        if (topPerformingActions.length > 0) {
            recommendations.push(
                `Tu acción más efectiva fue "${topPerformingActions[0].title}" ` +
                `con ${topPerformingActions[0].impact}% de impacto. Busca replicar este éxito.`
            );
        }

        if (averageMonthlyGrowth < 10) {
            recommendations.push(
                'El crecimiento mensual promedio está por debajo del 10%. ' +
                'Aumenta la inversión en link building y creación de contenido.'
            );
        }

        return {
            goal,
            currentProgress,
            monthlyReports,
            overallSummary: {
                totalVisitorsGained,
                averageMonthlyGrowth: Math.round(averageMonthlyGrowth * 10) / 10,
                totalActionsImplemented,
                roi: {
                    totalTimeInvested,
                    totalTrafficGained: totalVisitorsGained,
                    totalValue: Math.round(totalValue * 100) / 100,
                },
                topPerformingActions,
            },
            recommendations,
        };
    }

    /**
     * Adjust strategy based on current progress
     */
    async adjustStrategy(
        goalId: string,
        currentProgress: ProgressSnapshot,
        originalStrategy: TrafficStrategy
    ): Promise<TrafficStrategy> {
        // If behind schedule, prioritize quick wins
        if (!currentProgress.onTrack) {
            const quickWins = originalStrategy.opportunities.filter(
                opp => opp.effort === 'low' && opp.impact === 'high'
            );

            return {
                ...originalStrategy,
                quickWins,
                prioritizedRoadmap: originalStrategy.prioritizedRoadmap.map(
                    (roadmapItem, index) => ({
                        ...roadmapItem,
                        actions: index === 0
                            ? [...quickWins, ...roadmapItem.actions].slice(0, 4)
                            : roadmapItem.actions,
                    })
                ),
            };
        }

        // If ahead, can afford to invest in long-term actions
        return originalStrategy;
    }
}
