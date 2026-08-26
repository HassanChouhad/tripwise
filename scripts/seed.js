const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'tripwise.db');
const db = new Database(dbPath);

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS flights (
    id TEXT PRIMARY KEY,
    airline TEXT,
    airlineCode TEXT,
    flightNumber TEXT,
    origin TEXT,
    originCity TEXT,
    destination TEXT,
    destinationCity TEXT,
    date TEXT,
    departureTime TEXT,
    arrivalTime TEXT,
    duration TEXT,
    stops INTEGER,
    price REAL,
    class TEXT,
    aircraft TEXT,
    baggage TEXT,
    bestValue INTEGER
  );

  CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    name TEXT,
    city TEXT,
    country TEXT,
    rating REAL,
    reviewCount INTEGER,
    pricePerNight REAL,
    currency TEXT,
    date TEXT,
    nights INTEGER,
    image TEXT,
    amenities TEXT,
    badge TEXT,
    distanceToCenter TEXT,
    stars INTEGER
  );
`);

console.log("Database tables initialized.");

// Clear existing entries for fresh seed
db.exec(`DELETE FROM flights; DELETE FROM hotels;`);

const insertFlight = db.prepare(`
  INSERT INTO flights (
    id, airline, airlineCode, flightNumber, origin, originCity, destination, destinationCity,
    date, departureTime, arrivalTime, duration, stops, price, class, aircraft, baggage, bestValue
  ) VALUES (
    @id, @airline, @airlineCode, @flightNumber, @origin, @originCity, @destination, @destinationCity,
    @date, @departureTime, @arrivalTime, @duration, @stops, @price, @class, @aircraft, @baggage, @bestValue
  )
`);

const insertHotel = db.prepare(`
  INSERT INTO hotels (
    id, name, city, country, rating, reviewCount, pricePerNight, currency,
    date, nights, image, amenities, badge, distanceToCenter, stars
  ) VALUES (
    @id, @name, @city, @country, @rating, @reviewCount, @pricePerNight, @currency,
    @date, @nights, @image, @amenities, @badge, @distanceToCenter, @stars
  )
`);

// Synthetic Generator across 60 days
const cities = [
  { name: "Tokyo", code: "NRT", country: "Japan" },
  { name: "Kyoto", code: "KIX", country: "Japan" },
  { name: "Osaka", code: "KIX", country: "Japan" },
  { name: "Paris", code: "CDG", country: "France" },
  { name: "Marseille", code: "MRS", country: "France" },
  { name: "London", code: "LHR", country: "UK" },
  { name: "Rome", code: "FCO", country: "Italy" },
  { name: "Bali", code: "DPS", country: "Indonesia" },
  { name: "New York", code: "JFK", country: "USA" }
];

const airlines = [
  { name: "Air France", code: "AF" },
  { name: "ANA", code: "NH" },
  { name: "JAL", code: "JL" },
  { name: "Peach", code: "MM" },
  { name: "Delta", code: "DL" }
];

const startDate = new Date("2025-10-01");
let flightIdCounter = 1;
let hotelIdCounter = 1;

db.transaction(() => {
  for (let d = 0; d < 60; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Generate Flights for each city pair on dateStr
    for (let i = 0; i < cities.length; i++) {
      for (let j = 0; j < cities.length; j++) {
        if (i === j) continue;
        const origin = cities[i];
        const dest = cities[j];
        const airline = airlines[(i + j + d) % airlines.length];
        const price = Math.floor(80 + Math.random() * 450);

        insertFlight.run({
          id: `fl-${flightIdCounter++}`,
          airline: airline.name,
          airlineCode: airline.code,
          flightNumber: `${airline.code}${100 + Math.floor(Math.random() * 800)}`,
          origin: origin.code,
          originCity: origin.name,
          destination: dest.code,
          destinationCity: dest.name,
          date: dateStr,
          departureTime: "10:30",
          arrivalTime: "18:45",
          duration: "8h 15m",
          stops: Math.random() > 0.5 ? 0 : 1,
          price: price,
          class: "economy",
          aircraft: "Boeing 787",
          baggage: "23kg included",
          bestValue: price < 200 ? 1 : 0
        });
      }

      // Generate Hotels for each city on dateStr
      insertHotel.run({
        id: `htl-${hotelIdCounter++}`,
        name: `${cities[i].name} Grand Hotel`,
        city: cities[i].name,
        country: cities[i].country,
        rating: 4.5 + (Math.random() * 0.4),
        reviewCount: Math.floor(500 + Math.random() * 2000),
        pricePerNight: Math.floor(70 + Math.random() * 150),
        currency: "€",
        date: dateStr,
        nights: 1,
        image: "/images/hotel.jpg",
        amenities: JSON.stringify(["WiFi", "Breakfast", "Gym"]),
        badge: "Top Choice",
        distanceToCenter: "0.5km to center",
        stars: 4
      });
    }
  }
})();

console.log(`Synthetic database seeded with ${flightIdCounter - 1} flights and ${hotelIdCounter - 1} hotels across 60 days!`);
