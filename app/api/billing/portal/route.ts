import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe, absoluteUrl } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  })

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: absoluteUrl("/dashboard/billing"),
  })

  return NextResponse.json({ url: portalSession.url })
}
