import { NextResponse } from 'next/server';
import { searchHotelsFromDb } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || '';
  const date = searchParams.get('date') || '';

  const hotels = searchHotelsFromDb(city, date);
  return NextResponse.json({ hotels });
}
