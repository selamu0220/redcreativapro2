import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json(
                { isPremium: false, plan: "free", status: "unauthenticated" },
                { status: 401 }
            );
        }

        const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
        const isPremium = metadata?.role === "premium" || metadata?.role === "admin";

        return NextResponse.json({
            isPremium,
            plan: isPremium ? "premium" : "free",
            status: "active",
            role: metadata?.role || "user",
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
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json(
                {
                    data: {
                        hasSubscription: false,
                        isPremium: false,
                        subscriptionStatus: "inactive",
                        subscriptionPlan: "free",
                        subscriptionId: null,
                        customerId: null,
                        subscriptionEndDate: null,
                        subscriptionStartDate: null,
                        trialStartDate: null,
                        isActive: false,
                        cancelAtPeriodEnd: false,
                        currentPeriodStart: null,
                        currentPeriodEnd: null,
                        lastPaymentStatus: null,
                        nextBillingDate: null
                    }
                },
                { status: 401 }
            );
        }

        const metadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
        const isPremium = metadata?.role === "premium" || metadata?.role === "admin";

        // Return data in the format expected by useSubscription hook
        return NextResponse.json({
            data: {
                hasSubscription: isPremium,
                isPremium: isPremium,
                subscriptionStatus: isPremium ? "active" : "inactive",
                subscriptionPlan: isPremium ? "premium" : "free",
                subscriptionId: null, // Clerk doesn't provide Stripe subscription ID
                customerId: userId, // Use Clerk user ID as customer ID
                subscriptionEndDate: null,
                subscriptionStartDate: null,
                trialStartDate: null,
                isActive: isPremium,
                cancelAtPeriodEnd: false,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                lastPaymentStatus: isPremium ? "succeeded" : null,
                nextBillingDate: null,
                role: metadata?.role || "user"
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
