import { NextResponse } from 'next/server';
import { searchFlightsFromDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  const flights = searchFlightsFromDb(origin, destination, date);
  return NextResponse.json({ flights });
}
