import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from './CartContext';
import { useToast } from './ToastContext';
import './ProductDetail.css';

const WHATSAPP_NUMBER = '260974128784';

const PRODUCTS = [
  {
    id: 1,
    name: 'Chronograph Classic',
    description: 'Multi-function chronograph with stainless steel bracelet and date display.',
    price: 1850,
    category: 'Watches',
    imageUrl: '/82283.jpg'
  },
  {
    id: 2,
    name: 'Automatic Blue Dial',
    description: 'Automatic movement with exhibition caseback and blue sunburst dial.',
    price: 2200,
    category: 'Watches',
    imageUrl: '/85276.png'
  },
  {
    id: 3,
    name: 'Minimalist Three-Hand',
    description: 'Clean three-hand design with leather strap and silver dial.',
    price: 1450,
    category: 'Watches',
    imageUrl: '/86507.jpg'
  },
  {
    id: 4,
    name: 'Gold-Tone Chronograph',
    description: 'Rose gold accents with black dial and genuine leather strap.',
    price: 2100,
    category: 'Watches',
    imageUrl: '/89129.jpg'
  },
  {
    id: 5,
    name: 'Sport Chronograph',
    description: 'Rugged chronograph with tachymeter bezel and silicone strap.',
    price: 1750,
    category: 'Watches',
    imageUrl: '/93627.jpg'
  },
  {
    id: 6,
    name: 'Automatic Open Heart',
    description: 'Open-heart movement display with silver dial and mesh bracelet.',
    price: 2400,
    category: 'Watches',
    imageUrl: '/94089.png'
  },
  {
    id: 7,
    name: 'Vintage-Inspired',
    description: 'Retro design with domed crystal and leather strap.',
    price: 1650,
    category: 'Watches',
    imageUrl: '/94092.jpg'
  },
  {
    id: 8,
    name: 'Two-Tone Classic',
    description: 'Stainless steel and gold-tone bracelet with champagne dial.',
    price: 1950,
    category: 'Watches',
    imageUrl: '/96586.jpg'
  },
  {
    id: 9,
    name: 'Skeleton Automatic',
    description: 'Skeleton dial revealing the automatic movement within.',
    price: 2600,
    category: 'Watches',
    imageUrl: '/96587.png'
  },
  {
    id: 10,
    name: 'Black Dial Chronograph',
    description: 'Bold black dial with rose gold accents and leather strap.',
    price: 2050,
    category: 'Watches',
    imageUrl: '/97310.jpg'
  },
  {
    id: 11,
    name: 'Silver Dress Watch',
    description: 'Elegant silver dial with minimalist markers and leather strap.',
    price: 1550,
    category: 'Watches',
    imageUrl: '/97810.jpg'
  },
  {
    id: 12,
    name: 'Blue Sunburst',
    description: 'Vibrant blue sunburst dial with stainless steel bracelet.',
    price: 1900,
    category: 'Watches',
    imageUrl: '/107082.jpg'
  },
  {
    id: 13,
    name: 'Green Dial Sport',
    description: 'Military-inspired green dial with canvas strap.',
    price: 1700,
    category: 'Watches',
    imageUrl: '/107100.jpg'
  },
  {
    id: 14,
    name: 'Rose Gold Classic',
    description: 'Rose gold case with brown leather strap and date function.',
    price: 2300,
    category: 'Watches',
    imageUrl: '/107107.jpg'
  },
  {
    id: 15,
    name: 'Black Steel Chronograph',
    description: 'Black PVD steel with chronograph functions and rubber strap.',
    price: 2150,
    category: 'Watches',
    imageUrl: '/107108.jpg'
  },
  {
    id: 16,
    name: 'White Dial Automatic',
    description: 'Clean white dial with automatic movement and steel bracelet.',
    price: 2000,
    category: 'Watches',
    imageUrl: '/108563.jpg'
  },
  {
    id: 17,
    name: 'Moonphase Complication',
    description: 'Elegant moonphase complication with date display.',
    price: 2800,
    category: 'Watches',
    imageUrl: '/111061.jpg'
  },
  {
    id: 18,
    name: 'Titanium Sport',
    description: 'Lightweight titanium case with chronograph and diver bezel.',
    price: 2500,
    category: 'Watches',
    imageUrl: '/111325.webp'
  },
  {
    id: 19,
    name: 'Leather Strap Classic',
    description: 'Timeless design with brown leather strap and silver dial.',
    price: 1600,
    category: 'Watches',
    imageUrl: '/58514.webp'
  },
  {
    id: 20,
    name: 'Gold-Plated Dress',
    description: 'Gold-plated case with champagne dial and dress styling.',
    price: 2250,
    category: 'Watches',
    imageUrl: '/73679.jpg'
  }
];

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useContext(CartContext);
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const productData = PRODUCTS.find(p => p.id === parseInt(id));
    if (productData) {
      const productWithImage = {
        ...productData,
        imageUrl: productData.imageUrl.startsWith('http') ? productData.imageUrl : `${process.env.PUBLIC_URL}${productData.imageUrl}`
      };
      setProduct(productWithImage);
    }
  }, [id]);

  if (!product) return <div className="pd-loading">Loading...</div>;

  const handleBuyWhatsApp = () => {
    const message = `Hello, I'd like to purchase:\n\n*${product.name}*\nPrice: ZMW ${product.price}\n\nPlease confirm availability.`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCart = () => {
    setAdding(true);
    try {
      addToCart(product);
      showToast(`${product.name} added to cart`);
    } finally {
      setTimeout(() => setAdding(false), 300);
    }
  };

  return (
    <div className="product-detail">
      <div className="pd-image-col">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="pd-info-col">
        <p className="pd-brand">The Baron ZM • {product.category}</p>
        <h1 className="pd-name">{product.name}</h1>
        <p className="pd-price">ZMW {product.price}</p>
        <p className="pd-description">{product.description}</p>
        <div className="pd-actions">
          <button className="btn-pd-whatsapp" onClick={handleBuyWhatsApp}>
            <WhatsAppIcon />
            Buy via WhatsApp
          </button>
          <button className={`btn-pd-cart ${adding ? 'added' : ''}`} onClick={handleAddToCart} disabled={adding}>
            {adding ? 'Added ✓' : 'Add to Cart'}
          </button>
        </div>
        <p className="pd-note">Contact us on WhatsApp for custom orders or bulk pricing.</p>
      </div>
    </div>
  );
}

export default ProductDetail;
