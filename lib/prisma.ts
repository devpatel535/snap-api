import { PrismaClient } from "@/app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

function createPrismaClient() {
  // Strip parameters unsupported by the pg driver (channel_binding)
  const rawUrl = process.env.DATABASE_URL ?? ""
  const url = new URL(rawUrl)
  url.searchParams.delete("channel_binding")
  const connectionString = url.toString()

  const adapter = new PrismaPg(connectionString)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
