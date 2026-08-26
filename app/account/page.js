export default function AccountPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
      <div>
        <h1 className="text-display">Account Profile</h1>
        <p className="text-caption">Manage your traveler details, preferences, and payment methods.</p>
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
          <div>
            <h3>Explorer User</h3>
            <span className="text-caption">explorer@example.com</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <label className="text-caption">Full Name</label>
          <input type="text" defaultValue="Hassan Chouhad" />

          <label className="text-caption">Passport Country</label>
          <input type="text" defaultValue="France / International" />

          <button style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'var(--gradient-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: '600' }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
