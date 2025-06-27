import type { VercelRequest, VercelResponse } from "@vercel/node"
// @ts-expect-error: No type definitions for 'app-store-scraper'
import store from "app-store-scraper"

type AppInput = {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const defaultPagesCount = 10

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" })
    return
  }

  const { apps, pagesCount } = req.body as {
    apps: AppInput[]
    pagesCount?: number
  }

  if (!Array.isArray(apps)) {
    res
      .status(400)
      .json({ error: "Invalid request body: apps must be an array" })
    return
  }

  const count =
    typeof pagesCount === "number" && pagesCount > 0
      ? pagesCount
      : defaultPagesCount

  try {
    const allResults = await Promise.all(
      apps.map(app => collectReviewsForApp(app.appId, app.appName, count))
    )

    res.setHeader("Content-Type", "application/json")
    res.status(200).json({ results: allResults })
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews", details: err })
  }
}
