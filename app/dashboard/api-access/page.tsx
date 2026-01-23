'use client';

import { useState, useEffect } from 'react';
import { MainNavigation } from '@/app/components/MainNavigation';
import { Key, Copy, Check, Shield, Server, RefreshCw, Eye, EyeOff, Activity, Webhook, Lock, FileJson } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Mock Data for Charts
const USAGE_DATA = [
    { day: 'Mon', requests: 120 },
    { day: 'Tue', requests: 145 },
    { day: 'Wed', requests: 450 },
    { day: 'Thu', requests: 390 },
    { day: 'Fri', requests: 580 },
    { day: 'Sat', requests: 200 },
    { day: 'Sun', requests: 180 },
];

const RECENT_LOGS = [
    { id: 'req_1', method: 'POST', path: '/v1/generate', status: 200, latency: '1.2s', time: '2 min ago' },
    { id: 'req_2', method: 'GET', path: '/v1/blueprints', status: 200, latency: '45ms', time: '5 min ago' },
    { id: 'req_3', method: 'POST', path: '/v1/publish', status: 400, latency: '200ms', time: '12 min ago' },
    { id: 'req_4', method: 'GET', path: '/v1/user/me', status: 200, latency: '35ms', time: '1 hour ago' },
];

export default function ApiAccessPage() {
    const [apiKey, setApiKey] = useState('Loading...');
    const [copied, setCopied] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [webhookSecret, setWebhookSecret] = useState('Loading...');

    // Fetch Keys on Load
    useEffect(() => {
        fetch('/api/keys')
            .then(res => res.json())
            .then(data => {
                if (data.key) setApiKey(data.key);
            })
            .catch(err => console.error('Failed to load key', err));

        fetch('/api/webhooks/config')
            .then(res => res.json())
            .then(data => {
                if (data.secret) setWebhookSecret(data.secret);
            })
            .catch(err => console.error('Failed to load webhook secret', err));
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const generateNewKey = async () => {
        setIsGenerating(true);
        try {
            const res = await fetch('/api/keys', { method: 'POST' });
            const data = await res.json();
            if (data.key) {
                setApiKey(data.key);
            }
        } catch (error) {
            console.error('Failed to rotate key', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <MainNavigation />

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Developer Platform</h1>
                        <p className="text-muted-foreground">
                            Dashboards, API Keys y configuración de servidores MCP para desarrolladores profesionales.
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-muted/50 p-1">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-background py-2 px-6">Overview</TabsTrigger>
                        <TabsTrigger value="keys" className="data-[state=active]:bg-background py-2 px-6">API Keys</TabsTrigger>
                        <TabsTrigger value="webhooks" className="data-[state=active]:bg-background py-2 px-6">Webhooks</TabsTrigger>
                        <TabsTrigger value="mcp" className="data-[state=active]:bg-background py-2 px-6">MCP Server</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Chart */}
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>API Usage</CardTitle>
                                    <CardDescription>Peticiones totales en los últimos 7 días</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={USAGE_DATA}>
                                            <defs>
                                                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                            <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="hsl(var(--muted-foreground))" />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            />
                                            <Area type="monotone" dataKey="requests" stroke="#8884d8" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Stats */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Latencia Media</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">45ms</div>
                                        <p className="text-xs text-muted-foreground mt-1">+2% vs semana pasada</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Tasa de Error</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-green-600">0.02%</div>
                                        <p className="text-xs text-muted-foreground mt-1">Sistemas estables</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Créditos API</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">∞</div>
                                        <p className="text-xs text-muted-foreground mt-1">Plan Elite Activo</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Recent Logs Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Logs Recientes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {RECENT_LOGS.map(log => (
                                        <div key={log.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <Badge variant={log.method === 'POST' ? 'default' : 'secondary'} className="w-16 justify-center">
                                                    {log.method}
                                                </Badge>
                                                <span className="font-mono text-sm">{log.path}</span>
                                            </div>
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <span className={log.status === 200 ? 'text-green-600' : 'text-red-600'}>
                                                    {log.status}
                                                </span>
                                                <span>{log.latency}</span>
                                                <span>{log.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* API KEYS TAB */}
                    <TabsContent value="keys">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Key className="w-5 h-5 text-primary" />
                                    Claves de Producción
                                </CardTitle>
                                <CardDescription>
                                    Usa estas claves para autenticar tus peticiones REST. No las expongas en el frontend.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/20">
                                    <Shield className="w-4 h-4" />
                                    <AlertTitle>Seguridad</AlertTitle>
                                    <AlertDescription>
                                        Tus claves tienen permisos de administrador. Rota tus claves cada 90 días por seguridad.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-2">
                                    <Label>Secret Key (sk_live_...)</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Input
                                                value={showKey ? apiKey : apiKey.replace(/./g, '•')}
                                                readOnly
                                                className="font-mono pr-10"
                                            />
                                            <button
                                                onClick={() => setShowKey(!showKey)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        <Button variant="outline" size="icon" onClick={handleCopy}>
                                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Último uso: Hace 2 minutos</p>
                                </div>

                                <div className="pt-4 border-t">
                                    <Button variant="destructive" size="sm" onClick={generateNewKey} disabled={isGenerating}>
                                        {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                                        Rotar Clave Secreta
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* WEBHOOKS TAB (NEW) */}
                    <TabsContent value="webhooks">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="w-5 h-5 text-purple-600" />
                                    Webhooks
                                </CardTitle>
                                <CardDescription>
                                    Recibe notificaciones en tiempo real cuando se generan artículos o finalizan tareas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-background rounded-md border text-center min-w-[60px]">
                                            <span className="text-xs font-bold text-muted-foreground">STATUS</span>
                                            <div className="text-green-500 font-bold text-sm">LIVE</div>
                                        </div>
                                        <div>
                                            <div className="font-medium">Endpoint Principal</div>
                                            <div className="text-sm text-muted-foreground">https://api.tu-agencia.com/webhooks/red-creativa</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Configurar</Button>
                                </div>

                                <div className="space-y-2">
                                    <Label className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                        Webhook Signing Secret
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input value={webhookSecret} readOnly className="font-mono bg-muted" />
                                        <Button variant="ghost" size="icon"><Copy className="w-4 h-4" /></Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Usa este secreto para verificar la firma <code>X-RC-Signature</code> en tu backend.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* MCP TAB */}
                    <TabsContent value="mcp">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Server className="w-5 h-5 text-blue-500" />
                                    Model Context Protocol (MCP)
                                </CardTitle>
                                <CardDescription>
                                    Conecta Agentes de IA (Cursor, Windsurf, Claude) a tu cuenta.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="cursor" className="w-full">
                                    <TabsList className="mb-4">
                                        <TabsTrigger value="cursor">Cursor IDE</TabsTrigger>
                                        <TabsTrigger value="claude">Claude Desktop</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="cursor">
                                        <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre border border-zinc-800">
                                            {`{
  "redcreativa-mcp": {
    "command": "npx",
    "args": [
      "-y",
      "redcreativa-mcp@latest",
      "--api-key=${apiKey.substring(0, 10)}..."
    ]
  }
}`}
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="claude">
                                        <div className="bg-zinc-950 text-zinc-50 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre border border-zinc-800">
                                            {`"mcpServers": {
  "redcreativa": {
    "command": "npx",
    "args": ["-y", "redcreativa-mcp@latest"],
    "env": {
      "RC_API_KEY": "${apiKey.substring(0, 10)}..."
    }
  }
}`}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
