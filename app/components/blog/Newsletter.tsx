"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true);
      setIsLoading(false);
      setEmail("");
    }, 1000);
  };

  if (isSubscribed) {
    return (
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="text-orange-800 dark:text-orange-200">¡Gracias por suscribirte!</CardTitle>
          <CardDescription className="text-orange-700 dark:text-orange-300">
            Revisa tu correo para confirmar tu suscripción y recibir las últimas novedades sobre escritura con IA.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
      <CardHeader>
        <CardTitle className="text-orange-800 dark:text-orange-200">📧 Newsletter de Red Creativa</CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          Recibe consejos expertos sobre escritura con IA, copywriting y marketing de contenidos directamente en tu bandeja de entrada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 border-orange-200 dark:border-orange-700 focus:ring-orange-500"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {isLoading ? "Suscribiendo..." : "Suscribirse"}
            </Button>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Nos comprometemos a proteger tu privacidad. Puedes darte de baja en cualquier momento.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}