'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { CreditCard, Lock } from 'lucide-react';

export default function PaymentPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('tripwise_checkout_info');
    if (stored) setCheckoutInfo(JSON.parse(stored));
  }, []);

  if (!checkoutInfo && cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h1 className="text-display">Payment</h1>
        <p className="text-caption">No order found. Please start from the cart.</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setCardForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const bookingId = `BK_${Date.now()}`;
    const booking = {
      id: bookingId,
      ...checkoutInfo,
      payment: { last4: cardForm.cardNumber.slice(-4), method: 'card' },
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    };

    localStorage.setItem('tripwise_confirmed_booking', JSON.stringify(booking));
    clearCart();
    localStorage.removeItem('tripwise_checkout_info');
    router.push('/booking-confirmation');
  };

  const total = checkoutInfo?.total || cartTotal;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h1 className="text-display">Payment</h1>
        <p className="text-caption">Complete your purchase securely.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 'var(--space-6)' }} className="checkout-grid">
        <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
              <CreditCard size={20} />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Card Details</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Name on Card</label>
                <input name="cardName" value={cardForm.cardName} onChange={handleChange} required placeholder="JOHN DOE" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Card Number</label>
                <input name="cardNumber" value={cardForm.cardNumber} onChange={handleChange} required placeholder="4242 4242 4242 4242" maxLength={19} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>Expiry</label>
                  <input name="expiry" value={cardForm.expiry} onChange={handleChange} required placeholder="MM/YY" maxLength={5} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--color-text-tertiary)', textTransform: 'uppercase' }}>CVV</label>
                  <input name="cvv" type="password" value={cardForm.cvv} onChange={handleChange} required placeholder="123" maxLength={4} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            style={{ background: processing ? 'var(--color-bg-active)' : 'var(--gradient-primary)', color: 'white', padding: '16px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-base)', cursor: processing ? 'wait' : 'pointer', boxShadow: 'var(--shadow-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Lock size={16} />
            {processing ? 'Processing Payment...' : `Pay €${total.toLocaleString()}`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
            <Lock size={12} />
            Your payment info is encrypted and secure
          </div>
        </form>

        <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', height: 'fit-content' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Order Summary</h2>
          {(checkoutInfo?.cart || cart).map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.name || 'Trip'}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>{(item.destinations || []).join(' → ')}</div>
              </div>
              <div style={{ fontWeight: 700 }}>€{((item.cost || 0) * (item.quantity || 1)).toLocaleString()}</div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-3)', borderTop: '2px solid var(--color-border)' }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)' }}>€{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
