import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  outputFileTracingIncludes: {
    "/api/v1/screenshot": ["./node_modules/@sparticuz/chromium/**/*"],
    "/api/v1/pdf": ["./node_modules/@sparticuz/chromium/**/*"],
  },
}

export default nextConfig
