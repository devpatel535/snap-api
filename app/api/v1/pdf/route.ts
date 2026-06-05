import { NextRequest, NextResponse } from "next/server"
import { validateApiKey, logUsage } from "@/lib/api-keys"
import { capturePDF } from "@/lib/screenshot"
import { z } from "zod"

const schema = z.object({
  url: z.string().url(),
  format: z.enum(["A4", "Letter", "A3", "A5"]).default("A4"),
  landscape: z.coerce.boolean().default(false),
  printBackground: z.coerce.boolean().default(true),
  marginTop: z.string().default("0"),
  marginBottom: z.string().default("0"),
  marginLeft: z.string().default("0"),
  marginRight: z.string().default("0"),
})

function getApiKey(req: NextRequest): string | null {
  const auth = req.headers.get("Authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice(7)
  return req.nextUrl.searchParams.get("api_key")
}

async function handler(req: NextRequest) {
  const apiKey = getApiKey(req)
  if (!apiKey) {
    return NextResponse.json({ error: "API key required." }, { status: 401 })
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
    const buf = await capturePDF(parsed.data)
    await logUsage(userId, "pdf", 200, apiKeyId, parsed.data.url)

    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="document.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err) {
    await logUsage(userId, "pdf", 500, apiKeyId, parsed.data?.url)
    console.error("PDF error:", err)
    return NextResponse.json({ error: "Failed to generate PDF." }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
export const maxDuration = 60
