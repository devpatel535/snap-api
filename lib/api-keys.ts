import { nanoid } from "nanoid"
import { prisma } from "./prisma"
import { getPlanLimit } from "./plans"
import type { Plan } from "@/app/generated/prisma/client"

export function generateApiKey(): string {
  return `sk_live_${nanoid(32)}`
}

export async function validateApiKey(key: string): Promise<{
  valid: boolean
  userId?: string
  apiKeyId?: string
  plan?: Plan
  error?: string
}> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { key, isActive: true },
    include: { user: { select: { id: true, plan: true } } },
  })

  if (!apiKey) return { valid: false, error: "Invalid API key" }

  const currentMonth = new Date().toISOString().slice(0, 7)
  const usageCount = await prisma.usageLog.count({
    where: { userId: apiKey.userId, month: currentMonth },
  })

  const limit = getPlanLimit(apiKey.user.plan)
  if (usageCount >= limit) {
    return {
      valid: false,
      userId: apiKey.userId,
      apiKeyId: apiKey.id,
      plan: apiKey.user.plan,
      error: `Monthly limit of ${limit} requests reached. Upgrade at https://snapapi.dev/dashboard/billing`,
    }
  }

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } })

  return { valid: true, userId: apiKey.userId, apiKeyId: apiKey.id, plan: apiKey.user.plan }
}

export async function logUsage(userId: string, type: string, status: number, apiKeyId?: string, url?: string) {
  const month = new Date().toISOString().slice(0, 7)
  await prisma.usageLog.create({ data: { userId, apiKeyId, type, status, url, month } })
}

export async function getMonthlyUsage(userId: string): Promise<number> {
  const month = new Date().toISOString().slice(0, 7)
  return prisma.usageLog.count({ where: { userId, month } })
}
