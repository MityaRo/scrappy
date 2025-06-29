"use client"

import { useState, useRef, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"
import type { Review } from "app-store-scraper"
import ReviewCard from "./components/ReviewCard"

const REVIEWS_PER_PAGE = 50

// Define only the API response type that differs from the module
interface SearchApiResult {
  appId: string
  appName: string
  developer: string
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("")
  const [appId, setAppId] = useState("")
  const [reviewsCount, setReviewsCount] = useState(100)
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchApiResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedApp, setSelectedApp] = useState<SearchApiResult | null>(null)
  const [result, setResult] = useState<{
    appName?: string
    appId?: string
    reviews?: unknown[]
    error?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

  const debouncedSearch = useDebouncedCallback(async (term: string) => {
    // Do not show dropdown if an app is already selected
    if (selectedApp) {
      setShowDropdown(false)
      setSearchResults([])
      return
    }
    if (term.length < 3) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      if (!res.ok) {
        throw new Error(`Search failed: ${res.status}`)
      }
      const data = await res.json()
      setSearchResults(data)
      setShowDropdown(data.length > 0)
    } catch (err) {
      console.error("Search error:", err)
      setSearchResults([])
      setShowDropdown(false)
    }
  }, 500)

  const debouncedFetch = useDebouncedCallback(
    async (
      debouncedAppName: string,
      debouncedAppId: string,
      debouncedReviewsCount: number
    ) => {
      setLoading(true)
      try {
        const pagesCount = Math.ceil(debouncedReviewsCount / REVIEWS_PER_PAGE)
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appName: debouncedAppName.trim(),
            appId: debouncedAppId.trim(),
            pagesCount
          })
        })
        if (!res.ok) {
          const errorText = await res.text()
          throw new Error(`Failed to fetch reviews: ${res.status} ${errorText}`)
        }
        const data = await res.json()
        // Deduplicate reviews by id and updated
        if (data && Array.isArray(data.reviews)) {
          const uniqueMap = new Map<string, Review>()
          for (const review of data.reviews as Review[]) {
            const key = `${review.id}-${review.updated}`
            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, review)
            }
          }
          data.reviews = Array.from(uniqueMap.values())
        }
        setResult(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    },
    500
  )

  // Handle click outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  function clearSelectedApp() {
    setSelectedApp(null)
    setAppId("")
    setResult(null)
    setError(null)
  }

  function shouldTriggerSearch(value: string) {
    return value.length >= 3
  }

  async function handleSearchChange(value: string) {
    setSearchTerm(value)

    // If an app is already selected and the value matches the selected app name,
    // don't trigger search and keep dropdown hidden
    if (selectedApp && value === selectedApp.appName) {
      setShowDropdown(false)
      setSearchResults([])
      return
    }

    // If value doesn't match selected app, clear the selection
    if (selectedApp && value !== selectedApp.appName) {
      clearSelectedApp()
    }

    if (shouldTriggerSearch(value)) {
      debouncedSearch(value)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  function handleGetReviews() {
    if (!selectedApp || !appId) {
      setError("Please select an app first")
      return
    }

    setError(null)
    debouncedFetch(selectedApp.appName, appId, reviewsCount)
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
      const resultAppName = result.appName || selectedApp?.appName || ""
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

  function handleArrowDown() {
    setHighlightedIndex(idx => (idx + 1) % searchResults.length)
  }

  function handleArrowUp() {
    setHighlightedIndex(
      idx => (idx - 1 + searchResults.length) % searchResults.length
    )
  }

  function handleEnter() {
    if (highlightedIndex >= 0 && highlightedIndex < searchResults.length) {
      const app = searchResults[highlightedIndex]
      setSelectedApp(app)
      setSearchTerm(app.appName)
      setAppId(app.appId)
      setShowDropdown(false)
      setSearchResults([])
      setResult(null)
      setError(null)
      setHighlightedIndex(-1)
    }
  }

  function handleEscape() {
    setShowDropdown(false)
    setHighlightedIndex(-1)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || searchResults.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      handleArrowDown()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      handleArrowUp()
    } else if (e.key === "Enter") {
      handleEnter()
    } else if (e.key === "Escape") {
      handleEscape()
    }
  }

  // Reset highlight when dropdown opens or search results change
  useEffect(() => {
    if (showDropdown) setHighlightedIndex(0)
    else setHighlightedIndex(-1)
  }, [showDropdown, searchResults])

  function sortReviews(reviews: Review[]): Review[] {
    return [...reviews].sort((a, b) => {
      if (a.version !== b.version) {
        return b.version.localeCompare(a.version, undefined, {
          numeric: true,
          sensitivity: "base"
        })
      }
      return new Date(b.updated).getTime() - new Date(a.updated).getTime()
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8">
      <h1 className="text-2xl font-bold mb-4">App Store Reviews Collector</h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        <div className="relative" ref={dropdownRef}>
          <input
            className={`border rounded px-3 py-2 w-full ${
              loading ? "opacity-50" : ""
            }`}
            type="text"
            placeholder="Search for an app (e.g., 'Instagram', 'TikTok', 'WhatsApp')"
            value={searchTerm}
            disabled={loading}
            onChange={e => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {!selectedApp && showDropdown && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((app, idx) => (
                <div
                  key={app.appId}
                  className={`px-3 py-2 cursor-pointer border-b border-gray-800 last:border-b-0 text-gray-100 ${
                    idx === highlightedIndex
                      ? "bg-blue-600"
                      : "hover:bg-gray-800"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onMouseDown={e => {
                    // Prevent input blur before click
                    e.preventDefault()
                    setSelectedApp(app)
                    setSearchTerm(app.appName)
                    setAppId(app.appId)
                    setShowDropdown(false)
                    setSearchResults([])
                    setResult(null)
                    setError(null)
                    setHighlightedIndex(-1)
                  }}
                >
                  <div className="font-medium text-gray-100">{app.appName}</div>
                  <div className="text-sm text-gray-400">{app.developer}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <select
          className={`border rounded px-3 py-2 ${loading ? "opacity-50" : ""}`}
          value={reviewsCount}
          disabled={loading}
          onChange={e => setReviewsCount(Number(e.target.value))}
        >
          {[100, 200, 500].map(value => (
            <option key={value} value={value}>
              {value} reviews
            </option>
          ))}
        </select>

        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed ${
            loading ? "opacity-50" : ""
          }`}
          onClick={handleGetReviews}
          disabled={loading || !selectedApp}
        >
          {loading ? "Loading..." : "Get Reviews"}
        </button>
      </div>

      {error && <div className="text-red-500">Error: {error}</div>}

      {result &&
        result.reviews &&
        Array.isArray(result.reviews) &&
        result.reviews.length > 0 &&
        (() => {
          const sortedReviews = sortReviews(result.reviews as Review[])

          // Get first review date for heading
          const firstReview = sortedReviews[sortedReviews.length - 1]
          const since = firstReview ? new Date(firstReview.updated) : null
          const sinceStr = since
            ? since.toLocaleString("default", {
                month: "long",
                year: "numeric"
              })
            : ""
          const count = sortedReviews.length
          const reviewWord = count === 1 ? "review" : "reviews"

          return (
            <div className="w-full max-w-2xl mt-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">
                  {`${count} ${reviewWord} for ${
                    result.appName || ""
                  } since ${sinceStr}.`}
                </h2>
                <button
                  onClick={downloadResults}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Download JSON
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {sortedReviews.map((review, idx) => (
                  <ReviewCard
                    review={review}
                    key={`${review.id}-${review.updated}-${idx}`}
                  />
                ))}
              </div>
            </div>
          )
        })()}
    </div>
  )
}
