import React from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

function HeroBanner() {
  return (
    <section className="hero-banner">
      <div className="hero-content">
        <p className="hero-eyebrow">New Collection</p>
        <h1>Crafted for the Bold</h1>
        <p className="hero-sub">Discover premium accessories designed to define your style</p>
        <Link to="/" className="hero-cta">Shop Now</Link>
      </div>
    </section>
  );
}

export default HeroBanner;
