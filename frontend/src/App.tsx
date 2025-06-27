import { useState } from "react"
import "./App.css"

interface AppInput {
  appName: string
  appId: string
}

interface Review {
  id: string
  userName: string
  userUrl: string
  version: string
  score: number
  title: string
  text: string
  url: string
  updated: string
}

interface AppResult {
  appName: string
  appId: string
  reviews: Review[]
}

function App() {
  const [apps, setApps] = useState<AppInput[]>([{ appName: "", appId: "" }])
  const [pagesCount, setPagesCount] = useState(1)
  const [results, setResults] = useState<AppResult[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAppChange = (
    idx: number,
    field: keyof AppInput,
    value: string
  ) => {
    setApps(apps => {
      const newApps = [...apps]
      newApps[idx][field] = value
      return newApps
    })
  }

  const addApp = () => setApps([...apps, { appName: "", appId: "" }])
  const removeApp = (idx: number) =>
    setApps(apps => (apps.length > 1 ? apps.filter((_, i) => i !== idx) : apps))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const response = await fetch("http://localhost:3001/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apps, pagesCount })
      })
      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error || "Unknown error")
      }
      const data = await response.json()
      setResults(data.results)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Failed to fetch reviews")
      } else {
        setError("Failed to fetch reviews")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>App Store Reviews Collector</h1>
      <form onSubmit={handleSubmit} className="review-form">
        <label>
          Pages Count:
          <input
            type="number"
            min={1}
            max={10}
            value={pagesCount}
            onChange={e => setPagesCount(Number(e.target.value))}
            required
          />
        </label>
        <h2>Apps</h2>
        {apps.map((app, idx) => (
          <div key={idx} className="app-input-row">
            <input
              type="text"
              placeholder="App Name"
              value={app.appName}
              onChange={e => handleAppChange(idx, "appName", e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="App ID"
              value={app.appId}
              onChange={e => handleAppChange(idx, "appId", e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => removeApp(idx)}
              disabled={apps.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={addApp} className="add-app-btn">
          Add App
        </button>
        <br />
        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Collecting..." : "Collect Reviews"}
        </button>
      </form>
      {error && <div className="error">Error: {error}</div>}
      {results && (
        <div className="results">
          <h2>Results</h2>
          {results.map(appResult => (
            <div key={appResult.appId} className="app-result">
              <h3>
                {appResult.appName} ({appResult.appId})
              </h3>
              <p>Total reviews: {appResult.reviews.length}</p>
              <ul>
                {appResult.reviews.map(review => (
                  <li key={review.id}>
                    <strong>{review.title}</strong> by {review.userName} (Score:{" "}
                    {review.score})<br />
                    <em>{review.updated}</em>
                    <br />
                    {review.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
