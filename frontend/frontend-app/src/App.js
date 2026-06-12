import React from 'react';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import HeroBanner from './HeroBanner';
import ProductList from './ProductList';
import Footer from './Footer';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import AdminOrders from './AdminOrders';

function App() {
  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<><HeroBanner /><ProductList /></>} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
