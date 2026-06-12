import React, { useEffect, useState } from 'react';
import './AdminOrders.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/orders')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load orders');
        return res.json();
      })
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (amount) => (Number.isFinite(amount) ? amount.toFixed(2) : amount);

  return (
    <div className="admin-orders">
      <div className="container">
        <h1>Orders</h1>
        {loading && <p>Loading…</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Created</th>
                  <th>Items</th>
                  <th>Total (ZMW)</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>{Array.isArray(o.items) ? o.items.reduce((sum, it) => sum + (it.quantity || 0), 0) : 0}</td>
                    <td>{fmt(o.totalCents ? o.totalCents / 100 : o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
