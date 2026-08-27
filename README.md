# TripWise — AI-Powered Travel Planner

Multi-city travel planning with flight and hotel search, weather-aware packing suggestions, and an AI trip planner — all enhanced with [WebMCP](https://learn.chatgpt.com/docs/webmcp) so AI agents can work alongside you in the browser.

## Features

- **Multi-city flight search** — find itineraries across multiple destinations with pricing and durations
- **Hotel recommendations** — matched to your itinerary cities with ratings, amenities, and nightly rates
- **Weather overview** — forecasts for each destination with date-specific conditions
- **Smart packing suggestions** — weather-aware recommendations tailored to your entire route
- **AI Trip Planner** — describe your dream trip and the agent plans it using WebMCP tools
- **E-commerce flow** — add trips to cart, checkout with traveler details, pay, and receive booking confirmation
- **Travel Guide** — post-booking airport-to-city transport options and places to visit per destination
- **Dark/Light mode** — hybrid theme with persistent dark sidebar and toggleable main content
- **WebMCP integration** — 11 tools exposed to AI agents via the WebMCP standard

## WebMCP

TripWise implements [WebMCP (Site Tools)](https://learn.chatgpt.com/docs/webmcp) to give AI agents direct access to travel planning tools from within the browser.

### Registered Tools

| Tool | Type | Description |
|------|------|-------------|
| `search_flights` | Read | Search multi-city flight itineraries by origin, destinations, and date |
| `search_hotels` | Read | Search hotels by city and check-in date |
| `get_weather_and_packing` | Read | Get weather forecasts and packing recommendations |
| `get_hotel_details` | Read | Get full details for a specific hotel by ID |
| `create_trip` | Write | Create a new trip with destinations, dates, and traveler count |
| `select_flight` | Write | Add a flight to the trip itinerary |
| `select_hotel` | Write | Add a hotel to the trip itinerary |
| `prepare_booking` | Read | Generate booking summary with cost breakdown |
| `save_trip` | Write | Save the trip to the user's saved trips list |
| `add_to_cart` | Write | Add a trip to the shopping cart |
| `get_travel_guide` | Read | Get airport-to-city transport and places to visit |

### How it works

A `WebMCPRegistrar` client component mounted in the root layout registers all tools via `document.modelContext.registerTool()` on page load. Each tool includes:
- A JSON Schema `inputSchema` for structured arguments
- An `annotations.readOnlyHint` flag per the WebMCP spec
- An `execute` handler that either calls the `/api/mcp` backend (for DB queries) or operates on localStorage directly (for cart/save operations)

### Testing with ChatGPT

1. Deploy the app (e.g., to Netlify)
2. Open the deployed URL in the **ChatGPT desktop app's built-in browser**
3. Use GPT-5.6 Sol or GPT-5.6 Terra (Luna has WebMCP disabled)
4. Ask ChatGPT to help plan a trip — it will discover and use the registered tools
5. Click **Site tools** in the browser address bar to inspect available tools

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — CSS Custom Properties + CSS Modules
- **Database** — SQLite (via better-sqlite3)
- **State** — React Context + localStorage persistence
- **Icons** — Lucide React
- **AI integration** — WebMCP standard (Site Tools)

## User Flow

```
Home (Search) → Save Trip → Add Hotels (optional) → Add to Cart → Checkout → Payment → Booking Confirmation + Travel Guide
```

The AI Planner can handle the entire flow conversationally:
```
"Plan a 10-day trip from Paris to London and Rome" → "Add to cart" → navigates to checkout
```

## Deployment

Deploy to Netlify, Vercel, or any platform that supports Next.js:

```bash
npm run build
```

For WebMCP to work with ChatGPT, the app must be publicly accessible and opened in ChatGPT's built-in desktop browser.
