'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Minus, Plus, ShoppingCart, Heart,
  Share2, ShieldCheck, Truck, RefreshCw, Star,
  ArrowRight, Check
} from 'lucide-react';
import useCartStore from '@/store/cartStore';
import styles from './Product.module.css';

// Mock data — replace with real API call
const MOCK_PRODUCT = {
  id: '1',
  name: 'Arduino Uno R3 SMD Development Board',
  sku: 'RD-ARD-001',
  price: 599,
  mrp: 899,
  rating: 4.7,
  reviews: 342,
  inStock: true,
  stockCount: 45,
  brand: 'Arduino',
  slug: 'arduino-uno-r3',
  category: { name: 'Development Boards', slug: 'development-boards' },
  images: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=800&fit=crop',
  ],
  description: '<p>The Arduino Uno R3 is a microcontroller board based on the ATmega328P. It has 14 digital I/O pins (6 PWM outputs), 6 analog inputs, a 16 MHz ceramic resonator, a USB connection, a power jack, an ICSP header and a reset button.</p><p>It contains everything needed to support the microcontroller; simply connect it to a computer with a USB cable or power it with an AC-to-DC adapter or battery to get started. Compatible with all Arduino shields and libraries.</p>',
  specs: [
    ['Microcontroller', 'ATmega328P'],
    ['Operating Voltage', '5V'],
    ['Input Voltage (recommended)', '7–12V'],
    ['Digital I/O Pins', '14 (6 PWM)'],
    ['Analog Input Pins', '6'],
    ['DC Current per I/O Pin', '40 mA'],
    ['Flash Memory', '32 KB (0.5 KB used by bootloader)'],
    ['SRAM', '2 KB'],
    ['EEPROM', '1 KB'],
    ['Clock Speed', '16 MHz'],
    ['Weight', '25 g'],
  ],
  features: [
    'ATmega328P microcontroller',
    'USB-B connector for programming',
    'Compatible with all official Arduino shields',
    'Open-source hardware & software',
    'Extensive library and community support',
    '1-year warranty',
  ],
};

const RELATED = [
  { id:'2', name:'Arduino Mega 2560', price:1499, mrp:2199, rating:4.8, image:'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop', slug:'arduino-mega-2560' },
  { id:'3', name:'Arduino Nano V3', price:349, mrp:499, rating:4.5, image:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', slug:'arduino-nano-v3' },
  { id:'4', name:'ESP32 DevKit V1', price:449, mrp:599, rating:4.6, image:'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop', slug:'esp32-devkit-v1' },
  { id:'5', name:'Raspberry Pi Zero 2W', price:1299, mrp:1799, rating:4.7, image:'https://images.unsplash.com/photo-1629292921160-a84ffccc5e26?w=400&h=400&fit=crop', slug:'pi-zero-2w' },
];

const MOCK_REVIEWS = [
  { id:'1', name:'Rahul S.', rating:5, date:'12 Mar 2025', text:'Genuine Arduino board, works perfectly. Fast shipping too!' },
  { id:'2', name:'Priya M.', rating:4, date:'28 Feb 2025', text:'Good board for beginners. Came well-packaged.' },
  { id:'3', name:'Arjun K.', rating:5, date:'15 Feb 2025', text:'TechBharat\'s quality is consistently good. Will order again.' },
];

function Stars({ rating, size = 14 }) {
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={i <= Math.round(rating) ? 0 : 1.5} />
      ))}
    </div>
  );
}

export default function ProductPage({ params }) {
  const { addItem } = useCartStore();
  const router = useRouter();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = MOCK_PRODUCT; // In prod: fetch by params.slug
  const discount = Math.round((1 - product.price / product.mrp) * 100);

  const handleAddToCart = () => {
    addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.images[0], slug: product.slug }, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.images[0], slug: product.slug }, quantity);
    router.push('/checkout');
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link><ChevronRight size={13} />
        <Link href={`/category/${product.category.slug}`}>{product.category.name}</Link><ChevronRight size={13} />
        <span>{product.name}</span>
      </nav>

      {/* Main product layout */}
      <div className={styles.productLayout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrap}>
            <Image src={product.images[activeImage]} alt={product.name} fill priority className={styles.mainImage} />
            {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
          </div>
          <div className={styles.thumbnails}>
            {product.images.map((img, i) => (
              <button key={i} className={`${styles.thumb} ${activeImage === i ? styles.thumbActive : ''}`} onClick={() => setActiveImage(i)}>
                <Image src={img} alt={`View ${i+1}`} fill className={styles.thumbImg} />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className={styles.details}>
          <div className={styles.brandRow}>
            <span className={styles.brand}>{product.brand}</span>
            <span className={styles.sku}>SKU: {product.sku}</span>
          </div>

          <h1 className={styles.productTitle}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <Stars rating={product.rating} size={16} />
            <span className={styles.ratingScore}>{product.rating}</span>
            <a href="#reviews" className={styles.reviewLink}>{product.reviews} reviews</a>
            <span className={styles.ratingDot}>·</span>
            <span className={styles.inStock}>{product.inStock ? '✓ In Stock' : 'Out of Stock'}</span>
          </div>

          <div className={styles.pricing}>
            <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
            <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>
            <span className={styles.savings}>Save ₹{(product.mrp - product.price).toLocaleString('en-IN')}</span>
          </div>
          <p className={styles.taxNote}>Inclusive of all taxes</p>

          {/* Features quick list */}
          <div className={styles.featuresList}>
            {product.features.slice(0, 4).map((f, i) => (
              <div key={i} className={styles.featureItem}><Check size={13} />{f}</div>
            ))}
          </div>

          {/* Qty + CTA */}
          <div className={styles.actions}>
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Qty:</span>
              <div className={styles.qtyControl}>
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={14} /></button>
                <span className={styles.qty}>{quantity}</span>
                <button className={styles.qtyBtn} onClick={() => setQuantity(q => Math.min(product.stockCount, q + 1))} disabled={quantity >= product.stockCount}><Plus size={14} /></button>
              </div>
              <span className={styles.stockLeft}>({product.stockCount} available)</span>
            </div>

            <div className={styles.ctaRow}>
              <button className={`${styles.addCartBtn} ${addedToCart ? styles.addedBtn : ''}`} onClick={handleAddToCart} disabled={!product.inStock}>
                {addedToCart ? <><Check size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button className="btn-primary" onClick={handleBuyNow} disabled={!product.inStock} style={{ flex: 1, justifyContent: 'center', padding: '0.85rem' }}>
                Buy Now <ArrowRight size={16} />
              </button>
              <button className={`${styles.wishlistBtn} ${wishlist ? styles.wishlistActive : ''}`} onClick={() => setWishlist(!wishlist)} aria-label="Wishlist">
                <Heart size={20} fill={wishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>

          {/* Trust pills */}
          <div className={styles.trustRow}>
            <div className={styles.trustPill}><ShieldCheck size={14} /> 100% Genuine</div>
            <div className={styles.trustPill}><Truck size={14} /> Fast Delivery</div>
            <div className={styles.trustPill}><RefreshCw size={14} /> 7-Day Return</div>
          </div>

          {/* Share */}
          <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Share:</span>
            {['WhatsApp', 'Twitter', 'Copy Link'].map(s => (
              <button key={s} className={styles.shareBtn}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs} id="reviews">
        <div className={styles.tabHeaders}>
          {['description', 'specs', 'reviews'].map(t => (
            <button key={t} className={`${styles.tabBtn} ${activeTab === t ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'description' ? 'Description' : t === 'specs' ? 'Specifications' : `Reviews (${product.reviews})`}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <div className={styles.descTab} dangerouslySetInnerHTML={{ __html: product.description }} />
          )}

          {activeTab === 'specs' && (
            <table className={styles.specsTable}>
              <tbody>
                {product.specs.map(([key, val], i) => (
                  <tr key={i}>
                    <th>{key}</th>
                    <td>{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'reviews' && (
            <div className={styles.reviewsTab}>
              <div className={styles.reviewsSummary}>
                <div className={styles.ratingBig}>
                  <span className={styles.ratingBigNum}>{product.rating}</span>
                  <Stars rating={product.rating} size={22} />
                  <span className={styles.ratingBigCount}>{product.reviews} reviews</span>
                </div>
              </div>
              <div className={styles.reviewList}>
                {MOCK_REVIEWS.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div className={styles.reviewAvatar}>{r.name[0]}</div>
                      <div>
                        <strong className={styles.reviewName}>{r.name}</strong>
                        <span className={styles.reviewDate}>{r.date}</span>
                      </div>
                      <div className={styles.reviewStars}><Stars rating={r.rating} size={13} /></div>
                    </div>
                    <p className={styles.reviewText}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      <section className={styles.related}>
        <h2 className={styles.relatedTitle}>You Might Also Like</h2>
        <div className={styles.relatedGrid}>
          {RELATED.map(p => (
            <Link href={`/product/${p.slug}`} key={p.id} className={styles.relatedCard}>
              <div className={styles.relatedImageWrap}>
                <Image src={p.image} alt={p.name} fill className={styles.relatedImage} />
              </div>
              <div className={styles.relatedInfo}>
                <div className={styles.relatedRating}><Stars rating={p.rating} size={11} /><span>{p.rating}</span></div>
                <h4 className={styles.relatedName}>{p.name}</h4>
                <div className={styles.relatedPrice}>
                  <span>₹{p.price.toLocaleString('en-IN')}</span>
                  <span className={styles.relatedMrp}>₹{p.mrp.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
