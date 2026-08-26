# TripWise — AI-Powered Travel Planner

Multi-city travel planning with flight and hotel search, weather-aware packing suggestions, and an AI trip planner — all enhanced with WebMCP so AI agents can work alongside you in the browser.

## Features

- **Multi-city flight search** — find itineraries across multiple destinations with pricing and durations
- **Hotel recommendations** — matched to your itinerary cities with ratings, amenities, and nightly rates
- **Weather overview** — forecasts for each destination with date-specific conditions
- **Smart packing suggestions** — weather-aware recommendations tailored to your entire route
- **AI Trip Planner** — describe your dream trip and let AI build the itinerary
- **Dark/Light mode** — hybrid theme with persistent dark sidebar and toggleable main content
- **WebMCP integration** — exposes travel tools to AI agents via the WebMCP standard

## WebMCP

TripWise implements [WebMCP](https://learn.chatgpt.com/docs/webmcp) to give AI agents direct access to travel planning tools from within the browser.

### Registered Tools

| Tool | Description |
|------|-------------|
| `search_flights` | Search multi-city flight itineraries by origin, destinations, and date |
| `search_hotels` | Search hotels by city and check-in date |
| `get_weather_and_packing` | Get weather forecasts and packing recommendations for destination cities |

### How it works

A `WebMCPRegistrar` component in the root layout registers tools via `document.modelContext.registerTool()` on page load. Each tool's `execute` handler calls the `/api/mcp` backend which queries a SQLite database for flights/hotels and returns structured JSON.

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

- **Framework** — Next.js (App Router)
- **Styling** — CSS Custom Properties + CSS Modules
- **Database** — SQLite (via better-sqlite3)
- **Icons** — Lucide React
- **AI integration** — WebMCP standard

## Project Structure

```
app/
  api/mcp/           — MCP tool execution endpoint (GET manifest, POST tool calls)
  components/
    ai/              — AI Planner modal
    hotels/          — Hotel carousel
    itinerary/       — Flight itinerary timeline
    layout/          — Sidebar, ClientOnly wrapper
    mcp/             — WebMCPRegistrar component
    search/          — Search bar with multi-city support
    weather/         — Weather overview and packing suggestions
  context/           — SavedTripsContext, ThemeContext
  data/              — Static packing rules JSON
lib/
  db.js             — SQLite database queries
```

## Deployment

Deploy to Netlify, Vercel, or any platform that supports Next.js:

```bash
npm run build
```

For WebMCP to work with ChatGPT, the app must be publicly accessible and opened in ChatGPT's built-in desktop browser.
