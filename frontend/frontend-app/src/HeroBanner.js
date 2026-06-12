import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HeroBanner.css';

function HeroBanner() {
  const navigate = useNavigate();

  // Debug: Log when component mounts
  useEffect(() => {
    console.log('HeroBanner mounted');
    console.log('navigate function:', typeof navigate);
  }, []);

  const handleShopNow = (e) => {
    console.log('Shop Now button clicked');
    if (e) e.preventDefault();
    
    console.log('Attempting to navigate...');
    
    // Test 1: Try basic navigation
    try {
      console.log('Trying navigate("/")');
      navigate('/');
    } catch (navError) {
      console.error('Navigation error:', navError);
      
      // Test 2: Try with replace
      try {
        console.log('Trying navigate("/", { replace: true })');
        navigate('/', { replace: true });
      } catch (replaceError) {
        console.error('Replace navigation error:', replaceError);
        
        // Test 3: Try direct location change
        console.log('Trying window.location.href');
        window.location.href = '/';
      }
    }
  };
  
  // Test function for direct DOM manipulation
  const testDirectNavigation = () => {
    console.log('Testing direct navigation...');
    const testLink = document.createElement('a');
    testLink.href = '/';
    testLink.click();
  };

  return (
    <section className="hero-banner">
      <div className="overlay">
        <h1>Discover The Baron's Essentials</h1>
        <p>Premium products at unbeatable prices</p>
        
        {/* Debug controls */}
        <div style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          zIndex: 1000,
          borderRadius: '4px'
        }}>
          <h3>Debug Controls</h3>
          <button 
            onClick={testDirectNavigation}
            style={{
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              margin: '5px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Test Direct Nav
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              margin: '5px',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Window Location
          </button>
        </div>
        <button 
          className="cta-button"
          onClick={handleShopNow}
          style={{
            display: 'inline-block',
            textDecoration: 'none',
            textAlign: 'center',
            lineHeight: 'normal',
            fontFamily: 'inherit',
            fontSize: '1rem',
            cursor: 'pointer',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#f0ad4e',
            color: 'white'
          }}
        >
          Shop Now
        </button>
      </div>
    </section>
  );
}

export default HeroBanner;
