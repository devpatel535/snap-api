import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe, getOrCreateStripeCustomer, absoluteUrl } from "@/lib/stripe"
import { getPlanConfig } from "@/lib/plans"
import { z } from "zod"
import type { Plan } from "@/app/generated/prisma/client"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const parsed = z.object({ plan: z.enum(["STARTER", "PRO", "BUSINESS"]) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

  const planConfig = getPlanConfig(parsed.data.plan as Plan)
  if (!planConfig.stripePriceId) {
    return NextResponse.json({ error: "Invalid plan configuration" }, { status: 400 })
  }

  const customerId = await getOrCreateStripeCustomer(session.user.id, session.user.email, session.user.name)

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    success_url: absoluteUrl("/dashboard?upgraded=1"),
    cancel_url: absoluteUrl("/dashboard/billing"),
    metadata: { userId: session.user.id },
    subscription_data: { metadata: { userId: session.user.id } },
  })

  return NextResponse.json({ url: checkoutSession.url })
}
