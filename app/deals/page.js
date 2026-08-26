import destinationData from '../data/destinations.json';
import styles from '../components/hotels/HotelCarousel.module.css';

export default function DealsPage() {
  const destinations = destinationData.popular;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Exclusive Travel Deals</h1>
        <p className="text-caption">Special flight packages and hotel discounts available for a limited time.</p>
      </div>

      <div className={styles.grid}>
        {destinations.slice(0, 3).map((dest) => (
          <div key={dest.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <div className={styles.imagePlaceholder}>🔥</div>
            </div>
            <div className={styles.content}>
              <div className={styles.hotelName}>{dest.city} Special Package</div>
              <div className={styles.location}>Flight + Hotel Bundle</div>
              <div className={styles.footer}>
                <div className={styles.price}>
                  Save up to 30%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
