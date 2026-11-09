import React, { useContext, useEffect, useState } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';

function Header() {
  const { cartItems } = useContext(CartContext);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [bump, setBump] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (cartCount <= 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  return (
    <header className="header">
      <div className="announcement-bar">
        <p>Free delivery on orders above ZMW 500&nbsp;&nbsp;|&nbsp;&nbsp;WhatsApp us: +260 974 128 784</p>
      </div>
      <div className="main-nav">
        <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className="logo">
          <Link to="/">THE BARON ZM</Link>
        </div>
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>New Arrivals</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>Watches</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>Accessories</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>Jewellery</Link>
          <Link to="/" onClick={() => setMenuOpen(false)}>Sale</Link>
        </nav>
        <div className="header-actions">
          <Link to="/cart" className={`cart-icon ${bump ? 'bump' : ''}`} aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
