"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface SubscriptionState {
    user: User | null;
    isPro: boolean;
    wordsUsed: number;
    planLimit: number; // 5000 for free, -1 for infinite
    isLoading: boolean;
    refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [wordsUsed, setWordsUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const supabase = createClient();

    const refreshSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_pro, words_used")
                    .eq("id", user.id)
                    .single();

                if (profile) {
                    setIsPro(profile.is_pro || false);
                    setWordsUsed(profile.words_used || 0);
                }
            }
        } catch (error) {
            console.error("Error fetching subscription:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSubscription();

        // Listen for realtime text generation events? 
        // Ideally we update this state purely after generation actions.
        // For now, simple poll on mount is enough.
    }, []);

    const value = {
        user,
        isPro,
        wordsUsed,
        planLimit: isPro ? -1 : 5000,
        isLoading,
        refreshSubscription
    };

    return (
        <SubscriptionContext.Provider value={value}>
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}
