# Architecture

## Overview

TripWise is a Next.js 16 App Router application that functions as a multi-city travel planner with e-commerce capabilities and WebMCP integration for AI agent collaboration.

## Directory Structure

```
tripwise/
├── app/
│   ├── layout.js                 # Root layout with providers (Theme, Cart, SavedTrips)
│   ├── globals.css               # Design system: CSS variables, light/dark themes, resets
│   ├── page.js                   # Home — search, itinerary, weather, hotels
│   │
│   ├── api/
│   │   ├── mcp/route.js          # WebMCP tool execution endpoint (GET manifest, POST tool calls)
│   │   ├── flights/route.js      # Flight search REST API (queries SQLite)
│   │   └── hotels/route.js       # Hotel search REST API (queries SQLite)
│   │
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AiPlannerModal.js         # AI trip planner chat interface
│   │   │   └── AiPlannerModal.module.css
│   │   ├── hotels/
│   │   │   ├── HotelCarousel.js          # Hotel cards with "Add to Trip" button
│   │   │   └── HotelCarousel.module.css
│   │   ├── itinerary/
│   │   │   ├── ItineraryTimeline.js      # Flight timeline + price summary card
│   │   │   └── ItineraryTimeline.module.css
│   │   ├── layout/
│   │   │   ├── Sidebar.js               # Navigation sidebar with cart badge
│   │   │   ├── Sidebar.module.css
│   │   │   └── ClientOnly.js            # Suppresses SSR for client-only components
│   │   ├── mcp/
│   │   │   └── WebMCPRegistrar.js       # Registers WebMCP tools on page load
│   │   ├── search/
│   │   │   ├── SearchBar.js             # Multi-city search with date range
│   │   │   └── SearchBar.module.css
│   │   ├── travel/
│   │   │   └── TravelGuide.js           # Post-booking transport + places to visit
│   │   └── weather/
│   │       ├── WeatherOverview.js        # Weather cards + packing suggestions
│   │       └── WeatherOverview.module.css
│   │
│   ├── context/
│   │   ├── CartContext.js         # Shopping cart state (localStorage-backed)
│   │   ├── SavedTripsContext.js   # Saved trips state (localStorage-backed)
│   │   └── ThemeContext.js        # Dark/light theme toggle
│   │
│   ├── data/
│   │   ├── flights.json           # Static flight data + bestItinerary fallback
│   │   ├── hotels.json            # Static hotel data for default display
│   │   ├── packing-rules.json     # Weather conditions → packing recommendations
│   │   └── travel-guide.json      # Airport transport + places to visit per city
│   │
│   ├── cart/page.js               # Cart — view items, adjust quantity, checkout
│   ├── checkout/page.js           # Checkout — traveler details form + order summary
│   ├── payment/page.js            # Payment — card form + simulated processing
│   ├── booking-confirmation/page.js # Confirmation — details + TravelGuide
│   ├── trips/page.js              # Saved trips with Add to Cart / Delete
│   ├── flights/page.js            # Saved flight itineraries
│   ├── itinerary/page.js          # Multi-city itinerary view
│   ├── hotels/page.js             # Hotel browsing
│   ├── weather/page.js            # Weather forecasts
│   ├── packing/page.js            # Packing guide
│   ├── explore/page.js            # Explore destinations
│   ├── deals/page.js              # Deals page
│   ├── account/page.js            # User account
│   └── settings/page.js           # App settings
│
├── lib/
│   └── db.js                      # SQLite queries (flights, hotels, by-ID lookups)
│
├── tripwise.db                    # SQLite database (flights + hotels tables)
└── next.config.mjs
```

## Data Flow

### Search → Save → Cart → Payment

```
SearchBar.handleSearch()
  → GET /api/flights?origin=X&destination=Y&date=Z
  → Results passed to ItineraryTimeline + HotelCarousel

ItineraryTimeline.handleSaveTrip()
  → SavedTripsContext.saveTrip(trip)  → localStorage

HotelCarousel.addHotelToTrip()
  → SavedTripsContext.updateTrip(trip)  → localStorage (appends hotel, updates cost)

Trips page → "Add to Cart"
  → CartContext.addToCart(trip)  → localStorage

Cart page → "Proceed to Checkout"
  → /checkout → traveler form → localStorage('tripwise_checkout_info')

Checkout → "Continue to Payment"
  → /payment → card form → simulated delay → localStorage('tripwise_confirmed_booking')
  → CartContext.clearCart()
  → redirect /booking-confirmation

BookingConfirmation
  → reads localStorage('tripwise_confirmed_booking')
  → renders TravelGuide for each destination
```

### WebMCP Tool Execution

```
Browser AI agent (ChatGPT)
  → discovers tools via document.modelContext.registerTool()
  → calls execute(params)
    → Client-side tools (save_trip, add_to_cart, get_travel_guide): operate on localStorage/JSON
    → Server-side tools (search_flights, search_hotels, etc.): POST /api/mcp → SQLite
```

### AI Planner Flow

```
User message → parseUserMessage() extracts:
  - cities (from known list)
  - dates (natural language → YYYY-MM-DD)
  - traveler count
  - intent (plan_trip | add_to_cart | checkout)

Plan trip intent:
  create_trip → search_flights(origin) → select_flight
  → search_hotels(dest) → get_hotel_details → select_hotel
  → get_weather_and_packing → prepare_booking → save_trip

Add to cart intent:
  → CartContext.addToCart(savedTrips[0])

Checkout intent:
  → directs user to /cart
```

## State Management

| Context | Storage | Purpose |
|---------|---------|---------|
| `ThemeContext` | localStorage(`tripwise-theme`) | Dark/light mode, applied via `data-theme` on `<html>` |
| `CartContext` | localStorage(`tripwise_cart`) | Shopping cart items with quantity |
| `SavedTripsContext` | localStorage(`tripwise_saved_trips`) | Planned trips with flights/hotels/cost |

All contexts use a hydration guard (`useRef` + `isHydrated` state) to prevent race conditions between loading from localStorage and the save effect overwriting with empty state.

## Theming

The app uses a hybrid theme approach:
- **Sidebar** always stays dark (CSS variables scoped to `:root`)
- **Main content** switches between dark and light (`[data-theme="light"] .main-content` overrides CSS variables)
- Theme persists via localStorage and respects `prefers-color-scheme` on first visit

## Database Schema

```sql
CREATE TABLE flights (
  id TEXT PRIMARY KEY,
  airline TEXT, airlineCode TEXT, flightNumber TEXT,
  origin TEXT, originCity TEXT, destination TEXT, destinationCity TEXT,
  date TEXT, departureTime TEXT, arrivalTime TEXT,
  duration TEXT, stops INTEGER, price REAL,
  class TEXT, aircraft TEXT, baggage TEXT, bestValue INTEGER
);

CREATE TABLE hotels (
  id TEXT PRIMARY KEY,
  name TEXT, city TEXT, country TEXT,
  rating REAL, reviewCount INTEGER,
  pricePerNight REAL, currency TEXT,
  date TEXT, nights INTEGER, image TEXT,
  amenities TEXT, badge TEXT, distanceToCenter TEXT, stars INTEGER
);
```

## WebMCP Integration

Tools are registered in `WebMCPRegistrar.js` using three discovery mechanisms:

1. **Standard WebMCP API** — `document.modelContext.registerTool()` (ChatGPT desktop browser)
2. **Global inspection** — `window.__WEBMCP_TOOLS__` (DevTools, extensions)
3. **DOM manifest** — `<script type="application/json" id="webmcp-tools-manifest">` (scrapers)

Each tool includes `annotations.readOnlyHint` to inform the browser whether the tool modifies state.

## Key Design Decisions

- **No external auth** — the app is stateless per-session; all persistence is localStorage
- **SQLite for read data** — flights/hotels are in a local DB for fast structured queries
- **In-memory trip store** — server-side trip state (for the MCP workflow) uses a `Map` that resets on restart; final persistence is client-side
- **Hybrid theme** — sidebar stays dark to maintain brand identity while main content respects user preference
- **Progressive enhancement** — the app works without WebMCP; the AI planner uses the same `/api/mcp` endpoint that WebMCP tools call
