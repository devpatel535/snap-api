import { NextRequest, NextResponse } from "next/server"
import { validateApiKey, logUsage } from "@/lib/api-keys"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(400).default(""),
  siteName: z.string().max(100).default(""),
  logo: z.string().url().optional(),
  theme: z.enum(["light", "dark", "gradient"]).default("gradient"),
  width: z.coerce.number().int().default(1200),
  height: z.coerce.number().int().default(630),
})

function getApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("Authorization")
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7)
  return req.nextUrl.searchParams.get("api_key")
}

function generateOGSvg(params: z.infer<typeof schema>): string {
  const { title, description, siteName, theme, width, height } = params

  const backgrounds = {
    light: "#ffffff",
    dark: "#0f172a",
    gradient: "url(#grad)",
  }

  const textColors = {
    light: "#0f172a",
    dark: "#f8fafc",
    gradient: "#ffffff",
  }

  const subtextColors = {
    light: "#64748b",
    dark: "#94a3b8",
    gradient: "#e2e8f0",
  }

  const bg = backgrounds[theme]
  const tc = textColors[theme]
  const sc = subtextColors[theme]

  const escapedTitle = title.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]!)
  const escapedDesc = description.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]!)
  const escapedSite = siteName.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]!)

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4f46e5;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${bg}" />
  <rect x="60" y="60" width="8" height="${height - 120}" fill="${tc}" opacity="0.15" rx="4"/>
  <text x="100" y="${height / 2 - 60}" font-family="system-ui, -apple-system, sans-serif" font-size="56" font-weight="700" fill="${tc}" text-anchor="start">
    ${escapedTitle.length > 50 ? escapedTitle.slice(0, 50) + "…" : escapedTitle}
  </text>
  ${description ? `<text x="100" y="${height / 2 + 20}" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="${sc}" text-anchor="start">${escapedDesc.length > 100 ? escapedDesc.slice(0, 100) + "…" : escapedDesc}</text>` : ""}
  ${siteName ? `<text x="100" y="${height - 80}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="${sc}" text-anchor="start">${escapedSite}</text>` : ""}
</svg>`
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
    const svg = generateOGSvg(parsed.data)
    await logUsage(userId, "og", 200, apiKeyId)

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err) {
    await logUsage(userId, "og", 500, apiKeyId)
    console.error("OG error:", err)
    return NextResponse.json({ error: "Failed to generate OG image." }, { status: 500 })
  }
}

export const GET = handler
export const POST = handler
