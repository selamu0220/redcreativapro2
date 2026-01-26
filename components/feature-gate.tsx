"use client";

import { useSubscription } from "@/contexts/subscription-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import Link from "next/link";

interface FeatureGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function FeatureGate({ children, fallback }: FeatureGateProps) {
    const { isPro, isLoading } = useSubscription();

    if (isLoading) {
        return <div className="animate-pulse h-20 bg-muted rounded-md" />;
    }

    if (isPro) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    return (
        <Card className="border-dashed border-2 border-primary/20 bg-muted/20">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                    <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Función Premium</CardTitle>
                <CardDescription>
                    Esta herramienta está reservada para usuarios Pro.
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
                <Link href="/planes">
                    <Button variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                        Desbloquear por 1€/mes
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
