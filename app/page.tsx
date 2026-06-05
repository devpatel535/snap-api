"use client"

import Link from "next/link"
import { useState } from "react"
import { Camera, FileText, Image, Zap, Shield, Globe, Check, ChevronRight, Code2, Star } from "lucide-react"

const CODE_EXAMPLES = {
  curl: `curl "https://snapapi.dev/api/v1/screenshot?url=https://example.com&format=png&fullPage=true&api_key=sk_live_xxxx" --output screenshot.png`,
  node: `import fs from "fs"

const res = await fetch(
  "https://snapapi.dev/api/v1/screenshot?" +
    new URLSearchParams({ url: "https://example.com", format: "png", fullPage: "true" }),
  { headers: { Authorization: "Bearer sk_live_xxxx" } }
)
fs.writeFileSync("screenshot.png", Buffer.from(await res.arrayBuffer()))`,
  python: `import requests

res = requests.get(
    "https://snapapi.dev/api/v1/screenshot",
    params={"url": "https://example.com", "format": "png", "fullPage": "true"},
    headers={"Authorization": "Bearer sk_live_xxxx"},
)
open("screenshot.png", "wb").write(res.content)`,
}

const PLANS = [
  {
    name: "Free",
    price: "$0",
    highlight: false,
    cta: "Get started free",
    href: "/login",
    features: ["100 requests/month", "Screenshot API", "PDF API", "OG Image API", "Community support"],
  },
  {
    name: "Starter",
    price: "$19",
    highlight: false,
    cta: "Start Starter",
    href: "/login?plan=STARTER",
    features: ["1,000 requests/month", "All Free features", "Custom viewport size", "Email support", "90-day log history"],
  },
  {
    name: "Pro",
    price: "$49",
    highlight: true,
    cta: "Start Pro",
    href: "/login?plan=PRO",
    features: ["10,000 requests/month", "All Starter features", "Retina (2x) screenshots", "Full-page capture", "Priority support", "Webhook notifications"],
  },
  {
    name: "Business",
    price: "$149",
    highlight: false,
    cta: "Start Business",
    href: "/login?plan=BUSINESS",
    features: ["100,000 requests/month", "All Pro features", "Custom HTTP headers", "JavaScript injection", "99.9% SLA", "Dedicated support"],
  },
]

const FEATURES = [
  { icon: Camera, title: "Pixel-perfect screenshots", description: "Capture any URL with full control over viewport, scroll position, and device pixel ratio." },
  { icon: FileText, title: "HTML → PDF conversion", description: "Turn any webpage into a printable PDF with custom margins, paper formats, and backgrounds." },
  { icon: Image, title: "OG image generation", description: "Generate beautiful Open Graph social cards on-the-fly with custom titles and themes." },
  { icon: Zap, title: "Lightning fast", description: "Average response under 3 seconds. Global edge network for minimum latency." },
  { icon: Shield, title: "Enterprise reliable", description: "99.9% uptime SLA. Automatic retries on timeout. Real-time status page." },
  { icon: Globe, title: "Any language", description: "Simple REST API. Works with curl, Node, Python, Ruby, Go, PHP — anything HTTP." },
]

export default function LandingPage() {
  const [tab, setTab] = useState<keyof typeof CODE_EXAMPLES>("node")

  return (
    <div className="flex flex-col min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Camera className="w-5 h-5" /> SnapAPI
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#docs" className="hover:text-slate-900 transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors">
              Get API key — Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Star className="w-3 h-3 fill-current" />
            100 free screenshots every month. No credit card needed.
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Screenshot any webpage<br />
            <span className="text-indigo-600">with one API call</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Capture screenshots, generate PDFs, and create OG images via a simple REST API. Integrate in minutes. Scale to millions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
              Get your free API key <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#docs" className="flex items-center gap-2 border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
              <Code2 className="w-5 h-5" /> View docs
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">Free forever · No credit card · 100 screenshots/month</p>
        </div>
      </section>

      {/* Code demo */}
      <section id="docs" className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Simple. Powerful. Any language.</h2>
            <p className="text-slate-600">One HTTP request is all you need.</p>
          </div>
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex border-b border-slate-700">
              {(Object.keys(CODE_EXAMPLES) as Array<keyof typeof CODE_EXAMPLES>).map((lang) => (
                <button key={lang} onClick={() => setTab(lang)}
                  className={`px-5 py-3 text-sm font-medium transition-colors ${tab === lang ? "bg-slate-800 text-white border-b-2 border-indigo-500" : "text-slate-400 hover:text-slate-200"}`}>
                  {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : "Python"}
                </button>
              ))}
            </div>
            <pre className="p-6 text-sm text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
              <code>{CODE_EXAMPLES[tab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* API endpoints */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">Three endpoints. Endless possibilities.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { method: "GET", path: "/api/v1/screenshot", desc: "Capture a full-page or viewport screenshot.", params: ["url", "format", "width", "height", "fullPage", "retina"], color: "bg-emerald-500" },
              { method: "GET", path: "/api/v1/pdf", desc: "Convert any webpage to a print-ready PDF.", params: ["url", "format", "landscape", "margin", "printBackground"], color: "bg-blue-500" },
              { method: "GET", path: "/api/v1/og", desc: "Generate Open Graph social cards instantly.", params: ["title", "description", "siteName", "theme", "logo"], color: "bg-purple-500" },
            ].map((ep) => (
              <div key={ep.path} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`${ep.color} text-white text-xs font-bold px-2 py-0.5 rounded`}>{ep.method}</span>
                  <code className="text-slate-700 text-sm font-mono">{ep.path}</code>
                </div>
                <p className="text-slate-600 text-sm mb-4">{ep.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ep.params.map((p) => <span key={p} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono">{p}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Everything you need to ship faster</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Transparent pricing</h2>
            <p className="text-slate-600">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 items-start">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col ${plan.highlight ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 md:-mt-4 md:mb-4" : "border border-slate-200"}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`font-bold text-lg mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.price}</span>
                    <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-slate-500"}`}>/month</span>
                  </div>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.highlight ? "text-indigo-200" : "text-emerald-500"}`} />
                      <span className={plan.highlight ? "text-indigo-100" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Start capturing in 60 seconds</h2>
          <p className="text-indigo-200 mb-8 text-lg">Sign up free, grab your API key, make your first screenshot before your coffee gets cold.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-indigo-50 transition-colors">
            Get your free API key <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Camera className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-600">SnapAPI</span>
            <span>© 2025 All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
            <a href="mailto:support@snapapi.dev" className="hover:text-slate-900 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
