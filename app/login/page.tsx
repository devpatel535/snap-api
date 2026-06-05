"use client"

import { signIn } from "next-auth/react"
import { Camera } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function LoginContent() {
  const params = useSearchParams()
  const plan = params.get("plan")

  async function handleGoogle() {
    const callbackUrl = plan ? `/dashboard?plan=${plan}` : "/dashboard"
    await signIn("google", { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl text-indigo-600 mb-6">
            <Camera className="w-6 h-6" /> SnapAPI
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 text-sm">Sign in to access your API keys and dashboard.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
          <p className="mt-6 text-center text-xs text-slate-400">
            By signing in you agree to our{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms</Link> and{" "}
            <Link href="/privacy" className="underline hover:text-slate-600">Privacy Policy</Link>.
          </p>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          No account yet?{" "}
          <button onClick={handleGoogle} className="text-indigo-600 hover:text-indigo-700 font-medium">
            Sign up for free
          </button>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
