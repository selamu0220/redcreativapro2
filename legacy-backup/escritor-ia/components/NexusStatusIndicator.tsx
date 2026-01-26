import { Zap, AlertTriangle, CloudOff, Activity, ScanEye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NexusStatusIndicatorProps {
    status: 'healthy' | 'degraded' | 'down';
    isActive: boolean;
    autoImproveStatus?: 'idle' | 'scanning' | 'improving' | 'cooldown';
    scanProgress?: number;
    className?: string;
}

export function NexusStatusIndicator({
    status,
    isActive,
    autoImproveStatus = 'idle',
    scanProgress = 0,
    className
}: NexusStatusIndicatorProps) {
    return (
        <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 shadow-sm border",
            status === 'healthy' ? "bg-background/80 backdrop-blur-sm border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                status === 'degraded' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" :
                    "bg-red-500/10 border-red-500/20 text-red-600",
            className
        )}>
            {/* Auto Improve States override normal status if active */}
            {autoImproveStatus === 'scanning' && (
                <div className="flex items-center gap-2">
                    <ScanEye className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                    <div className="flex flex-col gap-0.5 min-w-[60px]">
                        <span className="text-[10px] uppercase font-bold text-blue-500/80 leading-none">Scanning</span>
                        <div className="h-1 w-full bg-blue-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 transition-all duration-75 ease-out"
                                style={{ width: `${scanProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {autoImproveStatus === 'improving' && (
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin text-purple-500" />
                    <span className="text-purple-600 font-semibold animate-pulse">Mejorando...</span>
                </div>
            )}

            {autoImproveStatus !== 'scanning' && autoImproveStatus !== 'improving' && (
                <>
                    <div className="relative flex h-2 w-2">
                        <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                            status === 'healthy' ? "bg-emerald-400" :
                                status === 'degraded' ? "bg-amber-400" :
                                    "bg-red-400",
                            !isActive && "hidden"
                        )}></span>
                        <span className={cn("relative inline-flex rounded-full h-2 w-2",
                            status === 'healthy' ? "bg-emerald-500" :
                                status === 'degraded' ? "bg-amber-500" :
                                    "bg-red-500"
                        )}></span>
                    </div>

                    <span className="flex items-center gap-1">
                        {status === 'healthy' && <span className="hidden sm:inline font-semibold">Nexus Active</span>}
                        {status === 'degraded' && <span className="hidden sm:inline font-semibold">Degraded</span>}
                        {status === 'down' && <span className="hidden sm:inline font-semibold">Offline</span>}

                        {isActive && <Activity className="w-3 h-3 animate-pulse ml-1" />}
                    </span>
                </>
            )}
        </div>
    );
}
