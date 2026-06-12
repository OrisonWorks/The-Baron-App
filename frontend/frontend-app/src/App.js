import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import HeroBanner from './HeroBanner';
import ProductList from './ProductList';
import Footer from './Footer';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import ThankYou from './ThankYou';
import AdminOrders from './AdminOrders';

function App() {
  // Test navigation function
  const navigateTest = () => {
    console.log('Test button clicked');
    window.location.href = '/';
  };

  return (
    <div className="App">
      <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
        <button 
          onClick={navigateTest}
          style={{ 
            background: 'red', 
            color: 'white', 
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            zIndex: 1000
          }}
        >
          Test Navigation
        </button>
      </div>
      <Header />
      <Routes>
        <Route path="/" element={<><HeroBanner /><ProductList /></>} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
