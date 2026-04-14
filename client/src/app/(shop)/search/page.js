'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Star, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import styles from './Search.module.css';

// Mock results — replace with real API
function getMockResults(query) {
  const all = [
    { id:'1', name:'Arduino Uno R3', price:599, mrp:899, rating:4.7, reviews:342, image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', slug:'arduino-uno-r3', brand:'Arduino', category:'Development Boards' },
    { id:'2', name:'Arduino Mega 2560', price:1499, mrp:2199, rating:4.8, reviews:189, image:'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop', slug:'arduino-mega-2560', brand:'Arduino', category:'Development Boards' },
    { id:'3', name:'Arduino Nano V3', price:349, mrp:499, rating:4.5, reviews:256, image:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', slug:'arduino-nano-v3', brand:'Arduino', category:'Development Boards' },
    { id:'4', name:'ESP32 DevKit V1', price:449, mrp:599, rating:4.6, reviews:278, image:'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop', slug:'esp32-devkit-v1', brand:'Espressif', category:'Development Boards' },
    { id:'5', name:'Raspberry Pi 4B 4GB', price:5499, mrp:6999, rating:4.9, reviews:512, image:'https://images.unsplash.com/photo-1629292921160-a84ffccc5e26?w=400&h=400&fit=crop', slug:'raspberry-pi-4b', brand:'Raspberry Pi', category:'Development Boards' },
    { id:'6', name:'Arduino Uno WiFi R2', price:1899, mrp:2499, rating:4.7, reviews:143, image:'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop', slug:'arduino-uno-wifi', brand:'Arduino', category:'Development Boards' },
    { id:'7', name:'NodeMCU ESP8266', price:199, mrp:299, rating:4.5, reviews:892, image:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', slug:'nodemcu-esp8266', brand:'Espressif', category:'IoT Boards' },
    { id:'8', name:'NEMA 17 Stepper Motor', price:449, mrp:699, rating:4.6, reviews:195, image:'https://images.unsplash.com/photo-1580584126903-c17d41830f9b?w=400&h=400&fit=crop', slug:'nema-17', brand:'Generic', category:'Motors' },
  ];
  if (!query) return all;
  const q = query.toLowerCase();
  return all.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
}

function Stars({ rating }) {
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={i <= Math.round(rating) ? 0 : 1.5} />
      ))}
    </div>
  );
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  const query = searchParams.get('q') || '';
  const [localQ, setLocalQ] = useState(query);
  const [sort, setSort] = useState('popular');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setLocalQ(query);
    setIsLoading(true);
    setTimeout(() => {
      setResults(getMockResults(query));
      setIsLoading(false);
    }, 300);
  }, [query]);

  const sortedResults = [...results].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    if (sort === 'newest') return b.id.localeCompare(a.id);
    return b.reviews - a.reviews;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (localQ.trim()) router.push(`/search?q=${encodeURIComponent(localQ.trim())}`);
  };

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Search bar */}
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <div className={styles.searchBox}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              value={localQ}
              onChange={e => setLocalQ(e.target.value)}
              placeholder="Search for products, brands, categories…"
              className={styles.searchInput}
              autoFocus
            />
            {localQ && (
              <button type="button" className={styles.clearBtn} onClick={() => { setLocalQ(''); router.push('/search'); }}>
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Search</button>
        </form>

        {/* Results header */}
        {query && (
          <div className={styles.resultsHeader}>
            <div>
              <h1 className={styles.resultsTitle}>
                {isLoading ? 'Searching…' : `${sortedResults.length} results for`}
                {!isLoading && <em className={styles.queryText}> "{query}"</em>}
              </h1>
            </div>
            <div className={styles.sortRow}>
              <label className={styles.sortLabel}>Sort:</label>
              <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                <option value="popular">Popularity</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
                <option value="rating">Best Rating</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        )}

        {/* No query state */}
        {!query && (
          <div className={styles.emptyState}>
            <Search size={56} className={styles.emptyIcon} />
            <h2>Search TechBharat</h2>
            <p>Find Arduino, Raspberry Pi, drone parts, sensors, motors and more.</p>
            <div className={styles.popularSearches}>
              <p className={styles.popularLabel}>Popular searches:</p>
              {['Arduino Uno', 'ESP32', 'Raspberry Pi', 'Drone Motor', '3D Printer'].map(s => (
                <button key={s} className={styles.popularTag} onClick={() => router.push(`/search?q=${encodeURIComponent(s)}`)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className={styles.grid}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ aspectRatio:'1', width:'100%' }} />
                <div style={{ padding: 'var(--sp-3)', display:'flex', flexDirection:'column', gap:'var(--sp-2)' }}>
                  <div className="skeleton" style={{ height:12, width:'80%' }} />
                  <div className="skeleton" style={{ height:12, width:'60%' }} />
                  <div className="skeleton" style={{ height:16, width:'40%' }} />
                  <div className="skeleton" style={{ height:34, width:'100%', marginTop:'var(--sp-2)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No results */}
        {!isLoading && query && sortedResults.length === 0 && (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No results for "{query}"</h3>
            <p>Try different keywords or browse our categories.</p>
            <div className={styles.noResultsActions}>
              <Link href="/" className="btn-primary">Browse All Products</Link>
              <Link href="/category/development-boards" className="btn-outline">Dev Boards</Link>
            </div>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && sortedResults.length > 0 && (
          <div className={styles.grid}>
            {sortedResults.map(product => {
              const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
              return (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.imageWrap}>
                    <Image src={product.image} alt={product.name} fill sizes="260px" className={styles.productImage} />
                    {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
                    <div className={styles.overlay}>
                      <Link href={`/product/${product.slug}`} className={styles.viewBtn}>View</Link>
                    </div>
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.ratingRow}>
                      <Stars rating={product.rating} />
                      <span className={styles.ratingScore}>{product.rating}</span>
                      <span className={styles.reviewCount}>({product.reviews})</span>
                    </div>
                    <p className={styles.brand}>{product.brand} · {product.category}</p>
                    <Link href={`/product/${product.slug}`}>
                      <h3 className={styles.name}>{product.name}</h3>
                    </Link>
                    <div className={styles.priceRow}>
                      <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                      {product.mrp && <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>}
                    </div>
                    <button
                      className={styles.addBtn}
                      onClick={() => addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image, slug: product.slug })}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
