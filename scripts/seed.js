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
  { name: "Air France", code: "AF", aircraft: "Airbus A350" },
  { name: "ANA", code: "NH", aircraft: "Boeing 787" },
  { name: "JAL", code: "JL", aircraft: "Boeing 777" },
  { name: "Peach", code: "MM", aircraft: "Airbus A320" },
  { name: "Delta", code: "DL", aircraft: "Boeing 767" },
  { name: "British Airways", code: "BA", aircraft: "Airbus A380" },
  { name: "Ryanair", code: "FR", aircraft: "Boeing 737" },
  { name: "Emirates", code: "EK", aircraft: "Airbus A380" }
];

const hotelNames = {
  "Tokyo": ["Tokyo Grand Hotel", "Shinjuku Park Hotel", "Asakusa Ryokan"],
  "Kyoto": ["Kyoto Imperial Hotel", "Gion Traditional Inn", "Arashiyama Resort"],
  "Osaka": ["Osaka Namba Hotel", "Dotonbori View Hotel", "Umeda Sky Hotel"],
  "Paris": ["Hotel Le Marais", "Montmartre Boutique Hotel", "Champs-Elysees Palace"],
  "Marseille": ["Vieux-Port Hotel", "Marseille Corniche Resort", "Le Panier B&B"],
  "London": ["The Westminster Hotel", "Camden Lodge", "Kensington Suites"],
  "Rome": ["Hotel Trastevere", "Roma Termini Hotel", "Vatican View Suites"],
  "Bali": ["Ubud Jungle Resort", "Seminyak Beach Hotel", "Nusa Dua Villas"],
  "New York": ["Manhattan Midtown Hotel", "Brooklyn Bridge Inn", "Central Park Suites"]
};

// Realistic departure times
const departureTimes = ["06:15", "07:30", "08:45", "09:20", "10:30", "11:45", "13:00", "14:30", "16:00", "17:25", "19:00", "21:30"];

// Duration ranges based on distance category
function getFlightDetails(origin, dest, seed) {
  const sameCountry = origin.country === dest.country;
  const longHaul = (origin.country !== dest.country) &&
    !(['France', 'UK', 'Italy'].includes(origin.country) && ['France', 'UK', 'Italy'].includes(dest.country));

  let durationMin, durationMax, priceMin, priceMax, stopChance;

  if (sameCountry) {
    durationMin = 35; durationMax = 120;
    priceMin = 40; priceMax = 180;
    stopChance = 0.1;
  } else if (longHaul) {
    durationMin = 480; durationMax = 1100;
    priceMin = 250; priceMax = 900;
    stopChance = 0.6;
  } else {
    // Short-haul international (Europe)
    durationMin = 90; durationMax = 240;
    priceMin = 60; priceMax = 350;
    stopChance = 0.2;
  }

  const durationMins = Math.floor(durationMin + Math.random() * (durationMax - durationMin));
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;
  const duration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const depTime = departureTimes[seed % departureTimes.length];
  const depParts = depTime.split(':').map(Number);
  const arrMins = depParts[0] * 60 + depParts[1] + durationMins;
  const arrHour = Math.floor(arrMins / 60) % 24;
  const arrMin = arrMins % 60;
  const nextDay = arrMins >= 1440;
  const arrTime = `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}${nextDay ? ' +1' : ''}`;

  const price = Math.floor(priceMin + Math.random() * (priceMax - priceMin));
  const stops = Math.random() < stopChance ? 1 : 0;

  return { duration, depTime, arrTime, price, stops };
}

// Generate from today through 6 months ahead
const today = new Date();
today.setHours(0, 0, 0, 0);
const startDate = new Date(today);
startDate.setDate(today.getDate() - 30); // 30 days in the past too
const totalDays = 210; // ~7 months of data
let flightIdCounter = 1;
let hotelIdCounter = 1;

db.transaction(() => {
  for (let d = 0; d < totalDays; d++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + d);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Seasonal price multiplier (higher in Dec/Jan holidays)
    const month = currentDate.getMonth();
    const seasonMultiplier = (month === 11 || month === 0) ? 1.3 : (month === 8 ? 1.15 : 1.0);

    for (let i = 0; i < cities.length; i++) {
      for (let j = 0; j < cities.length; j++) {
        if (i === j) continue;
        const origin = cities[i];
        const dest = cities[j];
        const airline = airlines[(i + j + d) % airlines.length];
        const seed = i * 100 + j * 10 + d;
        const details = getFlightDetails(origin, dest, seed);
        const price = Math.round(details.price * seasonMultiplier);

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
          departureTime: details.depTime,
          arrivalTime: details.arrTime,
          duration: details.duration,
          stops: details.stops,
          price: price,
          class: "economy",
          aircraft: airline.aircraft,
          baggage: "23kg included",
          bestValue: price < 200 ? 1 : 0
        });
      }

      // Generate Hotels (3 per city per date)
      const cityHotels = hotelNames[cities[i].name] || [`${cities[i].name} Hotel`];
      for (let h = 0; h < cityHotels.length; h++) {
        const basePrice = 70 + (h * 40) + Math.floor(Math.random() * 80);
        const hotelPrice = Math.round(basePrice * seasonMultiplier);
        insertHotel.run({
          id: `htl-${hotelIdCounter++}`,
          name: cityHotels[h],
          city: cities[i].name,
          country: cities[i].country,
          rating: (3.8 + Math.random() * 1.2).toFixed(1),
          reviewCount: Math.floor(200 + Math.random() * 3000),
          pricePerNight: hotelPrice,
          currency: "€",
          date: dateStr,
          nights: 1,
          image: "/images/hotel.jpg",
          amenities: JSON.stringify(["WiFi", "Breakfast", "Gym", "Pool"].slice(0, 2 + h)),
          badge: h === 2 ? "Premium" : (h === 1 ? "Popular" : "Best Value"),
          distanceToCenter: `${(0.3 + h * 0.8).toFixed(1)}km to center`,
          stars: 3 + h
        });
      }
    }
  }
})();

const endDate = new Date(startDate);
endDate.setDate(startDate.getDate() + totalDays - 1);
console.log(`Database seeded: ${flightIdCounter - 1} flights and ${hotelIdCounter - 1} hotels from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}.`);
