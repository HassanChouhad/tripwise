import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || '';
  const date = searchParams.get('date') || '';

  const db = getDb();

  let query = `
    SELECT destinationCity, destination AS destinationCode,
           MIN(price) AS cheapestPrice, COUNT(*) AS flightCount
    FROM flights WHERE 1=1
  `;
  const params = [];

  if (origin) {
    query += ' AND originCity LIKE ?';
    params.push(`%${origin}%`);
  }
  if (date) {
    query += ' AND date = ?';
    params.push(date);
  }

  query += ' GROUP BY destinationCity, destination ORDER BY cheapestPrice ASC';

  const destinations = db.prepare(query).all(...params);
  return NextResponse.json({ destinations });
}
