"use client";

import React, { useState } from "react";

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
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-orange-800 dark:text-orange-200">¡Gracias por suscribirte!</h3>
          <p className="text-sm text-muted-foreground text-orange-700 dark:text-orange-300">
            Revisa tu correo para confirmar tu suscripción y recibir las últimas novedades sobre escritura con IA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
      <div className="flex flex-col space-y-1.5 p-6">
        <h3 className="text-2xl font-semibold leading-none tracking-tight text-orange-800 dark:text-orange-200">📧 Newsletter de Red Creativa</h3>
        <p className="text-sm text-muted-foreground text-orange-700 dark:text-orange-300">
          Recibe consejos expertos sobre escritura con IA, copywriting y marketing de contenidos directamente en tu bandeja de entrada.
        </p>
      </div>
      <div className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 h-10 w-full rounded-md border border-orange-200 dark:border-orange-700 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-orange-600 hover:bg-orange-700 text-white h-10 px-4 py-2"
            >
              {isLoading ? "Suscribiendo..." : "Suscribirse"}
            </button>
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Nos comprometemos a proteger tu privacidad. Puedes darte de baja en cualquier momento.
          </p>
        </form>
      </div>
    </div>
  );
}