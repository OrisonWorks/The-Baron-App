import React, { useContext, useEffect, useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';

function Header() {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (cartCount <= 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);
  return (
    <header className="header">
      <div className="top-bar">
        <div className="top-links">
          <Link to="/">My Account</Link>
          <Link to="/">Track Order</Link>
          <Link to="/">Support</Link>
        </div>
      </div>
      <div className="main-nav">
        <div className="logo">
          <img src={`${process.env.PUBLIC_URL}/logo192.png`} alt="The Baron's Essentials" />
        </div>
        <div className="search">
          <input type="text" placeholder="Search products..." />
        </div>
        <div className="icons">
          <Link to="/account" className="icon">👤</Link>
          <Link to="/cart" className="icon">🛒{cartCount > 0 && <span className={`cart-badge ${bump ? 'bump' : ''}`}>{cartCount}</span>}</Link>
        </div>
      </div>
      <nav className="category-nav">
        <ul>
          <li><Link to="/">New Arrivals</Link></li>
          <li><Link to="/">Watches</Link></li>
          <li><Link to="/">Handbags &amp; Luggage</Link></li>
          <li><Link to="/">Jewelry & Accessories</Link></li>
          <li><Link to="/">Electronics</Link></li>
          <li><Link to="/">Sale</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
