import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateApiKey } from "@/lib/api-keys"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, key: true, name: true, lastUsed: true, createdAt: true },
  })

  return NextResponse.json({ keys })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = z.object({ name: z.string().min(1).max(50) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Name required" }, { status: 400 })

  const count = await prisma.apiKey.count({ where: { userId: session.user.id, isActive: true } })
  if (count >= 10) return NextResponse.json({ error: "Maximum 10 API keys allowed" }, { status: 400 })

  const key = await prisma.apiKey.create({
    data: { key: generateApiKey(), name: parsed.data.name, userId: session.user.id },
    select: { id: true, key: true, name: true, createdAt: true },
  })

  return NextResponse.json({ key }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: "Key ID required" }, { status: 400 })

  await prisma.apiKey.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive: false },
  })

  return NextResponse.json({ success: true })
}
