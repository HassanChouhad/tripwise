import HotelCarousel from '../components/hotels/HotelCarousel';

export default function HotelsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Hotel Bookings</h1>
        <p className="text-caption">Explore handpicked stays across Tokyo, Kyoto, Osaka, and top global destinations.</p>
      </div>

      <HotelCarousel />
    </div>
  );
}
