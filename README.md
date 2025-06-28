# Scrappy - App Store Reviews Collector

_(vibecoded all the way:) )_

Scrappy is a web application that allows you to collect and analyze App Store reviews for iOS applications. Built with Next.js, it provides a simple interface to fetch reviews from the Apple App Store and download them as JSON files.

## 🚀 Quick Start

1. **Enter App Information:**

   - **App Name**: The name of the iOS app (e.g., "WalkFit")
   - **App ID**: The unique identifier from the App Store URL (e.g., "1457956232")

2. **Get Reviews Automatically:**

   - As soon as both fields are filled, reviews are fetched automatically
   - Results appear in real-time

3. **Download Data:**
   - Click "Download JSON" to save the review data
   - Files are named: `reviews-{appName}-{appId}.json`

## 📖 How to Use

### Finding App IDs

To find an app's ID:

1. Go to the App Store
2. Search for the app
3. Copy the ID from the URL: `https://apps.apple.com/app/id{APP_ID}`

**Example:** For WalkFit, the URL is `https://apps.apple.com/app/id1457956232`, so the App ID is `1457956232`

### What You Get

Each review contains:

- **User information** (name, profile URL)
- **Review details** (title, text, rating, date)
- **App version** and review URL
- **Structured JSON format** for easy analysis

## ✨ Features

- **Real-time Review Collection**: Fetch the latest reviews from the Apple App Store
- **Automatic Data Fetching**: No need to click submit - data loads as you type
- **JSON Export**: Download review data as structured JSON files
- **Multiple App Support**: Collect reviews for multiple apps in a single request
- **Configurable Page Count**: Control how many pages of reviews to fetch (50 reviews per page)
- **Serverless Architecture**: Built with Next.js API routes for scalability
- **Responsive Design**: Works on desktop and mobile devices

## 🎯 Use Cases

Perfect for:

- **Developers** analyzing user feedback for their apps
- **Marketers** monitoring competitor app reviews
- **Researchers** studying app store trends and user sentiment
- **Product Managers** gathering user insights

## 🛠️ Installation & Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Local Development

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd scrappy
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 API Reference

### POST `/api/reviews`

**Request Body:**

```json
{
  "apps": [
    {
      "appName": "WalkFit",
      "appId": "1457956232"
    }
  ],
  "pagesCount": 10
}
```

**Response:**

```json
{
  "results": [
    {
      "appName": "WalkFit",
      "appId": "1457956232",
      "reviews": [...]
    }
  ]
}
```

## 🏗️ Technical Details

### Architecture

- **Frontend**: Next.js 14 with App Router, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Data Source**: app-store-scraper library

### Data Structure

Each review contains:

```json
{
  "id": "review_id",
  "userName": "User Name",
  "userUrl": "user_profile_url",
  "version": "app_version",
  "score": 5,
  "title": "Review Title",
  "text": "Review content...",
  "url": "review_url",
  "updated": "2024-01-15T10:30:00-07:00"
}
```

## 🚀 Deployment

The app can be deployed to any platform that supports Next.js applications.

No environment variables required for basic functionality.

## ⚠️ Important Notes

- **Rate Limiting**: Apple may limit requests if too many are made in a short time
- **Cold Starts**: Serverless functions may have initial latency on first request
- **Browser Filename Override**: Some browsers may rename downloaded files
- **Educational Use**: This tool is for educational and research purposes. Please respect Apple's terms of service.

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on the GitHub repository.
