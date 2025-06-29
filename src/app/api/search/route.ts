import { NextRequest, NextResponse } from "next/server"
import store from "app-store-scraper"
import type { SearchResult } from "app-store-scraper"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const term = searchParams.get("q")
  if (!term || term.length < 2) {
    return NextResponse.json([])
  }
  try {
    const results = await store.search({
      term,
      num: 10,
      country: "us"
    })
    const mapped = results.map((app: SearchResult) => ({
      appId: app.appId,
      appName: app.title,
      developer: app.developer
    }))
    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
