import request from "supertest"
import app from "./server"

describe("POST /api/reviews", () => {
  it("should return reviews for valid apps", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({
        apps: [{ appName: "preply", appId: "1352790442" }],
        pagesCount: 1
      })
      .set("Accept", "application/json")

    expect(res.status).toBe(200)
    expect(res.body.results).toBeDefined()
    expect(Array.isArray(res.body.results)).toBe(true)
    expect(res.body.results[0].appName).toBe("preply")
    expect(res.body.results[0].reviews.length).toBeGreaterThan(0)
  })

  it("should return 400 for invalid request", async () => {
    const res = await request(app)
      .post("/api/reviews")
      .send({ apps: "not-an-array", pagesCount: "not-a-number" })
      .set("Accept", "application/json")

    expect(res.status).toBe(400)
    expect(res.body.error).toBeDefined()
  })
})
