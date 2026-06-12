import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ThankYou.css';

export default function ThankYou() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [error, setError] = useState(null);
  const fmt = (amount) => (Number.isFinite(amount) ? amount.toFixed(2) : amount);

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    fetch(`/orders/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load order #${orderId}`);
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="thankyou">
      <div className="thankyou-card">
        <h1>Thank you!</h1>
        {orderId ? (
          <p>Your order <strong>#{orderId}</strong> has been received.</p>
        ) : (
          <p>Your order has been received.</p>
        )}
        <p>
          We opened WhatsApp with your order details. Our team will confirm your
          order shortly.
        </p>
        {loading && <p>Loading order details…</p>}
        {error && <p className="error">{error}</p>}
        {order && (
          <div className="order-summary">
            <h3>Order Summary</h3>
            <ul>
              {Array.isArray(order.items) ? order.items.map((it, idx) => (
                <li key={idx}>
                  {it.name} x{it.quantity} — ZMW {fmt((it.price_cents ? it.price_cents / 100 : it.price) * it.quantity)}
                </li>
              )) : null}
            </ul>
            <p className="total">Total: ZMW {fmt(order.totalCents ? order.totalCents / 100 : order.total)}</p>
          </div>
        )}
        <div className="thankyou-actions">
          <Link to="/" className="btn">Continue Shopping</Link>
          <Link to="/cart" className="btn btn-secondary">View Cart</Link>
        </div>
      </div>
    </div>
  );
}
