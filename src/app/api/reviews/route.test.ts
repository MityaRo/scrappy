/**
 * @jest-environment node
 */
import { POST } from "./route"
import type { NextRequest } from "next/server"

jest.mock("app-store-scraper", () => ({
  __esModule: true,
  default: {
    reviews: jest.fn().mockResolvedValue([
      {
        id: "1",
        userName: "User",
        userUrl: "url",
        version: "1.0",
        score: 5,
        title: "Great",
        text: "Nice app",
        url: "review_url",
        updated: "2024-01-01T00:00:00Z"
      }
    ]),
    sort: { RECENT: "mostRecent" }
  }
}))

describe("/api/reviews", () => {
  it("returns 400 for missing fields", async () => {
    const req = {
      json: async () => ({ appName: "Test", appId: "" }) // missing pagesCount
    } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it("returns reviews for valid payload", async () => {
    const req = {
      json: async () => ({
        appName: "Test",
        appId: "123",
        pagesCount: 1
      })
    } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.reviews) || Array.isArray(data.results)).toBe(
      true
    )
  })

  it("returns 500 on scraper error", async () => {
    const { default: store } = await import("app-store-scraper")
    ;(store.reviews as jest.Mock).mockRejectedValueOnce(new Error("fail"))
    const req = {
      json: async () => ({
        appName: "Test",
        appId: "123",
        pagesCount: 1
      })
    } as unknown as NextRequest
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
