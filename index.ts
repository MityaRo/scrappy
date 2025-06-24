// Pulls AppStore reviews for a specified number of pages for a specifiec appId
// and saves them to an output text and JSON files (ChatGPT seems to handle JSON better)

// To run, make sure node is installed, then run "npm i && npm start"
// n.b.: Make sure package.json file is in the same folder

// @ts-expect-error: No type definitions for 'app-store-scraper'
import store from "app-store-scraper"
import fs from "fs"
import path from "path"

const PREPLY_ID = "1352790442" // from AppStore url parameters
const PREPLY_APP_NAME = "preply" // any name, used for output labelling

const ITALKI_ID = "1140000003"
const ITALKI_APP_NAME = "italki"

const CAMBLY_ID = "564024107"
const CAMBLY_APP_NAME = "cambly"

const VERBLING_ID = "1170152447"
const VERBLING_APP_NAME = "verbling"

const APP_ID: string = VERBLING_ID
const APP_NAME: string = VERBLING_APP_NAME

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

Promise.all(
  [...Array(PAGES_COUNT).keys()].map(page =>
    store.reviews({
      id: APP_ID,
      sort: store.sort.RECENT,
      page: page
    })
  )
)
  .then((rawResults: Review[][]) => {
    const results: Review[] = rawResults.flat()

    const text_reslts = results.reduce(
      (output, currentReview) =>
        (output += `[${currentReview["updated"]}] ${
          currentReview["title"]
        } - ${currentReview["text"].replace(/\n/g, " ")}\n`),
      ""
    )

    // txt files are convenient for text search and human analysis
    fs.writeFile(
      path.join(OUTPUT_DIR, `${APP_NAME}-appstore-reviews.txt`),
      text_reslts,
      err => {
        if (err) throw err
        console.log("Reviews saved as text.")
      }
    )

    // json files work best for ChatGPT analysis
    fs.writeFile(
      path.join(OUTPUT_DIR, `${APP_NAME}-appstore-reviews.json`),
      JSON.stringify(results),
      err => {
        if (err) throw err
        console.log("Reviews saved as JSON.")
      }
    )
  })
  .catch(console.log)
