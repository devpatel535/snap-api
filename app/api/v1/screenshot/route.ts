import { NextRequest, NextResponse } from "next/server"
import { validateApiKey, logUsage } from "@/lib/api-keys"
import { captureScreenshot } from "@/lib/screenshot"
import { z } from "zod"

const schema = z.object({
  url: z.string().url(),
  width: z.coerce.number().int().min(320).max(3840).default(1280),
  height: z.coerce.number().int().min(240).max(2160).default(800),
  fullPage: z.coerce.boolean().default(false),
  retina: z.coerce.boolean().default(false),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  quality: z.coerce.number().int().min(1).max(100).default(90),
  waitFor: z.coerce.number().int().min(0).max(10000).default(0),
  blockAds: z.coerce.boolean().default(true),
})

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get("Authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice(7)
  return req.nextUrl.searchParams.get("api_key")
}

async function handler(req: NextRequest) {
  const apiKey = getApiKey(req)
  if (!apiKey) {
    return NextResponse.json({ error: "API key required. Pass via Authorization: Bearer <key> or ?api_key= param." }, { status: 401 })
  }

  const { valid, userId, apiKeyId, error } = await validateApiKey(apiKey)
  if (!valid || !userId) {
    return NextResponse.json({ error }, { status: 403 })
  }

  const params = req.method === "GET"
    ? Object.fromEntries(req.nextUrl.searchParams)
    : await req.json().catch(() => Object.fromEntries(req.nextUrl.searchParams))

  const parsed = schema.safeParse(params)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters", details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const buf = await captureScreenshot(parsed.data)
    await logUsage(userId, "screenshot", 200, apiKeyId, parsed.data.url)

    const mimeTypes: Record<string, string> = { png: "image/png", jpeg: "image/jpeg", webp: "image/webp" }

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": mimeTypes[parsed.data.format],
        "Content-Disposition": `inline; filename="screenshot.${parsed.data.format}"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err) {
    await logUsage(userId, "screenshot", 500, apiKeyId, parsed.data?.url)
    console.error("Screenshot error:", err)
    return NextResponse.json({ error: "Failed to capture screenshot. Ensure the URL is accessible." }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
export const maxDuration = 60
