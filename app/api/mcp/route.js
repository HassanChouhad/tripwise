import { NextResponse } from 'next/server';
import { searchFlightsFromDb, searchHotelsFromDb, getHotelDetailsFromDb, getFlightById } from '@/lib/db';
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
  },
  {
    name: "get_hotel_details",
    description: "Get full details for a specific hotel by ID, including amenities, rating, distance to center, and nightly price",
    inputSchema: {
      type: "object",
      properties: {
        hotel_id: { type: "string", description: "The hotel ID from search results" }
      },
      required: ["hotel_id"]
    }
  },
  {
    name: "create_trip",
    description: "Create a new trip with destinations, dates, and traveler count. Returns a trip ID for selecting flights and hotels.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Trip name" },
        destinations: { type: "array", items: { type: "string" }, description: "List of destination cities" },
        start_date: { type: "string", description: "Trip start date (YYYY-MM-DD)" },
        end_date: { type: "string", description: "Trip end date (YYYY-MM-DD)" },
        travelers: { type: "number", description: "Number of travelers" }
      },
      required: ["name", "destinations", "start_date", "end_date"]
    }
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
    }
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
    }
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
    }
  }
];

// In-memory trip store (resets on server restart)
const trips = new Map();

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

    if (tool === 'get_hotel_details') {
      const hotel = getHotelDetailsFromDb(params?.hotel_id);
      if (!hotel) return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      if (hotel.amenities) hotel.amenities = JSON.parse(hotel.amenities);
      return NextResponse.json({ result: hotel });
    }

    if (tool === 'create_trip') {
      const tripId = `trip_${Date.now()}`;
      const trip = {
        id: tripId,
        name: params?.name,
        destinations: params?.destinations || [],
        start_date: params?.start_date,
        end_date: params?.end_date,
        travelers: params?.travelers || 1,
        flights: [],
        hotels: [],
        created_at: new Date().toISOString()
      };
      trips.set(tripId, trip);
      return NextResponse.json({ result: { trip_id: tripId, ...trip } });
    }

    if (tool === 'select_flight') {
      const trip = trips.get(params?.trip_id);
      if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      const flight = getFlightById(params?.flight_id);
      if (!flight) return NextResponse.json({ error: "Flight not found" }, { status: 404 });
      trip.flights.push(flight);
      return NextResponse.json({ result: { message: `Flight ${flight.flightNumber} (${flight.originCity} → ${flight.destinationCity}) added to trip`, trip } });
    }

    if (tool === 'select_hotel') {
      const trip = trips.get(params?.trip_id);
      if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      const hotel = getHotelDetailsFromDb(params?.hotel_id);
      if (!hotel) return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      if (hotel.amenities) hotel.amenities = JSON.parse(hotel.amenities);
      trip.hotels.push(hotel);
      return NextResponse.json({ result: { message: `${hotel.name} in ${hotel.city} added to trip`, trip } });
    }

    if (tool === 'prepare_booking') {
      const trip = trips.get(params?.trip_id);
      if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      const flightTotal = trip.flights.reduce((sum, f) => sum + (f.price || 0), 0);
      const hotelTotal = trip.hotels.reduce((sum, h) => sum + (h.pricePerNight * (h.nights || 1)), 0);
      const totalCost = (flightTotal + hotelTotal) * trip.travelers;
      return NextResponse.json({
        result: {
          booking_id: `BK_${Date.now()}`,
          trip_name: trip.name,
          destinations: trip.destinations,
          dates: `${trip.start_date} to ${trip.end_date}`,
          travelers: trip.travelers,
          flights: trip.flights.map(f => ({ flight: f.flightNumber, route: `${f.originCity} → ${f.destinationCity}`, price: f.price })),
          hotels: trip.hotels.map(h => ({ name: h.name, city: h.city, price_per_night: h.pricePerNight, nights: h.nights })),
          cost_breakdown: { flights: flightTotal, hotels: hotelTotal, per_person: flightTotal + hotelTotal, total: totalCost },
          status: "ready_for_confirmation"
        }
      });
    }

    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
