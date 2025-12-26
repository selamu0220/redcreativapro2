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
        <div className="rounded-[3rem] border-2 border-primary/20 bg-zinc-900 text-white p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black mb-4 tracking-tighter">¡Ya eres parte de la élite!</h3>
            <p className="text-xl text-zinc-400 font-medium">
              Revisa tu bandeja de entrada. Prepárate para dominar la IA como un profesional.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[3rem] border-2 border-border bg-zinc-50 dark:bg-zinc-900 p-10 md:p-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-primary/50 to-primary"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000"></div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Suscripción exclusiva
            </div>
            <h3 className="text-4xl md:text-5xl font-black leading-[0.9] tracking-tighter mb-6 text-foreground">
              Eleva tu escritura al siguiente nivel
            </h3>
            <p className="text-xl text-muted-foreground leading-tight font-medium">
              Únete a +5,000 creadores que reciben estrategias semanales sobre IA y Copywriting de alto impacto.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-800 p-8 rounded-[2.5rem] shadow-xl border border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-1">Tu mejor Email</label>
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex h-14 w-full rounded-2xl border-2 border-border bg-background px-6 py-4 text-lg font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground h-14 px-8 text-lg font-black hover:scale-[1.02] active:scale-95 transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] disabled:opacity-50"
              >
                {isLoading ? "PROCESANDO..." : "UNIRME AHORA"}
              </button>
              <p className="text-center text-xs text-muted-foreground font-medium">
                Sin spam. Solo valor puro. Date de baja cuando quieras.
              </p>
            </form>
          </div>
        </div>
      </div>
    );

}