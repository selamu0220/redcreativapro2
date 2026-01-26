import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server";
import { createClient as createClientJS } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

const supabase = createClientJS(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const body = await req.json();
    const { priceId, planName, planType } = body;

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    const userEmail = user.email;

    let existingCustomerId: string | undefined;
    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("stripe_customer_id")
      .eq("email", userEmail)
      .single();

    if (userProfile?.stripe_customer_id) {
      existingCustomerId = userProfile.stripe_customer_id;
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      client_reference_id: userId,
      metadata: {
        userId: userId,
        email: userEmail,
        planName: planName || "Premium",
        planType: planType || "premium",
      },
      subscription_data: {
        metadata: {
          userId: userId,
          email: userEmail,
          planType: planType || "premium",
        },
      },
    };

    if (existingCustomerId) {
      sessionConfig.customer = existingCustomerId;
    } else {
      sessionConfig.customer_email = userEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect(new URL("/planes", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
