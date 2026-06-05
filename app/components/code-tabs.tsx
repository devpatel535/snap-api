"use client"

import { useState } from "react"

const CODE_EXAMPLES = {
  node: `import fs from "fs"

const res = await fetch(
  "https://snap-api.vercel.app/api/v1/screenshot?" +
    new URLSearchParams({ url: "https://example.com", format: "png", fullPage: "true" }),
  { headers: { Authorization: "Bearer sk_live_xxxx" } }
)
fs.writeFileSync("screenshot.png", Buffer.from(await res.arrayBuffer()))`,
  python: `import requests

res = requests.get(
    "https://snap-api.vercel.app/api/v1/screenshot",
    params={"url": "https://example.com", "format": "png"},
    headers={"Authorization": "Bearer sk_live_xxxx"},
)
open("screenshot.png", "wb").write(res.content)`,
  curl: `curl "https://snap-api.vercel.app/api/v1/screenshot?url=https://example.com&format=png&api_key=sk_live_xxxx" --output screenshot.png`,
}

export function CodeTabs() {
  const [tab, setTab] = useState<keyof typeof CODE_EXAMPLES>("node")

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex border-b border-slate-700">
        {(Object.keys(CODE_EXAMPLES) as Array<keyof typeof CODE_EXAMPLES>).map((lang) => (
          <button
            key={lang}
            onClick={() => setTab(lang)}
            className={`px-5 py-3 text-sm font-medium transition-colors ${
              tab === lang
                ? "bg-slate-800 text-white border-b-2 border-indigo-500"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {lang === "curl" ? "cURL" : lang === "node" ? "Node.js" : "Python"}
          </button>
        ))}
      </div>
      <pre className="p-6 text-sm text-green-400 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
        <code>{CODE_EXAMPLES[tab]}</code>
      </pre>
    </div>
  )
}
