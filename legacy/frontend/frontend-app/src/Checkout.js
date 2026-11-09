import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from './CartContext';
import './Checkout.css';
import BASE_URL from './api';

function Checkout() {
  const { cartItems, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const phoneNumber = '260974128784'; // replace with your WhatsApp number (no +)
  const messageLines = cartItems.map(item => `${item.name} x${item.quantity}`);
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Base fallback link (without orderId) for users to click if auto-redirect didn't happen
  const fallbackText = `Hello, I'd like to place an order:\n${messageLines.join('\n')}\nTotal: ZMW ${total}`;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fallbackText)}`;

  useEffect(() => {
    async function processOrder() {
      let orderId = null;
      try {
        const orderPayload = { items: cartItems, total };
        const res = await fetch(`${BASE_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        });
        const savedOrder = await res.json();
        orderId = savedOrder?.id;
        console.log('Order saved:', savedOrder);
      } catch (err) {
        console.error('Failed to save order', err);
      }

      // Build WhatsApp message including order number if available
      const dynamicText = `Hello, I'd like to place an order${orderId ? ` (Order #${orderId})` : ''}:\n${messageLines.join('\n')}\nTotal: ZMW ${total}`;
      const dynamicUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(dynamicText)}`;

      // Open WhatsApp in a new tab, then navigate to Thank You
      window.open(dynamicUrl, '_blank', 'noopener,noreferrer');
      clearCart();
      if (orderId) {
        navigate(`/thank-you?orderId=${orderId}`);
      } else {
        navigate('/thank-you');
      }
    }
    processOrder();
  }, [cartItems, total, messageLines, phoneNumber, navigate, clearCart]);

  return (
    <div className="checkout">
      <h2>Redirecting to WhatsApp...</h2>
      <p>
        If you are not redirected automatically,{' '}
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          click here
        </a>.
      </p>
    </div>
  );
}

export default Checkout;
