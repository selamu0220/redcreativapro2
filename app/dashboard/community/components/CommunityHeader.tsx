'use client'

import { ArrowLeft, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { LogoutLink } from '@kinde-oss/kinde-auth-nextjs';
import { Button } from '@/app/components/ui/button';

export function CommunityHeader() {
    return (
        <header className="h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0 supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
                {/* Back to Dashboard */}
                <Link
                    href="/dashboard"
                    className="group flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-all border border-transparent group-hover:border-primary/20">
                        <LayoutDashboard className="w-4 h-4 group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-sm font-medium">Volver al Dashboard</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {/* Logout */}
                <LogoutLink>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                    </Button>
                </LogoutLink>
            </div>
        </header>
    );
}
