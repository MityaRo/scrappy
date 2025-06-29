"use client"

import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"

export default function Home() {
  const [appName, setAppName] = useState("")
  const [appId, setAppId] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    appName?: string
    appId?: string
    reviews?: unknown[]
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debounced fetch logic
  const debouncedFetch = useDebouncedCallback(
    async (debouncedAppName: string, debouncedAppId: string) => {
      setLoading(true)
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appName: debouncedAppName,
            appId: debouncedAppId,
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
    },
    500
  )

  async function handleInputChange(name: string, value: string) {
    const newAppName = name === "appName" ? value : appName
    const newAppId = name === "appId" ? value : appId

    if (name === "appName") setAppName(value)
    if (name === "appId") setAppId(value)

    setError(null)
    setResult(null)

    if (newAppName.trim() && newAppId.trim()) {
      debouncedFetch(newAppName.trim(), newAppId.trim())
    }
  }

  function downloadResults() {
    if (!result) return

    try {
      const dataStr = JSON.stringify(result, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.style.display = "none"

      // Get appName and appId from the result or current state
      const resultAppName = result.appName || appName
      const resultAppId = result.appId || appId

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-")
      const sanitizedAppName = (resultAppName || "").replace(
        /[^a-zA-Z0-9]/g,
        "_"
      )
      const sanitizedAppId = (resultAppId || "").replace(/[^a-zA-Z0-9]/g, "_")

      const filename =
        sanitizedAppName && sanitizedAppId
          ? `reviews-${sanitizedAppName}-${sanitizedAppId}.json`
          : `reviews-${timestamp}.json`

      link.setAttribute("download", filename)

      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
    } catch {
      setError("Failed to download file")
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold mb-4">App Store Reviews Collector</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          className={`border rounded px-3 py-2 ${loading ? "opacity-50" : ""}`}
          type="text"
          placeholder="App Name"
          value={appName}
          disabled={loading}
          onChange={e => handleInputChange("appName", e.target.value)}
        />
        <input
          className={`border rounded px-3 py-2 ${loading ? "opacity-50" : ""}`}
          type="text"
          placeholder="App ID (numeric)"
          value={appId}
          disabled={loading}
          onChange={e => handleInputChange("appId", e.target.value)}
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {result && (
        <div className="w-full max-w-2xl mt-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold">Results:</h2>
            <button
              onClick={downloadResults}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Download JSON
            </button>
          </div>
          <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs text-gray-900">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
