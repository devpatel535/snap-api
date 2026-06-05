import type { Plan } from "@/app/generated/prisma/client"

export const PLANS = {
  FREE: {
    name: "Free",
    price: 0,
    monthlyRequests: 100,
    stripePriceId: null as string | null,
    features: ["100 requests/month", "Screenshot API", "PDF API", "OG Image API", "Community support"],
  },
  STARTER: {
    name: "Starter",
    price: 19,
    monthlyRequests: 1_000,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID ?? null as string | null,
    features: ["1,000 requests/month", "All Starter features", "Email support", "Custom viewport", "90-day log retention"],
  },
  PRO: {
    name: "Pro",
    price: 49,
    monthlyRequests: 10_000,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null as string | null,
    features: ["10,000 requests/month", "All Starter features", "Retina screenshots", "Full-page capture", "Priority support", "Webhooks"],
  },
  BUSINESS: {
    name: "Business",
    price: 149,
    monthlyRequests: 100_000,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? null as string | null,
    features: ["100,000 requests/month", "All Pro features", "Custom HTTP headers", "JavaScript execution", "SLA guarantee", "Dedicated support"],
  },
}

export function getPlanConfig(plan: Plan) {
  return PLANS[plan as keyof typeof PLANS]
}

export function getPlanLimit(plan: Plan): number {
  return getPlanConfig(plan).monthlyRequests
}

export function getPlanByPriceId(priceId: string): Plan | null {
  for (const [plan, config] of Object.entries(PLANS)) {
    if (config.stripePriceId === priceId) return plan as Plan
  }
  return null
}
