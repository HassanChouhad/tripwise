import WeatherOverview from '../components/weather/WeatherOverview';

export default function PackingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Smart Packing Guide</h1>
        <p className="text-caption">AI-recommended items to bring based on real-time weather in your travel destinations.</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <WeatherOverview />
      </div>
    </div>
  );
}
