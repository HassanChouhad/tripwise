import { NextResponse } from 'next/server';
import flights from '@/app/data/flights.json';
import hotels from '@/app/data/hotels.json';
import packingRules from '@/app/data/packing-rules.json';

const tools = [
  {
    name: "search_flights",
    description: "Search for multi-city flight itineraries",
    inputSchema: {
      type: "object",
      properties: {
        origin: { type: "string" },
        destinations: { type: "array", items: { type: "string" } },
        dates: { type: "string" }
      }
    }
  },
  {
    name: "search_hotels",
    description: "Search for hotels by city and dates",
    inputSchema: {
      type: "object",
      properties: {
        city: { type: "string" },
        maxPrice: { type: "number" }
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
      return NextResponse.json({ result: flights.bestItinerary });
    }

    if (tool === 'search_hotels') {
      const cityHotels = params?.city
        ? hotels.hotels.filter(h => h.city.toLowerCase() === params.city.toLowerCase())
        : hotels.hotels;
      return NextResponse.json({ result: cityHotels });
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
