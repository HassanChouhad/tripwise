'use client';

import { useEffect } from 'react';

const mcpTools = [
  {
    name: "search_flights",
    description: "Search multi-city flight itineraries between cities (Paris, Tokyo, Kyoto, Osaka). Returns flight legs, airlines, durations, and prices.",
    inputSchema: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Origin city or airport code" },
        destinations: { type: "array", items: { type: "string" }, description: "List of destination cities" },
        dates: { type: "string", description: "Date range for trip" }
      },
      required: ["origin", "destinations"]
    }
  },
  {
    name: "search_hotels",
    description: "Search hotels matched to itinerary cities with ratings, pricing per night, and amenities.",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string", description: "City to search hotels in (Tokyo, Kyoto, Osaka)" },
        maxPrice: { type: "number", description: "Maximum price per night in EUR" }
      }
    }
  },
  {
    name: "get_weather_and_packing",
    description: "Get weather forecasts and smart packing recommendations for trip destinations.",
    inputSchema: {
      type: "object",
      properties: {
        cities: { type: "array", items: { type: "string" }, description: "Cities to get weather for" }
      }
    }
  }
];

export default function WebMCPRegistrar() {
  useEffect(() => {
    // Expose tools via browser WebMCP standard (navigator.modelContext)
    if (typeof window !== 'undefined') {
      if ('modelContext' in navigator) {
        try {
          // Standard WebMCP registration
          navigator.modelContext.registerTools(mcpTools);
          console.log('[WebMCP] Successfully registered tools on navigator.modelContext');
        } catch (e) {
          console.warn('[WebMCP] Tool registration error:', e);
        }
      } else {
        // Fallback window global for agent inspection
        window.__WEBMCP_TOOLS__ = mcpTools;
        console.log('[WebMCP] WebMCP polyfill fallback active on window.__WEBMCP_TOOLS__');
      }
    }
  }, []);

  return (
    <>
      {/* HTML Microdata declarations for LLM web crawlers / ChatGPT browser */}
      <script
        type="application/json"
        id="webmcp-tools-manifest"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mcpTools) }}
      />
    </>
  );
}
