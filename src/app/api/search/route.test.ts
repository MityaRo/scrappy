/**
 * @jest-environment node
 */
import { GET } from "./route"
import type { NextRequest } from "next/server"

jest.mock("app-store-scraper", () => ({
  __esModule: true,
  default: {
    search: jest
      .fn()
      .mockResolvedValue([
        { appId: "123", title: "Test App", developer: "Dev" }
      ])
  }
}))

describe("/api/search", () => {
  it("returns empty array for short query", async () => {
    const req = {
      url: "http://localhost/api/search?q=a"
    } as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(0)
  })

  it("returns results for valid query", async () => {
    const req = {
      url: "http://localhost/api/search?q=facebook"
    } as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data[0]).toHaveProperty("appId")
    expect(data[0]).toHaveProperty("appName")
    expect(data[0]).toHaveProperty("developer")
  })

  it("returns 500 on error", async () => {
    const { default: store } = await import("app-store-scraper")
    ;(store.search as jest.Mock).mockRejectedValueOnce(new Error("fail"))
    const req = {
      url: "http://localhost/api/search?q=facebook"
    } as unknown as NextRequest
    const res = await GET(req)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBe(0)
  })
})
