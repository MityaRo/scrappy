import express from "express"
import cors from "cors"
// @ts-expect-error: No type definitions for 'app-store-scraper'
import store from "app-store-scraper"

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

type AppInfo = {
  appName: string
  appId: string
}

type Review = {
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

async function collectReviewsForApp(
  appId: string,
  appName: string,
  pagesCount: number
) {
  const rawResults = await Promise.all(
    [...Array(pagesCount).keys()].map(page =>
      store.reviews({
        id: appId,
        sort: store.sort.RECENT,
        page: page
      })
    )
  )
  const results: Review[] = rawResults.flat()
  return { appName, appId, reviews: results }
}

app.post("/api/reviews", async (req, res) => {
  const { apps, pagesCount } = req.body as {
    apps: AppInfo[]
    pagesCount: number
  }
  if (!Array.isArray(apps) || typeof pagesCount !== "number") {
    return res.status(400).json({ error: "Invalid request body" })
  }
  try {
    const allResults = await Promise.all(
      apps.map(app => collectReviewsForApp(app.appId, app.appName, pagesCount))
    )
    res.json({ results: allResults })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", details: err })
  }
})

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`)
})
