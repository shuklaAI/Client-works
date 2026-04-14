'use client';

import { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import useCartStore from '@/store/cartStore';

export default function AddToCartButton({ product, quantity = 1, className = '', style = {} }) {
  const { addItem } = useCartStore();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id || product._id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.images?.[0]?.url || product.image,
      slug: product.slug,
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  if (!product.inStock && product.inStock !== undefined) {
    return (
      <button className={className} style={{ ...style, opacity: 0.45, cursor: 'not-allowed' }} disabled>
        Out of Stock
      </button>
    );
  }

  return (
    <button
      className={className}
      style={style}
      onClick={handleAdd}
      aria-label={added ? 'Added to cart' : 'Add to cart'}
    >
      {added ? <><Check size={15} /> Added!</> : <><ShoppingCart size={15} /> Add to Cart</>}
    </button>
  );
}
