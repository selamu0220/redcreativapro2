'use client';

import { SimpleMainNavigation } from '../../components/SimpleMainNavigation';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';

export default function SubscriptionManagePage() {
  const { user, isLoading } = useKindeBrowserClient();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Gestión de Suscripción</CardTitle>
            <CardDescription>Administra tu cuenta y suscripción</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email:</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Nombre:</p>
              <p className="font-medium">{user?.given_name} {user?.family_name}</p>
            </div>
            <div className="pt-4 space-y-2">
              <Button asChild className="w-full">
                <Link href="/planes">Ver Planes</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Volver al Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
