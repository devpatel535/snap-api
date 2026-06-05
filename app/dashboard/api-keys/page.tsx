"use client"

import { useState, useEffect, useCallback } from "react"
import { Key, Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface ApiKey {
  id: string
  key: string
  name: string
  lastUsed: string | null
  createdAt: string
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [showCreate, setShowCreate] = useState(false)
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/keys")
    const data = await res.json()
    setKeys(data.keys ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchKeys() }, [fetchKeys])

  async function createKey() {
    if (!newKeyName.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error); return }
      setKeys((prev) => [data.key, ...prev])
      setRevealed((prev) => ({ ...prev, [data.key.id]: true }))
      setNewKeyName("")
      setShowCreate(false)
      toast.success("API key created! Save it — it won't be shown again.")
    } finally {
      setCreating(false)
    }
  }

  async function deleteKey(id: string) {
    if (!confirm("Delete this API key? This cannot be undone.")) return
    const res = await fetch("/api/keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast.success("API key deleted.")
    }
  }

  function maskKey(key: string) {
    return key.slice(0, 12) + "•".repeat(24) + key.slice(-4)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">API Keys</h1>
          <p className="text-slate-500 mt-1 text-sm">Use these keys to authenticate your API requests.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Create new key
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create API key</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Production, My App"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              autoFocus
            />
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {creating ? "Creating…" : "Create"}
            </button>
            <button onClick={() => setShowCreate(false)} className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-lg text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : keys.length === 0 ? (
          <div className="p-12 text-center">
            <Key className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium mb-1">No API keys yet</p>
            <p className="text-slate-400 text-sm">Create your first key to start making requests.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Key</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Last used</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Created</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {keys.map((k) => (
                <tr key={k.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{k.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {revealed[k.id] ? k.key : maskKey(k.key)}
                      </code>
                      <button onClick={() => setRevealed((prev) => ({ ...prev, [k.id]: !prev[k.id] }))} className="text-slate-400 hover:text-slate-600">
                        {revealed[k.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied!") }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => deleteKey(k.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-amber-800 text-sm">
          <strong>Keep your keys secret.</strong> Pass them via the <code className="bg-amber-100 px-1 rounded text-xs">Authorization: Bearer sk_live_...</code> header or <code className="bg-amber-100 px-1 rounded text-xs">?api_key=</code> query param.
        </p>
      </div>
    </div>
  )
}
