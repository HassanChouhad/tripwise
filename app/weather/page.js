import WeatherOverview from '../components/weather/WeatherOverview';

export default function WeatherPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Weather Forecasts</h1>
        <p className="text-caption">Destination weather conditions and forecasts for your upcoming trips.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <WeatherOverview />
      </div>
    </div>
  );
}
