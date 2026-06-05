"use client"

import { useState } from "react"
import { Check, ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const PLANS = [
  {
    key: "FREE",
    name: "Free",
    price: 0,
    requests: "100",
    features: ["100 requests/month", "All APIs included", "Community support"],
  },
  {
    key: "STARTER",
    name: "Starter",
    price: 19,
    requests: "1,000",
    features: ["1,000 requests/month", "Email support", "90-day history"],
  },
  {
    key: "PRO",
    name: "Pro",
    price: 49,
    requests: "10,000",
    popular: true,
    features: ["10,000 requests/month", "Retina screenshots", "Priority support", "Webhooks"],
  },
  {
    key: "BUSINESS",
    name: "Business",
    price: 149,
    requests: "100,000",
    features: ["100,000 requests/month", "Custom headers", "99.9% SLA", "Dedicated support"],
  },
]

export default function BillingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  async function handleUpgrade(plan: string) {
    if (plan === "FREE") return
    setLoading(plan)
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      router.push(data.url)
    } finally {
      setLoading(null)
    }
  }

  async function handlePortal() {
    setLoading("portal")
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      router.push(data.url)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your subscription and usage limits.</p>
        </div>
        <button
          onClick={handlePortal}
          disabled={loading === "portal"}
          className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          Manage billing
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.key} className={`relative rounded-2xl p-6 flex flex-col ${plan.popular ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200 md:-mt-4 md:mb-4" : "border border-slate-200 bg-white"}`}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">Most popular</span>
              </div>
            )}
            <div className="mb-6">
              <h3 className={`font-bold text-lg mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-slate-900"}`}>${plan.price}</span>
                <span className={`text-sm ${plan.popular ? "text-indigo-200" : "text-slate-400"}`}>/mo</span>
              </div>
              <p className={`text-sm mt-1 ${plan.popular ? "text-indigo-200" : "text-slate-500"}`}>{plan.requests} requests/month</p>
            </div>
            <ul className="space-y-2 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className={`w-4 h-4 flex-shrink-0 ${plan.popular ? "text-indigo-200" : "text-emerald-500"}`} />
                  <span className={plan.popular ? "text-indigo-100" : "text-slate-600"}>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.key)}
              disabled={plan.key === "FREE" || loading === plan.key}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 ${
                plan.popular
                  ? "bg-white text-indigo-600 hover:bg-indigo-50"
                  : plan.key === "FREE"
                  ? "bg-slate-100 text-slate-400 cursor-default"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {loading === plan.key && <Loader2 className="w-4 h-4 animate-spin" />}
              {plan.key === "FREE" ? "Current free plan" : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
