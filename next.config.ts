import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium-min"],
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
}

export default nextConfig
