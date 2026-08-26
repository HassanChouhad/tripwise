import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'tripwise.db');

export function getDb() {
  return new Database(dbPath);
}

export function searchFlightsFromDb(originCity, destinationCity, date) {
  const db = getDb();
  let query = 'SELECT * FROM flights WHERE 1=1';
  const params = [];

  if (originCity) {
    query += ' AND originCity LIKE ?';
    params.push(`%${originCity}%`);
  }
  if (destinationCity) {
    query += ' AND destinationCity LIKE ?';
    params.push(`%${destinationCity}%`);
  }
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' ORDER BY price ASC LIMIT 10';
  return db.prepare(query).all(...params);
}

export function searchHotelsFromDb(city, date) {
  const db = getDb();
  let query = 'SELECT * FROM hotels WHERE 1=1';
  const params = [];

  if (city) {
    query += ' AND city LIKE ?';
    params.push(`%${city}%`);
  }
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' ORDER BY pricePerNight ASC LIMIT 10';
  return db.prepare(query).all(...params);
}
