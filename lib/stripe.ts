import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
})

export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string | null) {
  const { prisma } = await import("./prisma")
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { stripeCustomerId: true } })

  if (user?.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email,
    name: name ?? undefined,
    metadata: { userId },
  })

  await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: customer.id } })
  return customer.id
}

export function absoluteUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL}${path}`
}
