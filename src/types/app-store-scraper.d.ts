declare module "app-store-scraper" {
  export interface Review {
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

  export interface ReviewsOptions {
    id: string
    sort?: string
    page?: number
  }

  export function reviews(options: ReviewsOptions): Promise<Review[]>

  const store: {
    reviews: typeof reviews
    sort: {
      RECENT: string
      // Add other sort options if needed
    }
  }

  export default store
}
