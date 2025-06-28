"use client"

import { useState } from "react"

export default function Home() {
  const [appName, setAppName] = useState("")
  const [appId, setAppId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    results?: unknown
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Trigger request as soon as both fields are filled
  async function handleInputChange(name: string, value: string) {
    if (name === "appName") setAppName(value)
    if (name === "appId") setAppId(value)
    setError(null)
    setResult(null)
    if (
      (name === "appName" ? value : appName) &&
      (name === "appId" ? value : appId)
    ) {
      setLoading(true)
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apps: [
              {
                appName: name === "appName" ? value : appName,
                appId: name === "appId" ? value : appId
              }
            ],
            pagesCount: 1
          })
        })
        if (!res.ok) throw new Error("Failed to fetch reviews")
        const data = await res.json()
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold mb-4">App Store Reviews Collector</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className="border rounded px-3 py-2"
          type="text"
          placeholder="App Name"
          value={appName}
          onChange={e => handleInputChange("appName", e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          type="text"
          placeholder="App ID"
          value={appId}
          onChange={e => handleInputChange("appId", e.target.value)}
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {result && (
        <div className="w-full max-w-2xl mt-4">
          <h2 className="font-semibold mb-2">Results:</h2>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs text-gray-900">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
