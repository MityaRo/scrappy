import { NextRequest, NextResponse } from "next/server"
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

export async function POST(req: NextRequest) {
  const defaultPagesCount = 10
  try {
    const body = await req.json()
    const { apps, pagesCount } = body as {
      apps: AppInput[]
      pagesCount?: number
    }

    if (!Array.isArray(apps)) {
      return NextResponse.json(
        { error: "Invalid request body: apps must be an array" },
        { status: 400 }
      )
    }

    const count =
      typeof pagesCount === "number" && pagesCount > 0
        ? pagesCount
        : defaultPagesCount

    const allResults = await Promise.all(
      apps.map(app => collectReviewsForApp(app.appId, app.appName, count))
    )

    return NextResponse.json({ results: allResults })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: err },
      { status: 500 }
    )
  }
}
