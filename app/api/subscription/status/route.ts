import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getUserByEmailAsync, isAdminUser } from "../../../lib/database";

export async function GET() {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                { isPremium: false, plan: "free", status: "unauthenticated", isActive: false },
                { status: 401 }
            );
        }

        const email = user.emailAddresses[0].emailAddress;
        
        // Admin users always have access
        if (isAdminUser(email)) {
            return NextResponse.json({
                isPremium: true,
                plan: "admin",
                status: "active",
                isActive: true
            });
        }

        // Check status in KV database
        const dbUser = await getUserByEmailAsync(email);
        
        const isPro = dbUser?.subscriptionStatus === 'pro' || 
                      dbUser?.subscriptionStatus === 'premium' || 
                      dbUser?.isPremium === true;
        
        return NextResponse.json({
            isPremium: isPro,
            plan: dbUser?.subscriptionStatus || "free",
            status: isPro ? "active" : "inactive",
            isActive: isPro,
            expiresAt: dbUser?.subscriptionCurrentPeriodEnd
        });
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return NextResponse.json(
            { error: "Internal Server Error", isPremium: false },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return NextResponse.json(
                {
                    data: {
                        hasSubscription: false,
                        isPremium: false,
                        subscriptionStatus: "inactive",
                        subscriptionPlan: "free",
                        isActive: false
                    }
                },
                { status: 401 }
            );
        }

        const email = user.emailAddresses[0].emailAddress;
        
        if (isAdminUser(email)) {
            return NextResponse.json({
                data: {
                    hasSubscription: true,
                    isPremium: true,
                    subscriptionStatus: "active",
                    subscriptionPlan: "admin",
                    isActive: true
                }
            });
        }

        const dbUser = await getUserByEmailAsync(email);
        const isPro = dbUser?.subscriptionStatus === 'pro' || 
                      dbUser?.subscriptionStatus === 'premium' || 
                      dbUser?.isPremium === true;

        return NextResponse.json({
            data: {
                hasSubscription: isPro,
                isPremium: isPro,
                subscriptionStatus: isPro ? "active" : "inactive",
                subscriptionPlan: dbUser?.subscriptionStatus || "free",
                isActive: isPro
            }
        });
    } catch (error) {
        console.error("Error checking subscription status:", error);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                data: {
                    hasSubscription: false,
                    isPremium: false,
                    subscriptionStatus: "inactive",
                    subscriptionPlan: "free"
                }
            },
            { status: 500 }
        );
    }
}
