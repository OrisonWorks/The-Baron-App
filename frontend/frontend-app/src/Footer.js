import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/">Contact Us</Link></li>
            <li><Link to="/">Shipping & Returns</Link></li>
            <li><Link to="/">FAQ</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Company</h4>
          <ul>
            <li><Link to="/">About Us</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Privacy Policy</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <ul>
            <li><Link to="/">Facebook</Link></li>
            <li><Link to="/">Instagram</Link></li>
            <li><Link to="/">Twitter</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 The Baron's Essentials. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
