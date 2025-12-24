import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia" as any,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { priceId, planName, successUrl, cancelUrl } = body;

    if (!priceId) {
      return NextResponse.json({ error: "El Price ID es requerido" }, { status: 400 });
    }

    const email = user.emailAddresses[0]?.emailAddress;

    console.log(`🛒 Creando sesión de Stripe para ${email} (Plan: ${planName}, Price: ${priceId})`);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        userId: userId,
        email: email,
        planName: planName,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          email: email,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error al crear sesión de suscripción:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
