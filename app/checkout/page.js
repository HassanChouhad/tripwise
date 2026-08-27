'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    passportNumber: '',
    nationality: ''
  });

  if (cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h1 className="text-display">Checkout</h1>
        <p className="text-caption">Your cart is empty. Add a trip first.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('tripwise_checkout_info', JSON.stringify({ traveler: form, cart, total: cartTotal }));
    router.push('/payment');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 className="text-display">Checkout</h1>
        <p className="text-caption">Review your order and enter traveler details.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Traveler Details</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required placeholder="John" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Doe" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="john@email.com" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="+33 6 12 34 56 78" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Passport Number</label>
                <input name="passportNumber" value={form.passportNumber} onChange={handleChange} required placeholder="AB1234567" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Nationality</label>
                <input name="nationality" value={form.nationality} onChange={handleChange} required placeholder="French" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{ background: 'var(--gradient-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-base)', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
          >
            Continue to Payment
          </button>
        </form>

        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', height: 'fit-content' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.name || 'Trip'}</div>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>x{item.quantity} traveler{item.quantity > 1 ? 's' : ''}</div>
                </div>
                <div style={{ fontWeight: 700 }}>€{((item.cost || 0) * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '2px solid var(--color-border)' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>€{cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
