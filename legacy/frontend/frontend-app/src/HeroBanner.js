import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HeroBanner.css';

const slides = [
  {
    image: `${process.env.PUBLIC_URL}/fossil-1.jpeg`,
    eyebrow: 'New Arrivals',
    heading: 'Crafted for the Bold',
    sub: 'Chronograph precision meets everyday style',
  },
  {
    image: `${process.env.PUBLIC_URL}/fossil-2.jpeg`,
    eyebrow: 'Featured Collection',
    heading: 'Automatic Mastery',
    sub: 'Open-heart movements, engineered to impress',
  },
  {
    image: `${process.env.PUBLIC_URL}/fossil-3.jpeg`,
    eyebrow: 'Flagship Series',
    heading: 'Timeless in Every Detail',
    sub: 'Bold dials, gold accents and steel craftsmanship',
  },
];

function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % slides.length);
        setFading(false);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index) => {
    if (index === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(index);
      setFading(false);
    }, 600);
  };

  const slide = slides[current];

  return (
    <section
      className="hero-banner"
      style={{ backgroundImage: `url(${slide.image})` }}
    >
      <div className="hero-overlay" />
      <div className={`hero-content ${fading ? 'fading' : ''}`}>
        <p className="hero-eyebrow">{slide.eyebrow}</p>
        <h1>{slide.heading}</h1>
        <p className="hero-sub">{slide.sub}</p>
        <Link to="/" className="hero-cta">Shop Now</Link>
      </div>
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`hero-dot ${i === current ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;
