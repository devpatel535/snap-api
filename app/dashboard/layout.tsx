import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Camera, Key, BarChart2, CreditCard, LogOut, LayoutDashboard } from "lucide-react"
import { signOut } from "@/lib/auth"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/api-keys", label: "API Keys", icon: Key },
    { href: "/dashboard/usage", label: "Usage", icon: BarChart2 },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col fixed inset-y-0">
        <div className="h-16 border-b border-slate-100 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <Camera className="w-5 h-5" /> SnapAPI
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{session.user.name}</p>
              <p className="text-xs text-slate-500 truncate">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/" }) }}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 text-sm transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      {/* Main content */}
      <main className="ml-64 flex-1 p-8 bg-slate-50">{children}</main>
    </div>
  )
}
