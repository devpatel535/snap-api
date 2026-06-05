import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getMonthlyUsage } from "@/lib/api-keys"
import { getPlanConfig } from "@/lib/plans"
import Link from "next/link"
import { Key, BarChart2, Zap, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const [user, usage] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, apiKeys: { where: { isActive: true }, select: { id: true } } },
    }),
    getMonthlyUsage(session.user.id),
  ])

  const plan = user?.plan ?? "FREE"
  const planConfig = getPlanConfig(plan)
  const limit = planConfig.monthlyRequests
  const pct = Math.min((usage / limit) * 100, 100)
  const apiKeyCount = user?.apiKeys.length ?? 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {session.user.name?.split(" ")[0]}.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">Current Plan</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{planConfig.name}</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${planConfig.price}<span className="text-sm font-normal text-slate-500">/mo</span></p>
          {plan === "FREE" && (
            <Link href="/dashboard/billing" className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
              Upgrade for more <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">This Month</span>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{usage.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">of {limit.toLocaleString()} requests</p>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-500">API Keys</span>
            <Key className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{apiKeyCount}</p>
          <Link href="/dashboard/api-keys" className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium">
            Manage keys <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Quick start */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-600" /> Quick start</h2>
        <ol className="space-y-3 text-sm text-slate-600">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Go to <Link href="/dashboard/api-keys" className="text-indigo-600 font-medium hover:underline">API Keys</Link> and create your first key.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Make your first request: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">GET /api/v1/screenshot?url=https://example.com&api_key=YOUR_KEY</code></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Monitor your usage in <Link href="/dashboard/usage" className="text-indigo-600 font-medium hover:underline">Usage</Link>. Upgrade when you&apos;re ready to scale.</span>
          </li>
        </ol>
      </div>

      {/* API base URL */}
      <div className="bg-slate-900 rounded-xl p-6">
        <p className="text-slate-400 text-xs font-mono mb-2">Base URL</p>
        <code className="text-green-400 font-mono text-sm">{process.env.NEXT_PUBLIC_APP_URL ?? "https://snapapi.dev"}/api/v1</code>
        <div className="mt-4 grid grid-cols-3 gap-4 text-xs font-mono">
          {[
            { method: "GET", path: "/screenshot" },
            { method: "GET", path: "/pdf" },
            { method: "GET", path: "/og" },
          ].map((ep) => (
            <div key={ep.path} className="bg-slate-800 rounded-lg p-3">
              <span className="text-emerald-400">{ep.method}</span>{" "}
              <span className="text-slate-300">{ep.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
