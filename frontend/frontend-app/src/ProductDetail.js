import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from './CartContext';
import { useToast } from './ToastContext';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <div className="loading">Loading...</div>;

  return (
    <div className="product-detail">
      <img src={product.imageUrl} alt={product.name} />
      <div className="details">
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="price">ZMW {product.price}</p>
        <button
          className={`add-cart ${adding ? 'loading' : ''}`}
          onClick={() => {
            setAdding(true);
            try {
              addToCart(product);
              showToast(`Added ${product.name} to cart`);
            } finally {
              setTimeout(() => setAdding(false), 300);
            }
          }}
          disabled={adding}
        >
          {adding ? 'Adding…' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;
