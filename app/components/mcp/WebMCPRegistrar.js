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
    }
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
    if (typeof window === 'undefined') return;

    // Helper tool execution handler
    const executeTool = async (name, params) => {
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
