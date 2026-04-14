'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Check, Star, Package } from 'lucide-react';
import useCartStore from '@/store/cartStore';

// Stock placeholder images for products without images
const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1580584126903-c17d41830f9b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400&h=400&fit=crop',
];

function getProductImage(product) {
  // Handle string image
  if (product.image && typeof product.image === 'string') return product.image;
  // Handle images array from API
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0].url || product.images[0];
  }
  // Fallback: use a stock image based on product id hash
  const hash = (product.id || product.name || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return STOCK_IMAGES[hash % STOCK_IMAGES.length];
}

export default function HomeProductCard({ product, styles }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const imgSrc = imgError
    ? STOCK_IMAGES[0]
    : getProductImage(product);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: getProductImage(product),
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productImageWrap}>
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="300px"
          className={styles.productImage}
          onError={() => setImgError(true)}
        />
        {discount > 0 && <span className={`${styles.badge} ${styles.badgeDiscount}`}>{discount}% OFF</span>}
        {product.badge && <span className={`${styles.badge} ${styles.badgeLabel}`}>{product.badge}</span>}
        <div className={styles.productOverlay}>
          <Link href={`/product/${product.slug}`} className={styles.quickViewBtn}>View Details</Link>
        </div>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productRating}>
          <Star size={12} fill="currentColor" />
          <span>{product.rating || product.ratings_average || '0'}</span>
          <span className={styles.reviewCount}>({product.reviews || product.ratings_count || 0})</span>
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className={styles.productName}>{product.name}</h3>
        </Link>
        <div className={styles.productPricing}>
          <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp && <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>}
        </div>
        <button
          className={`${styles.addCartBtn} ${added ? styles.addCartBtnAdded : ''}`}
          onClick={handleAddToCart}
        >
          {added ? <><Check size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}
