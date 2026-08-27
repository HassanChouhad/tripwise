'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import TravelGuide from '../components/travel/TravelGuide';

export default function BookingConfirmationPage() {
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tripwise_confirmed_booking');
    if (stored) setBooking(JSON.parse(stored));
  }, []);

  if (!booking) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h1 className="text-display">Booking Confirmation</h1>
        <p className="text-caption">No confirmed booking found.</p>
      </div>
    );
  }

  const destinations = booking.cart?.[0]?.destinations || [];
  const flights = booking.cart?.[0]?.flights || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      {/* Confirmation header */}
      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', textAlign: 'center' }}>
        <CheckCircle2 size={48} style={{ color: 'var(--color-accent-green)', margin: '0 auto var(--space-3)' }} />
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginBottom: 'var(--space-2)' }}>Booking Confirmed!</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Your trip has been booked successfully. Confirmation details below.
        </p>
        <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
          Booking ID: <strong>{booking.id}</strong> • Confirmed: {new Date(booking.confirmed_at).toLocaleString()}
        </div>
      </div>

      {/* Booking details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Traveler</h3>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>{booking.traveler?.firstName} {booking.traveler?.lastName}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>{booking.traveler?.email}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>{booking.traveler?.phone}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '8px' }}>Passport: {booking.traveler?.passportNumber} • {booking.traveler?.nationality}</div>
        </div>

        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Payment</h3>
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>€{booking.total?.toLocaleString()}</div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Card ending in {booking.payment?.last4 || '****'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-accent-green)', fontWeight: 600, marginTop: '8px' }}>Payment successful</div>
        </div>
      </div>

      {/* Trip details */}
      {booking.cart?.map((trip, idx) => (
        <div key={idx} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>{trip.name || 'Your Trip'}</h3>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
            {(trip.destinations || []).join(' → ')}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            {trip.start_date} to {trip.end_date} • {trip.quantity || trip.travelers || 1} traveler(s)
          </div>

          {trip.flights && trip.flights.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Flights</h4>
              {trip.flights.map((f, i) => (
                <div key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', padding: '4px 0' }}>
                  ✈️ {f.flight || f.flightNumber} — {f.route || `${f.originCity} → ${f.destinationCity}`} (€{f.price})
                </div>
              ))}
            </div>
          )}

          {trip.hotels && trip.hotels.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Hotels</h4>
              {trip.hotels.map((h, i) => (
                <div key={i} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', padding: '4px 0' }}>
                  🏨 {h.name} in {h.city} — €{h.price_per_night || h.pricePerNight}/night ({h.nights} nights)
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Travel Guide */}
      {destinations.length > 0 && (
        <TravelGuide destinations={destinations} flights={flights} />
      )}
    </div>
  );
}
