'use client';

import { useEffect } from 'react';

const mcpTools = [
  {
    name: "search_flights",
    description: "Search multi-city flight itineraries between cities (Marseille, Paris, Tokyo, Kyoto, Osaka, London, Rome). Returns flight legs, airlines, durations, and prices.",
    inputSchema: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin city or airport code" },
        destinations: { type: "array", items: { type: "string" }, description: "List of destination cities" },
        date: { type: "string", description: "Date of travel (YYYY-MM-DD)" }
      },
      required: ["origin", "destinations"]
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "search_hotels",
    description: "Search hotels matched to itinerary cities with ratings, pricing per night, and amenities.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City to search hotels in (Marseille, Tokyo, Kyoto, Osaka, London, Rome)" },
        date: { type: "string", description: "Check-in date (YYYY-MM-DD)" }
      }
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "get_weather_and_packing",
    description: "Get weather forecasts and smart packing recommendations for trip destinations.",
    inputSchema: {
      type: "object",
      properties: {
        cities: { type: "array", items: { type: "string" }, description: "Cities to get weather for" }
      }
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "get_hotel_details",
    description: "Get full details for a specific hotel by ID, including amenities, star rating, distance to center, and nightly price.",
    inputSchema: {
      type: "object",
      properties: {
        hotel_id: { type: "string", description: "The hotel ID from search results" }
      },
      required: ["hotel_id"]
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "create_trip",
    description: "Create a new trip with destinations, dates, and traveler count. Returns a trip ID for selecting flights and hotels.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Trip name (e.g. 'Japan Adventure')" },
        destinations: { type: "array", items: { type: "string" }, description: "List of destination cities" },
        start_date: { type: "string", description: "Trip start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "Trip end date (YYYY-MM-DD)" },
        travelers: { type: "number", description: "Number of travelers" }
      },
      required: ["name", "destinations", "start_date", "end_date"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: "select_flight",
    description: "Select a flight for the trip by flight ID. Adds it to the trip itinerary.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: { type: "string", description: "The trip ID from create_trip" },
        flight_id: { type: "string", description: "The flight ID from search results" }
      },
      required: ["trip_id", "flight_id"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: "select_hotel",
    description: "Select a hotel for the trip by hotel ID. Adds it to the trip itinerary.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: { type: "string", description: "The trip ID from create_trip" },
        hotel_id: { type: "string", description: "The hotel ID from search results" }
      },
      required: ["trip_id", "hotel_id"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: "prepare_booking",
    description: "Prepare a booking summary for the trip with all selected flights, hotels, and total cost. Returns a booking confirmation ready for review.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: { type: "string", description: "The trip ID from create_trip" }
      },
      required: ["trip_id"]
    },
    annotations: { readOnlyHint: true }
  },
  {
    name: "save_trip",
    description: "Save the planned trip to the user's saved trips list so it appears on the Trips page. Call after prepare_booking to persist the trip.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: { type: "string", description: "The trip ID from create_trip" },
        name: { type: "string", description: "Trip name" },
        destinations: { type: "array", items: { type: "string" }, description: "List of destination cities" },
        start_date: { type: "string", description: "Trip start date" },
        end_date: { type: "string", description: "Trip end date" },
        travelers: { type: "number", description: "Number of travelers" },
        booking_id: { type: "string", description: "Booking ID from prepare_booking" }
      },
      required: ["trip_id", "name", "destinations"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: "add_to_cart",
    description: "Add a saved trip to the shopping cart for checkout and payment.",
    inputSchema: {
      type: "object",
      properties: {
        trip_id: { type: "string", description: "The trip ID to add to cart" },
        name: { type: "string", description: "Trip name" },
        destinations: { type: "array", items: { type: "string" }, description: "Destination cities" },
        start_date: { type: "string", description: "Trip start date" },
        end_date: { type: "string", description: "Trip end date" },
        travelers: { type: "number", description: "Number of travelers" },
        cost: { type: "number", description: "Total cost of the trip" }
      },
      required: ["trip_id", "name"]
    },
    annotations: { readOnlyHint: false }
  },
  {
    name: "get_travel_guide",
    description: "Get airport-to-city transport options and places to visit for a destination city. Use after booking confirmation to help travelers plan their arrival and sightseeing.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "Destination city name (e.g. Tokyo, Paris, London)" }
      },
      required: ["city"]
    },
    annotations: { readOnlyHint: true }
  }
];

export default function WebMCPRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Helper tool execution handler
    const executeTool = async (name, params) => {
      if (name === 'save_trip') {
        const trip = {
          id: params.trip_id || `trip_${Date.now()}`,
          name: params.name,
          destinations: params.destinations || [],
          start_date: params.start_date,
          end_date: params.end_date,
          travelers: params.travelers || 1,
          booking_id: params.booking_id,
          created_at: new Date().toISOString()
        };
        const stored = localStorage.getItem('tripwise_saved_trips');
        const trips = stored ? JSON.parse(stored) : [];
        trips.unshift(trip);
        localStorage.setItem('tripwise_saved_trips', JSON.stringify(trips));
        return { result: { message: `Trip "${trip.name}" saved successfully`, trip } };
      }
      if (name === 'add_to_cart') {
        const item = {
          id: params.trip_id || `trip_${Date.now()}`,
          name: params.name || 'Trip',
          destinations: params.destinations || [],
          start_date: params.start_date,
          end_date: params.end_date,
          travelers: params.travelers || 1,
          quantity: params.travelers || 1,
          cost: params.cost || 0
        };
        const stored = localStorage.getItem('tripwise_cart');
        const cart = stored ? JSON.parse(stored) : [];
        if (cart.find(c => c.id === item.id)) {
          return { result: { message: `Trip "${item.name}" is already in the cart` } };
        }
        cart.push(item);
        localStorage.setItem('tripwise_cart', JSON.stringify(cart));
        return { result: { message: `Trip "${item.name}" added to cart`, cart_count: cart.length } };
      }
      if (name === 'get_travel_guide') {
        const { default: travelData } = await import('../../data/travel-guide.json');
        const cityData = travelData[params.city];
        if (!cityData) return { result: { error: `No travel guide available for ${params.city}` } };
        return { result: cityData };
      }
      try {
        const res = await fetch('/api/mcp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tool: name, params })
        });
        return await res.json();
      } catch (err) {
        return { error: err.message };
      }
    };

    // 1. Standard WebMCP via window.modelContext or navigator.modelContext
    const modelCtx = window.modelContext || navigator.modelContext || document.modelContext;
    if (modelCtx && typeof modelCtx.registerTool === 'function') {
      mcpTools.forEach(tool => {
        try {
          modelCtx.registerTool({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema,
            annotations: tool.annotations,
            execute: (input) => executeTool(tool.name, input)
          });
        } catch (e) {
          console.warn(`[WebMCP] Tool ${tool.name} registration:`, e);
        }
      });
      console.log('✅ [WebMCP] Successfully registered tools via modelContext.registerTool');
    }

    // 2. Global Chrome DevTools inspection objects for WebMCP extension & LLM testing
    window.__WEBMCP_TOOLS__ = mcpTools.map(t => ({
      ...t,
      execute: (input) => executeTool(t.name, input)
    }));

    window.modelContext = window.modelContext || {
      tools: window.__WEBMCP_TOOLS__,
      getTools: () => window.__WEBMCP_TOOLS__,
      registerTool: (t) => {
        window.__WEBMCP_TOOLS__.push(t);
      }
    };

    console.log('💡 [WebMCP] WebMCP tools available in Chrome Console via window.__WEBMCP_TOOLS__ or window.modelContext.getTools()');
  }, []);

  return (
    <>
      <script
        type="application/json"
        id="webmcp-tools-manifest"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mcpTools) }}
      />
    </>
  );
}
