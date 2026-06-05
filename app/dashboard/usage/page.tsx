import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getPlanConfig } from "@/lib/plans"

export default async function UsagePage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const currentMonth = new Date().toISOString().slice(0, 7)

  const [user, logs, monthlyCounts] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }),
    prisma.usageLog.findMany({
      where: { userId: session.user.id, month: currentMonth },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, type: true, status: true, url: true, createdAt: true },
    }),
    prisma.usageLog.groupBy({
      by: ["type"],
      where: { userId: session.user.id, month: currentMonth },
      _count: { _all: true },
    }),
  ])

  const plan = user?.plan ?? "FREE"
  const planConfig = getPlanConfig(plan)
  const totalUsage = monthlyCounts.reduce((sum: number, g: { _count: { _all: number } }) => sum + g._count._all, 0)
  const limit = planConfig.monthlyRequests
  const pct = Math.min((totalUsage / limit) * 100, 100)

  const byType = Object.fromEntries(monthlyCounts.map((g: { type: string; _count: { _all: number } }) => [g.type, g._count._all]))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Usage</h1>
        <p className="text-slate-500 mt-1 text-sm">Your API usage for {new Date().toLocaleString("default", { month: "long", year: "numeric" })}.</p>
      </div>

      {/* Usage bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-900">Monthly requests</span>
          <span className="text-sm text-slate-500">{totalUsage.toLocaleString()} / {limit.toLocaleString()}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-indigo-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400">{pct.toFixed(1)}% used</span>
          <span className="text-xs text-slate-400">{(limit - totalUsage).toLocaleString()} remaining</span>
        </div>
      </div>

      {/* By type */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(["screenshot", "pdf", "og"] as const).map((type) => (
          <div key={type} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{type === "og" ? "OG Images" : type.charAt(0).toUpperCase() + type.slice(1) + "s"}</p>
            <p className="text-3xl font-bold text-slate-900">{(byType[type] ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Recent requests</h2>
        </div>
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No requests yet this month.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">URL</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      log.type === "screenshot" ? "bg-emerald-100 text-emerald-700" :
                      log.type === "pdf" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>{log.type}</span>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-500 max-w-xs truncate">{log.url ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-medium ${log.status < 300 ? "text-emerald-600" : "text-red-600"}`}>{log.status}</span>
                  </td>
                  <td className="px-6 py-3 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
