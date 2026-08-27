'use client';

import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal, isHydrated } = useCart();
  const router = useRouter();

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h1 className="text-display">Your Cart</h1>
        <p className="text-caption">Loading...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <div>
          <h1 className="text-display">Your Cart</h1>
          <p className="text-caption">Your travel cart is empty.</p>
        </div>
        <div style={{ background: 'var(--color-bg-secondary)', padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <ShoppingCart size={48} style={{ opacity: 0.3, margin: '0 auto var(--space-4)' }} />
          <h3>No trips in your cart</h3>
          <p className="text-caption" style={{ marginTop: '8px' }}>
            Plan a trip with the AI Planner or search for flights, then add them to your cart.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-display">Your Cart</h1>
          <p className="text-caption">{cart.length} trip{cart.length > 1 ? 's' : ''} in your cart</p>
        </div>
        <button
          onClick={clearCart}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)', fontWeight: 600, cursor: 'pointer' }}
        >
          Clear Cart
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        {cart.map(item => (
          <div key={item.id} style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-base)', marginBottom: '4px' }}>
                {item.name || item.title || 'Unnamed Trip'}
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                {(item.destinations || []).join(' → ')}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                {item.start_date} to {item.end_date} • {(item.flights || item.legs || []).length} flight{(item.flights || item.legs || []).length !== 1 ? 's' : ''} • {(item.hotels || []).length} hotel{(item.hotels || []).length !== 1 ? 's' : ''}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--color-bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '4px 8px' }}>
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px', cursor: 'pointer' }}>
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px', cursor: 'pointer' }}>
                  <Plus size={14} />
                </button>
              </div>

              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', minWidth: '80px', textAlign: 'right' }}>
                €{((item.cost || 0) * item.quantity).toLocaleString()}
              </div>

              <button onClick={() => removeFromCart(item.id)} style={{ padding: '8px', color: '#EF4444', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Total</div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800 }}>€{cartTotal.toLocaleString()}</div>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          style={{ background: 'var(--gradient-primary)', color: 'white', padding: '16px 32px', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-base)', cursor: 'pointer', boxShadow: 'var(--shadow-glow)' }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}
