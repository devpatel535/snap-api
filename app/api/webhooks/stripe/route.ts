import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { getPlanByPriceId } from "@/lib/plans"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = event.data.object as any

  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "subscription") break
      const sub = await stripe.subscriptions.retrieve(obj.subscription as string)
      const priceId: string = sub.items.data[0].price.id
      const plan = getPlanByPriceId(priceId)
      if (!plan || !obj.metadata?.userId) break

      await prisma.user.update({
        where: { id: obj.metadata.userId as string },
        data: {
          plan,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: obj.customer as string,
          stripePriceId: priceId,
        },
      })
      break
    }

    case "invoice.payment_succeeded": {
      const subId = obj.parent?.subscription_details?.subscription as string | undefined
      if (!subId) break
      const sub = await stripe.subscriptions.retrieve(subId)
      const priceId: string = sub.items.data[0].price.id
      const plan = getPlanByPriceId(priceId)
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: subId } })
      if (!user || !plan) break
      await prisma.user.update({ where: { id: user.id }, data: { plan, stripePriceId: priceId } })
      break
    }

    case "customer.subscription.updated": {
      const priceId: string = obj.items.data[0].price.id
      const plan = getPlanByPriceId(priceId)
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: obj.id as string } })
      if (!user || !plan) break
      await prisma.user.update({ where: { id: user.id }, data: { plan, stripePriceId: priceId } })
      break
    }

    case "customer.subscription.deleted": {
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: obj.id as string } })
      if (!user) break
      await prisma.user.update({
        where: { id: user.id },
        data: { plan: "FREE", stripeSubscriptionId: null, stripePriceId: null },
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
