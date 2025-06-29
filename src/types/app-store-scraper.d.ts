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

  export interface SearchResult {
    id: number
    appId: string
    title: string
    developer: string
    // Add more fields as needed
  }

  export function reviews(options: ReviewsOptions): Promise<Review[]>
  export function search(options: {
    term: string
    num?: number
    country?: string
  }): Promise<SearchResult[]>

  const store: {
    reviews: typeof reviews
    search: typeof search
    sort: {
      RECENT: string
      // Add other sort options if needed
    }
  }

  export default store
}
