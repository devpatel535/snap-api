import chromium from "@sparticuz/chromium"
import puppeteer from "puppeteer-core"

async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const localChrome =
    process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome"

  return puppeteer.launch({
    executablePath: localChrome,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })
}

export interface ScreenshotOptions {
  url: string
  width?: number
  height?: number
  fullPage?: boolean
  retina?: boolean
  format?: "png" | "jpeg" | "webp"
  quality?: number
  waitFor?: number
  blockAds?: boolean
}

export async function captureScreenshot(opts: ScreenshotOptions): Promise<Buffer> {
  const { url, width = 1280, height = 800, fullPage = false, retina = false, format = "png", quality = 90, waitFor = 0 } = opts

  const browser = await getBrowser()
  try {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor: retina ? 2 : 1 })
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 })
    if (waitFor > 0) await new Promise((r) => setTimeout(r, Math.min(waitFor, 10_000)))

    const screenshot = await page.screenshot({
      type: format,
      fullPage,
      quality: format !== "png" ? quality : undefined,
    })
    return Buffer.from(screenshot)
  } finally {
    await browser.close()
  }
}

export interface PDFOptions {
  url: string
  format?: "A4" | "Letter" | "A3" | "A5"
  landscape?: boolean
  printBackground?: boolean
  marginTop?: string
  marginBottom?: string
  marginLeft?: string
  marginRight?: string
}

export async function capturePDF(opts: PDFOptions): Promise<Buffer> {
  const { url, format = "A4", landscape = false, printBackground = true, marginTop = "0", marginBottom = "0", marginLeft = "0", marginRight = "0" } = opts

  const browser = await getBrowser()
  try {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 })
    const pdf = await page.pdf({
      format, landscape, printBackground,
      margin: { top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
