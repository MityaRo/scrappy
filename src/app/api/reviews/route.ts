import { NextRequest, NextResponse } from "next/server"
import store from "app-store-scraper"

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
        page: page + 1
      })
    )
  )
  const results: Review[] = rawResults.flat()
  return { appName, appId, reviews: results }
}

export async function POST(req: NextRequest) {
  // there are 50 reviews per page
  const defaultPagesCount = 10

  try {
    const body = await req.json()
    const { appName, appId, pagesCount } = body as {
      appName: string
      appId: string
      pagesCount?: number
    }

    if (!appName || !appId) {
      return NextResponse.json(
        { error: "Invalid request body: appName and appId are required" },
        { status: 400 }
      )
    }

    const count =
      typeof pagesCount === "number" && pagesCount > 0
        ? pagesCount
        : defaultPagesCount

    const result = await collectReviewsForApp(appId, appName, count)

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch reviews", details: err },
      { status: 500 }
    )
  }
}
