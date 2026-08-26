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
    if (typeof window !== 'undefined') {
      const modelCtx = (typeof document !== 'undefined' && document.modelContext) ||
                       (typeof navigator !== 'undefined' && navigator.modelContext);

      if (modelCtx && typeof modelCtx.registerTool === 'function') {
        mcpTools.forEach(tool => {
          try {
            modelCtx.registerTool({
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
              execute: async (input) => {
                const res = await fetch('/api/mcp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tool: tool.name, params: input })
                });
                return await res.json();
              }
            });
          } catch (e) {
            console.warn(`[WebMCP] Tool ${tool.name} registration error:`, e);
          }
        });
        console.log('[WebMCP] Successfully registered tools via document.modelContext.registerTool');
      } else {
        // Polyfill window context
        window.__WEBMCP_TOOLS__ = mcpTools;
        console.log('[WebMCP] WebMCP polyfill active on window.__WEBMCP_TOOLS__');
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
