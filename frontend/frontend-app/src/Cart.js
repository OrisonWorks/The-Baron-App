import React, { useContext } from 'react';
import { CartContext } from './CartContext';
import './Cart.css';
import { Link } from 'react-router-dom';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cartItems.length === 0) return <div className="cart"><h2>Your cart is empty</h2></div>;

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      <ul>
        {cartItems.map(item => (
          <li key={item.id}>
            <img src={item.imageUrl} alt={item.name} />
            <div className="info">
              <h3>{item.name}</h3>
              <p>Price: ZMW {item.price}</p>
              <p>
                Qty:
                <input
                  type="number"
                  value={item.quantity}
                  min="1"
                  onChange={e => updateQuantity(item.id, +e.target.value)}
                />
              </p>
              <button className="remove" onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="total">
        <h3>Total: ZMW {total}</h3>
      </div>
      <button className="clear-cart" onClick={clearCart}>Clear Cart</button>
      <Link to="/checkout"><button className="checkout-button">Proceed to Checkout</button></Link>
    </div>
  );
}

export default Cart;
