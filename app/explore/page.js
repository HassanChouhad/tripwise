import destinationData from '../data/destinations.json';
import styles from '../components/hotels/HotelCarousel.module.css';

export default function ExplorePage() {
  const destinations = destinationData.popular;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Explore Destinations</h1>
        <p className="text-caption">Discover top trending cities, flight deals, and travel inspiration.</p>
      </div>

      <div className={styles.grid}>
        {destinations.map((dest) => (
          <div key={dest.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <div className={styles.imagePlaceholder}>🌍</div>
            </div>
            <div className={styles.content}>
              <div className={styles.hotelName}>{dest.city}, {dest.country}</div>
              <div className={styles.location}>{dest.description}</div>
              <div className={styles.footer}>
                <div className={styles.price}>
                  From €{dest.flightsFrom}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
