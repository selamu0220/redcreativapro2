import { SystemStatus, NexusProvider } from '../types/nexus.types';

interface MetricPoint {
    timestamp: number;
    value: number;
    type: 'latency' | 'error' | 'request';
}

export class SentinelMonitor {
    private static instance: SentinelMonitor;
    private metrics: MetricPoint[] = [];
    private readonly windowSize = 1000 * 60 * 60; // 1 hour window
    private providerErrors: Record<string, number> = {};

    private constructor() { }

    public static getInstance(): SentinelMonitor {
        if (!SentinelMonitor.instance) {
            SentinelMonitor.instance = new SentinelMonitor();
        }
        return SentinelMonitor.instance;
    }

    public recordRequest(latencyMs: number, provider: NexusProvider, success: boolean) {
        const now = Date.now();
        this.metrics.push({ timestamp: now, value: 1, type: 'request' });

        if (success) {
            this.metrics.push({ timestamp: now, value: latencyMs, type: 'latency' });
        } else {
            this.metrics.push({ timestamp: now, value: 1, type: 'error' });
            this.providerErrors[provider] = (this.providerErrors[provider] || 0) + 1;
        }

        this.pruneMetrics();
    }

    public getSystemStatus(): SystemStatus {
        const errorRate = this.calculateErrorRate();
        const activeProvider = this.determineActiveProvider();

        let status: 'healthy' | 'degraded' | 'down' = 'healthy';

        if (errorRate > 0.5) status = 'down';
        else if (errorRate > 0.1) status = 'degraded';

        return {
            status,
            activeProvider,
            latency: this.calculateAverageLatency(),
            uptime: process.uptime()
        };
    }

    private calculateErrorRate(): number {
        const now = Date.now();
        const recentMetrics = this.metrics.filter(m => m.timestamp > now - 60000); // Last minute
        if (recentMetrics.length === 0) return 0;

        const errors = recentMetrics.filter(m => m.type === 'error').length;
        const requests = recentMetrics.filter(m => m.type === 'request').length;

        return requests === 0 ? 0 : errors / requests;
    }

    private calculateAverageLatency(): number {
        const latencies = this.metrics
            .filter(m => m.type === 'latency')
            .slice(-50); // Last 50 requests

        if (latencies.length === 0) return 0;

        const sum = latencies.reduce((acc, curr) => acc + curr.value, 0);
        return sum / latencies.length;
    }

    private determineActiveProvider(): NexusProvider {
        // Logic to determine best provider based on errors
        // Simplified for now
        return 'openrouter';
    }

    private pruneMetrics() {
        const now = Date.now();
        if (this.metrics.length > 5000) {
            this.metrics = this.metrics.filter(m => m.timestamp > now - this.windowSize);
        }
    }
}
