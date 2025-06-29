import React from "react"

export default function ReviewStars({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        let color = "text-gray-700"
        if (score >= 5) color = "text-yellow-400"
        else if (score === 4) color = "text-orange-400"
        else if (score === 3) color = "text-yellow-300"
        else if (score === 2) color = "text-gray-400"
        else if (score === 1) color = "text-gray-600"
        return (
          <span key={i} className={i < score ? color : "text-gray-800"}>
            ★
          </span>
        )
      })}
    </span>
  )
}
