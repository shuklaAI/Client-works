'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag, ChevronRight, Loader2 } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import api from '@/lib/api';
import styles from './Cart.module.css';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const GST_RATE = 0.18;

// Fallback coupons (used when API is unavailable)
const FALLBACK_COUPONS = {
  'TECHBHARAT10': { discount_type: 'percentage', discount_value: 10, description: '10% off' },
  'STUDENT15': { discount_type: 'percentage', discount_value: 15, description: '15% off for students' },
  'WELCOME5': { discount_type: 'percentage', discount_value: 5, description: '5% welcome discount' },
};

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart } = useCartStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validating, setValidating] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Calculate discount — supports both percentage and fixed types
  let discount = 0;
  if (couponApplied) {
    if (couponApplied.discount_amount) {
      discount = couponApplied.discount_amount;
    } else if (couponApplied.discount_type === 'percentage') {
      discount = Math.round(subtotal * couponApplied.discount_value / 100);
      if (couponApplied.max_discount && discount > couponApplied.max_discount) {
        discount = couponApplied.max_discount;
      }
    } else {
      discount = couponApplied.discount_value;
    }
  }

  const discountedSubtotal = subtotal - discount;
  const shipping = discountedSubtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const gst = Math.round(discountedSubtotal * GST_RATE);
  const total = discountedSubtotal + shipping + gst;

  const applyCoupon = async () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    setValidating(true);
    try {
      // Try backend validation first
      const res = await api.post('/coupons/validate', { code, subtotal });
      if (res.success && res.data) {
        setCouponApplied({ code: res.data.code, ...res.data });
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
      // Fallback to local coupons if API fails
      if (FALLBACK_COUPONS[code]) {
        const fc = FALLBACK_COUPONS[code];
        let fallbackDiscount = fc.discount_type === 'percentage' ? Math.round(subtotal * fc.discount_value / 100) : fc.discount_value;
        setCouponApplied({
          code,
          discount_type: fc.discount_type,
          discount_value: fc.discount_value,
          discount_amount: fallbackDiscount,
          description: fc.description,
        });
      } else {
        setCouponError(err.message || 'Invalid coupon code');
      }
    }
    setValidating(false);
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
    setCouponError('');
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}><ShoppingCart size={56} /></div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet. Let's fix that!</p>
        <Link href="/" className="btn-primary">
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link>
        <ChevronRight size={14} />
        <span>Cart</span>
      </nav>

      <h1 className={styles.pageTitle}>Shopping Cart <span className={styles.itemCount}>({items.length} items)</span></h1>

      <div className={styles.layout}>
        {/* Cart items */}
        <div className={styles.itemsSection}>
          <div className={styles.itemsHeader}>
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Total</span>
          </div>

          <div className={styles.itemsList}>
            {items.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemProduct}>
                  <div className={styles.itemImageWrap}>
                    <Image
                      src={item.image || `https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&h=120&fit=crop`}
                      alt={item.name}
                      fill sizes="80px"
                      className={styles.itemImage}
                    />
                  </div>
                  <div className={styles.itemDetails}>
                    <Link href={`/product/${item.slug}`} className={styles.itemName}>{item.name}</Link>
                    {item.mrp && item.mrp > item.price && (
                      <span className={styles.itemSavings}>
                        You save ₹{(item.mrp - item.price).toLocaleString('en-IN')}
                      </span>
                    )}
                    <button className={styles.removeBtn} onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                <div className={styles.itemPrice}>
                  <span>₹{item.price.toLocaleString('en-IN')}</span>
                  {item.mrp && <span className={styles.itemMrp}>₹{item.mrp.toLocaleString('en-IN')}</span>}
                </div>

                <div className={styles.qtyControl}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 99}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className={styles.itemTotal}>
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartActions}>
            <Link href="/" className="btn-ghost">Continue Shopping</Link>
            <button className={styles.clearBtn} onClick={clearCart}>Clear Cart</button>
          </div>
        </div>

        {/* Order Summary */}
        <div className={styles.summary}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>

          {/* Coupon */}
          <div className={styles.couponSection}>
            <h4 className={styles.couponLabel}><Tag size={15} /> Apply Coupon</h4>
            {couponApplied ? (
              <div className={styles.couponApplied}>
                <span>🎉 {couponApplied.code} — {couponApplied.description || `${couponApplied.discount_type === 'percentage' ? couponApplied.discount_value + '% off' : '₹' + couponApplied.discount_value + ' off'}`}</span>
                <button onClick={removeCoupon} className={styles.removeCoupon}>Remove</button>
              </div>
            ) : (
              <>
                <div className={styles.couponInput}>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="input"
                    onKeyDown={e => e.key === 'Enter' && !validating && applyCoupon()}
                    disabled={validating}
                  />
                  <button className="btn-outline" onClick={applyCoupon} disabled={validating}>
                    {validating ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className={styles.couponError}>{couponError}</p>}
                <p className={styles.couponHint}>Try: TECHBHARAT10 · STUDENT15 · WELCOME5</p>
              </>
            )}
          </div>

          <div className="divider" />

          {/* Price breakdown */}
          <div className={styles.priceBreakdown}>
            <div className={styles.priceRow}>
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discount > 0 && (
              <div className={`${styles.priceRow} ${styles.priceRowDiscount}`}>
                <span>Coupon Discount</span>
                <span>−₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className={styles.priceRow}>
              <span>GST (18%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.priceRow}>
              <span>Shipping</span>
              <span className={shipping === 0 ? styles.freeShipping : ''}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p className={styles.shippingNote}>
                Add ₹{(SHIPPING_THRESHOLD - discountedSubtotal).toLocaleString('en-IN')} more for free shipping
              </p>
            )}
          </div>

          <div className="divider" />

          <div className={styles.totalRow}>
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button
            className={`btn-primary ${styles.checkoutBtn}`}
            onClick={() => router.push('/checkout')}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>

          <div className={styles.safePayment}>
            <span>🔒 100% Secure Payment via Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
