import React, { useState, useEffect, useContext } from 'react';
import './ProductList.css';
import { Link } from 'react-router-dom';
import { CartContext } from './CartContext';
import { useToast } from './ToastContext';

function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);
  const [addingMap, setAddingMap] = useState({}); // { [productId]: boolean }
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/products')
      .then((res) => res.json())
      .then(setProducts)
      .catch((err) => console.error('Failed to fetch products:', err));
  }, []);

  const handleAdd = (p) => {
    setAddingMap((m) => ({ ...m, [p.id]: true }));
    // Synchronous add; keep a brief visual feedback window
    try {
      addToCart(p);
      showToast(`Added ${p.name} to cart`);
    } finally {
      setTimeout(() => {
        setAddingMap((m) => ({ ...m, [p.id]: false }));
      }, 300);
    }
  };

  return (
    <div className="product-grid">
      {products.map((p) => (
        <div key={p.id} className="product-card">
          <div className="badge">NEW</div>
          <Link to={`/product/${p.id}`}>
            <img src={p.imageUrl} alt={p.name} />
          </Link>
          <div className="overlay">
            <button
              className={`quick-view ${addingMap[p.id] ? 'loading' : ''}`}
              onClick={() => handleAdd(p)}
              disabled={!!addingMap[p.id]}
            >
              {addingMap[p.id] ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
          <div className="card-content">
            <h2>
              <Link to={`/product/${p.id}`}>{p.name}</Link>
            </h2>
            <p>{p.description}</p>
            <p className="price">ZMW {p.price}</p>
            <button
              className={`add-btn ${addingMap[p.id] ? 'loading' : ''}`}
              onClick={() => handleAdd(p)}
              disabled={!!addingMap[p.id]}
            >
              {addingMap[p.id] ? 'Adding…' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
