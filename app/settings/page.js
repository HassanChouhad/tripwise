export default function SettingsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">App Settings</h1>
        <p className="text-caption">Configure WebMCP preferences, currency, and notifications.</p>
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>WebMCP Integration</strong>
            <div className="text-caption">Allow AI agents to call page search tools</div>
          </div>
          <input type="checkbox" defaultChecked style={{ width: '20px', height: '20px' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Preferred Currency</strong>
            <div className="text-caption">Display prices in EUR (€)</div>
          </div>
          <select defaultValue="EUR">
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
