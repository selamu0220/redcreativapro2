'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    Activity, ArrowUpRight, ArrowDownRight, Users,
    MousePointer, Search, DollarSign, ExternalLink, Target, Info
} from 'lucide-react';
import { TiltCard } from '@/app/components/TiltCard';

// --- Interfaces ---
interface AnalyticsData {
    timestamp: string;
    metrics: {
        activeUsers: number;
        gscImpressions: number;
        gscClicks: number;
        gscCtr: number;
        gscPosition: number;
        subscribers: number;
        mrr: number;
        newSubscribers: number;
        churnedSubscribers: number;
        conversionRate: number;
        churnRate: number;
    };
    trends: {
        traffic: { date: string; visitors: number }[];
        gsc: { date: string; clicks: number; impressions: number }[];
    };
    pageViews: { path: string; views: number }[];
    devices: { name: string; value: number }[];
    countries: { name: string; value: number; code: string }[];
    topPages: { path: string; impressions: number; clicks: number; ctr: number; position: number }[];
    queries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
    _debug?: any;
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
const TARGET_MRR = 1000;

export default function FounderAnalyticsDashboard() {
    const [dateRange, setDateRange] = useState('7d');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/founder/analytics/route?range=${dateRange}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [dateRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!data) return null;

    // --- Goal Tracking Logic ---
    const currentMRR = data.metrics.mrr;
    const progress = Math.min((currentMRR / TARGET_MRR) * 100, 100);
    // Calcular ARPU (Average Revenue Per User) o usar fallback
    const arpu = data.metrics.subscribers > 0 ? currentMRR / data.metrics.subscribers : 29;
    const remainingMRR = Math.max(TARGET_MRR - currentMRR, 0);
    const subscribersNeeded = Math.ceil(remainingMRR / arpu);

    // Evitar división por cero y usar valores conservadores por defecto si no hay datos
    const safeConversionRate = data.metrics.conversionRate > 0 ? data.metrics.conversionRate : 1.0;
    const safeCTR = data.metrics.gscCtr > 0 ? data.metrics.gscCtr : 2.0;

    // Calculos inversos
    const visitorsNeeded = Math.ceil(subscribersNeeded / (safeConversionRate / 100));
    const impressionsNeeded = Math.ceil(visitorsNeeded / (safeCTR / 100));

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-6 md:p-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-border pb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
                            Dashboard
                        </h1>
                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-2 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                                En vivo
                            </span>
                            <span>Actualizado: {new Date(data.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>

                    <div className="flex bg-muted p-1 rounded-lg">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${dateRange === range
                                        ? 'bg-background text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                    }`}
                            >
                                {range === '24h' ? 'Hoy' : range === '7d' ? '7 días' : range === '30d' ? '30 días' : '90 días'}
                            </button>
                        ))}
                    </div>
                </header>

                {/* Road to 1k Section */}
                <div className="bg-card rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                        <Target className="w-64 h-64 text-foreground" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2">
                                    <Target className="w-6 h-6 text-primary" />
                                    Misión: 1000€ MRR
                                </h3>
                                <p className="text-muted-foreground mt-1">Tu progreso actual para lograr la libertad financiera con este proyecto.</p>
                            </div>
                            <div className="text-left md:text-right">
                                <span className="text-4xl font-extrabold text-primary">{progress.toFixed(1)}%</span>
                                <p className="text-sm font-medium text-muted-foreground">
                                    {currentMRR.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} / {TARGET_MRR}€
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-6 bg-muted rounded-full overflow-hidden mb-8 shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${Math.max(progress, 2)}%` }} // Min 2% visibility
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                            </div>
                        </div>

                        {/* Projections Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ProjectionCard
                                label="Suscriptores Faltantes"
                                value={subscribersNeeded}
                                subtext={`Basado en ARPU de ~${arpu.toFixed(0)}€`}
                                icon={<Users className="w-5 h-5 text-blue-500" />}
                            />
                            <ProjectionCard
                                label="Visitas Web Necesarias"
                                value={visitorsNeeded.toLocaleString()}
                                subtext={`Si mantienes ${safeConversionRate}% conversion`}
                                icon={<MousePointer className="w-5 h-5 text-purple-500" />}
                            />
                            <ProjectionCard
                                label="Impresiones GSC Estimadas"
                                value={impressionsNeeded.toLocaleString()}
                                subtext={`Asumiendo ${safeCTR}% CTR constante`}
                                icon={<Search className="w-5 h-5 text-pink-500" />}
                            />
                        </div>

                        <div className="mt-6 flex items-start gap-3 text-sm text-muted-foreground bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <Info className="w-5 h-5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                            <p>
                                <span className="font-semibold text-blue-700 dark:text-blue-300">¿Cómo llegar antes?</span> Estas proyecciones son matemáticas puras.
                                Si mejoras tu <span className="font-semibold">CTR</span> (mejores títulos SEO) o tu <span className="font-semibold">Conversión</span> (mejor copy en landing),
                                necesitarás mucho menos tráfico para llegar al objetivo. ¡Optimiza el embudo!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Impresiones"
                        value={data.metrics.gscImpressions.toLocaleString()}
                        subValue="+12% vs periodo anterior"
                        color="text-blue-600 dark:text-blue-400"
                        icon={<Search className="w-5 h-5 opacity-70" />}
                    />
                    <MetricCard
                        title="Clicks Orgánicos"
                        value={data.metrics.gscClicks.toLocaleString()}
                        subValue={`${data.metrics.gscCtr}% CTR Promedio`}
                        color="text-purple-600 dark:text-purple-400"
                        icon={<MousePointer className="w-5 h-5 opacity-70" />}
                    />
                    <MetricCard
                        title="Suscriptores Activos"
                        value={data.metrics.subscribers.toString()}
                        subValue={`+${data.metrics.newSubscribers} nuevos este mes`}
                        color="text-green-600 dark:text-green-400"
                        icon={<Users className="w-5 h-5 opacity-70" />}
                    />
                    <MetricCard
                        title="MRR Mensual"
                        value={data.metrics.mrr.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        subValue="Ingresos recurrentes"
                        color="text-orange-600 dark:text-orange-400"
                        icon={<DollarSign className="w-5 h-5 opacity-70" />}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Chart */}
                    <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold">Rendimiento de Búsqueda</h3>
                            <ExternalLink className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                        </div>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.trends.gsc}>
                                    <defs>
                                        <linearGradient id="colorImp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        dy={10}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            padding: '12px'
                                        }}
                                        itemStyle={{ color: 'hsl(var(--card-foreground))', fontSize: '13px', fontWeight: 500 }}
                                    />
                                    <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="impressions"
                                        stroke="hsl(var(--primary))"
                                        fill="url(#colorImp)"
                                        name="Impresiones"
                                        strokeWidth={2}
                                    />
                                    <Area
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="hsl(var(--secondary))"
                                        fill="url(#colorClick)"
                                        name="Clicks"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Secondary Metrics / Pie */}
                    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col">
                        <h3 className="text-xl font-bold mb-8">Dispositivos</h3>
                        <div className="flex-1 min-h-[250px] relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.devices}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.devices.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        itemStyle={{ color: 'hsl(var(--card-foreground))' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-muted-foreground/20">
                                    <MousePointer className="w-8 h-8" />
                                </span>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-muted-foreground">Conversión</span>
                                <span className="text-lg font-bold">{data.metrics.conversionRate}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min(data.metrics.conversionRate * 5, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <TableCard title="Top Búsquedas (Queries)">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-muted-foreground border-b border-border text-left">
                                    <th className="pb-3 font-medium pl-4">Query</th>
                                    <th className="pb-3 font-medium text-right">Impresiones</th>
                                    <th className="pb-3 font-medium text-right">Clicks</th>
                                    <th className="pb-3 font-medium text-right pr-4">Pos.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.queries.slice(0, 5).map((q, i) => (
                                    <tr key={i} className="group hover:bg-muted/50 transition-colors">
                                        <td className="py-3 pl-4 font-medium">{q.query}</td>
                                        <td className="py-3 text-right text-muted-foreground">{q.impressions}</td>
                                        <td className="py-3 text-right">{q.clicks}</td>
                                        <td className="py-3 pr-4 text-right font-mono text-muted-foreground group-hover:text-primary transition-colors">
                                            #{q.position.toFixed(1)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableCard>

                    <TableCard title="Páginas Más Visitadas">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-muted-foreground border-b border-border text-left">
                                    <th className="pb-3 font-medium pl-4">Página</th>
                                    <th className="pb-3 font-medium text-right">Clicks</th>
                                    <th className="pb-3 font-medium text-right pr-4">CTR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {data.topPages.slice(0, 5).map((page, i) => (
                                    <tr key={i} className="group hover:bg-muted/50 transition-colors">
                                        <td className="py-3 pl-4 font-medium truncate max-w-[200px]" title={page.path}>
                                            {page.path.replace('https://www.redcreativa.pro', '') || '/'}
                                        </td>
                                        <td className="py-3 text-right">{page.clicks}</td>
                                        <td className="py-3 pr-4 text-right">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${page.ctr > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    'bg-muted text-muted-foreground'
                                                }`}>
                                                {page.ctr}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableCard>
                </div>

                {/* Sub-Metrics Grid (Bottom) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Churn Rate</p>
                        <p className="text-xl font-bold mt-1 text-red-500">{data.metrics.churnRate}%</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Cancelaciones</p>
                        <p className="text-xl font-bold mt-1">{data.metrics.churnedSubscribers}</p>
                    </div>
                    {/* Add more usage metrics if needed */}
                </div>

                {data._debug && Object.keys(data._debug).some(k => data._debug[k]) && (
                    <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-lg">
                        <h4 className="text-red-700 dark:text-red-400 text-sm font-bold mb-2">Debug Info</h4>
                        <pre className="text-xs text-red-600 dark:text-red-300 overflow-auto max-h-40">
                            {JSON.stringify(data._debug, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ title, value, subValue, color, icon }: any) {
    return (
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
                {icon}
            </div>
            <div className="flex flex-col">
                <span className={`text-3xl font-extrabold tracking-tight ${color || 'text-foreground'}`}>
                    {value}
                </span>
                <span className="text-xs text-muted-foreground mt-1 font-medium">
                    {subValue}
                </span>
            </div>
        </div>
    );
}

function ProjectionCard({ label, value, subtext, icon }: any) {
    return (
        <div className="bg-background/50 p-6 rounded-xl border border-border flex items-start gap-4 hover:bg-background transition-colors">
            <div className="p-3 bg-muted rounded-lg shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm text-muted-foreground font-medium mb-1">{label}</p>
                <p className="text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
            </div>
        </div>
    );
}

function TableCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold">{title}</h3>
            </div>
            <div className="flex-1 overflow-x-auto">
                {children}
            </div>
        </div>
    );
}
