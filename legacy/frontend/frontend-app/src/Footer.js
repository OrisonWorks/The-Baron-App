import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-brand">
          <h2>THE BARON ZM</h2>
          <p>Premium accessories delivered to your door. Order via WhatsApp for a personalised experience.</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><Link to="/">New Arrivals</Link></li>
              <li><Link to="/">Watches</Link></li>
              <li><Link to="/">Accessories</Link></li>
              <li><Link to="/">Sale</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><Link to="/">How to Order</Link></li>
              <li><Link to="/">Shipping Info</Link></li>
              <li><Link to="/">Returns</Link></li>
              <li><Link to="/">FAQ</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <ul>
              <li><a href="https://wa.me/260974128784" target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><Link to="/">Instagram</Link></li>
              <li><Link to="/">Facebook</Link></li>
              <li><Link to="/admin/orders">Admin</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} The Baron ZM. All rights reserved.</p>
        <p>Lusaka, Zambia</p>
      </div>
    </footer>
  );
}

export default Footer;
