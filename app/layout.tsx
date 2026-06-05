import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SnapAPI — Screenshot & PDF API for Developers",
  description: "Capture pixel-perfect screenshots, generate PDFs, and create OG images via a simple REST API. Free plan available. No credit card required.",
  keywords: ["screenshot api", "webpage to image", "html to pdf api", "og image generator", "website screenshot api"],
  openGraph: {
    title: "SnapAPI — Screenshot & PDF API",
    description: "Capture screenshots, generate PDFs, and create OG images via a simple REST API.",
    url: "https://snapapi.dev",
    siteName: "SnapAPI",
    type: "website",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
