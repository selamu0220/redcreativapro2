import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId, has } = await auth();

        if (!userId) {
            return NextResponse.json(
                { isPremium: false, plan: "free", status: "unauthenticated" },
                { status: 401 }
            );
        }

        // Check plan using Clerk's has() helper (server-side)
        // This integrates with Clerk Billing entitlements
        const isPro = has({ plan: 'pro' }) || has({ plan: 'pro_monthly' }) || has({ plan: 'pro_yearly' });
        
        return NextResponse.json({
            isPremium: isPro,
            plan: isPro ? "pro" : "free",
            status: isPro ? "active" : "inactive",
            isActive: isPro
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
        const { userId, has } = await auth();

        if (!userId) {
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

        const isPro = has({ plan: 'pro' }) || has({ plan: 'pro_monthly' }) || has({ plan: 'pro_yearly' });

        return NextResponse.json({
            data: {
                hasSubscription: isPro,
                isPremium: isPro,
                subscriptionStatus: isPro ? "active" : "inactive",
                subscriptionPlan: isPro ? "pro" : "free",
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
