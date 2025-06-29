import React from "react"
import type { Review } from "app-store-scraper"
import ReviewStars from "./ReviewStars"

export default function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded p-4 text-gray-100">
      <div className="flex flex-wrap gap-4 items-center mb-2">
        <span className="font-bold text-blue-400">v{review.version}</span>
        <ReviewStars score={review.score} />
        <span className="text-xs text-gray-400">
          {new Date(review.updated).toLocaleDateString()}
        </span>
        <span className="text-xs text-gray-500">by {review.userName}</span>
      </div>
      <div className="font-semibold text-lg mb-1">{review.title}</div>
      <div className="text-gray-200 whitespace-pre-line mb-1">
        {review.text}
      </div>
    </div>
  )
}
