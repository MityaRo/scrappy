// Pulls AppStore reviews for a specified number of pages for a specifiec appId
// and saves them to an output text and JSON files (ChatGPT seems to handle JSON better)

// To run, make sure node is installed, then run "npm i && npm start"
// n.b.: Make sure package.json file is in the same folder

// @ts-expect-error: No type definitions for 'app-store-scraper'
import store from "app-store-scraper"
import fs from "fs"
import path from "path"

const APPS = [
  { appName: "preply", appId: "1352790442" },
  { appName: "italki", appId: "1140000003" },
  { appName: "cambly", appId: "564024107" },
  { appName: "verbling", appId: "1170152447" }
]

const PAGES_COUNT: number = 10 // there are 50 reviews per page

const OUTPUT_DIR = "output"

// Clean and ensure output directory exists
if (fs.existsSync(OUTPUT_DIR)) {
  // Read all files in the directory
  const files = fs.readdirSync(OUTPUT_DIR)

  // Delete each file
  for (const file of files) {
    fs.unlinkSync(path.join(OUTPUT_DIR, file))
  }
  console.log("Cleaned output directory.")
} else {
  fs.mkdirSync(OUTPUT_DIR)
  console.log("Created output directory.")
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

async function collectReviewsForApp(appId: string, appName: string) {
  const rawResults = await Promise.all(
    [...Array(PAGES_COUNT).keys()].map(page =>
      store.reviews({
        id: appId,
        sort: store.sort.RECENT,
        page: page
      })
    )
  )
  const results: Review[] = rawResults.flat()

  const text_reslts = results.reduce(
    (output, currentReview) =>
      (output += `[${currentReview["updated"]}] ${
        currentReview["title"]
      } - ${currentReview["text"].replace(/\n/g, " ")}\n`),
    ""
  )

  // txt files are convenient for text search and human analysis
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${appName}-appstore-reviews.txt`),
    text_reslts
  )
  console.log(`Reviews saved as text for ${appName}.`)

  // json files work best for ChatGPT analysis
  fs.writeFileSync(
    path.join(OUTPUT_DIR, `${appName}-appstore-reviews.json`),
    JSON.stringify(results)
  )
  console.log(`Reviews saved as JSON for ${appName}.`)
}

Promise.all(
  APPS.map(app => collectReviewsForApp(app.appId, app.appName))
).catch(console.log)

// Save the APPS array to the output directory
fs.writeFileSync(
  path.join(OUTPUT_DIR, "apps.json"),
  JSON.stringify(APPS, null, 2)
)
console.log("Saved APPS array to output/apps.json")
