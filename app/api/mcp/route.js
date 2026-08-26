import { NextResponse } from 'next/server';
import { searchFlightsFromDb, searchHotelsFromDb } from '@/lib/db';
import packingRules from '@/app/data/packing-rules.json';

const tools = [
  {
    name: "search_flights",
    description: "Search multi-city flight itineraries in SQLite database by date and destination",
    inputSchema: {
      type: "object",
      properties: {
        origin: { type: "string" },
        destination: { type: "string" },
        date: { type: "string" }
      }
    }
  },
  {
    name: "search_hotels",
    description: "Search hotels in SQLite database by city and date",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" },
        date: { type: "string" }
      }
    }
  },
  {
    name: "get_weather_and_packing",
    description: "Get weather forecast and packing recommendations for destination cities",
    inputSchema: {
      type: "object",
      properties: {
        cities: { type: "array", items: { type: "string" } }
      }
    }
  }
];

export async function GET() {
  return NextResponse.json({ tools });
}

export async function POST(req) {
  try {
    const { tool, params } = await req.json();

    if (tool === 'search_flights') {
      const flights = searchFlightsFromDb(params?.origin, params?.destination, params?.date);
      return NextResponse.json({ result: flights });
    }

    if (tool === 'search_hotels') {
      const hotels = searchHotelsFromDb(params?.city, params?.date);
      return NextResponse.json({ result: hotels });
    }

    if (tool === 'get_weather_and_packing') {
      return NextResponse.json({
        result: {
          weather: packingRules.mockWeather,
          packing: packingRules.conditions
        }
      });
    }

    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
