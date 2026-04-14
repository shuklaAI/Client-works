'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, ChevronDown, ChevronRight, LayoutGrid, List, Star, SlidersHorizontal, X } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import styles from './Category.module.css';

const MOCK_PRODUCTS = [
  { id:'1', name:'Arduino Uno R3', price:599, mrp:899, rating:4.7, reviews:342, image:'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', slug:'arduino-uno-r3', brand:'Arduino', inStock:true },
  { id:'2', name:'Arduino Mega 2560', price:1499, mrp:2199, rating:4.8, reviews:189, image:'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop', slug:'arduino-mega-2560', brand:'Arduino', inStock:true },
  { id:'3', name:'Arduino Nano V3', price:349, mrp:499, rating:4.5, reviews:256, image:'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', slug:'arduino-nano-v3', brand:'Arduino', inStock:true },
  { id:'4', name:'ESP32 DevKit V1', price:449, mrp:599, rating:4.6, reviews:278, image:'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop', slug:'esp32-devkit-v1', brand:'Espressif', inStock:true },
  { id:'5', name:'Raspberry Pi 4B 4GB', price:5499, mrp:6999, rating:4.9, reviews:512, image:'https://images.unsplash.com/photo-1629292921160-a84ffccc5e26?w=400&h=400&fit=crop', slug:'raspberry-pi-4b-4gb', brand:'Raspberry Pi', inStock:false },
  { id:'6', name:'Arduino Uno WiFi R2', price:1899, mrp:2499, rating:4.7, reviews:143, image:'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop', slug:'arduino-uno-wifi', brand:'Arduino', inStock:true },
  { id:'7', name:'NodeMCU ESP8266', price:199, mrp:299, rating:4.5, reviews:892, image:'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', slug:'nodemcu-esp8266', brand:'Espressif', inStock:true },
  { id:'8', name:'STM32F103 Blue Pill', price:299, mrp:449, rating:4.4, reviews:167, image:'https://images.unsplash.com/photo-1580584126903-c17d41830f9b?w=400&h=400&fit=crop', slug:'stm32f103', brand:'STMicro', inStock:true },
];

function Stars({ rating, size = 12 }) {
  return (
    <div className={styles.stars}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? 'currentColor' : 'none'} strokeWidth={i <= Math.round(rating) ? 0 : 1.5} />
      ))}
    </div>
  );
}

export default function CategoryPage({ params }) {
  const slug = params.slug;
  const { addItem } = useCartStore();

  const categoryName = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const [viewMode, setViewMode] = useState('grid');
  const [sort, setSort] = useState('popular');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  const allBrands = [...new Set(MOCK_PRODUCTS.map(p => p.brand))];

  const filtered = useMemo(() => {
    let list = MOCK_PRODUCTS.filter(p => {
      if (inStockOnly && !p.inStock) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (p.rating < minRating) return false;
      return true;
    });

    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sort === 'newest') list = [...list].reverse();
    else list = [...list].sort((a, b) => b.reviews - a.reviews);

    return list;
  }, [sort, priceRange, selectedBrands, inStockOnly, minRating]);

  const toggleBrand = (brand) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };

  const clearFilters = () => {
    setSelectedBrands([]); setInStockOnly(false); setMinRating(0); setPriceRange([0, 10000]);
  };

  const hasFilters = selectedBrands.length > 0 || inStockOnly || minRating > 0 || priceRange[1] < 10000;

  const Sidebar = () => (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h3 className={styles.sidebarTitle}><SlidersHorizontal size={16} /> Filters</h3>
        {hasFilters && <button className={styles.clearFilters} onClick={clearFilters}>Clear All</button>}
      </div>

      {/* In Stock */}
      <div className={styles.filterSection}>
        <label className={styles.checkLabel}>
          <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Price Range</h4>
        <div className={styles.priceInputs}>
          <input type="number" className="input" value={priceRange[0]} onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])} placeholder="Min" style={{ fontSize:'0.8rem', padding:'0.5rem' }} />
          <span className={styles.priceTo}>to</span>
          <input type="number" className="input" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])} placeholder="Max" style={{ fontSize:'0.8rem', padding:'0.5rem' }} />
        </div>
      </div>

      {/* Brands */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Brand</h4>
        <div className={styles.brandList}>
          {allBrands.map(brand => (
            <label key={brand} className={styles.checkLabel}>
              <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className={styles.filterSection}>
        <h4 className={styles.filterTitle}>Minimum Rating</h4>
        <div className={styles.ratingOptions}>
          {[4, 3, 0].map(r => (
            <label key={r} className={styles.checkLabel}>
              <input type="radio" name="rating" checked={minRating === r} onChange={() => setMinRating(r)} />
              <span>{r === 0 ? 'All' : `${r}★ & above`}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="container">
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link href="/">Home</Link><ChevronRight size={13} />
        <span>{categoryName}</span>
      </nav>

      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{categoryName}</h1>
        <p className={styles.pageDesc}>
          Browse our curated collection of {categoryName.toLowerCase()} — genuine parts, competitive pricing, fast delivery.
        </p>
      </div>

      <div className={styles.layout}>
        {/* Desktop sidebar */}
        <div className={styles.desktopSidebar}><Sidebar /></div>

        {/* Mobile filter sheet */}
        {filterOpen && (
          <>
            <div className={styles.filterBackdrop} onClick={() => setFilterOpen(false)} />
            <div className={styles.filterSheet}>
              <div className={styles.filterSheetHeader}>
                <h3>Filters</h3>
                <button onClick={() => setFilterOpen(false)}><X size={20} /></button>
              </div>
              <Sidebar />
              <button className="btn-primary" onClick={() => setFilterOpen(false)} style={{ width:'100%', justifyContent:'center', marginTop:'auto' }}>
                Show {filtered.length} Results
              </button>
            </div>
          </>
        )}

        {/* Products section */}
        <div className={styles.productsSection}>
          {/* Controls */}
          <div className={styles.controls}>
            <button className={`btn-ghost ${styles.mobileFilterBtn}`} onClick={() => setFilterOpen(true)}>
              <Filter size={15} /> Filters {hasFilters && <span className={styles.filterCount}>{selectedBrands.length + (inStockOnly?1:0) + (minRating>0?1:0)}</span>}
            </button>

            <span className={styles.resultsCount}>{filtered.length} products</span>

            <div className={styles.controlsRight}>
              <div className={styles.sortWrap}>
                <label className={styles.sortLabel}>Sort:</label>
                <div className={styles.selectWrap}>
                  <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="popular">Popularity</option>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                  <ChevronDown size={14} className={styles.selectIcon} />
                </div>
              </div>

              <div className={styles.viewToggle}>
                <button className={viewMode === 'grid' ? styles.viewActive : styles.viewBtn} onClick={() => setViewMode('grid')} aria-label="Grid"><LayoutGrid size={17} /></button>
                <button className={viewMode === 'list' ? styles.viewActive : styles.viewBtn} onClick={() => setViewMode('list')} aria-label="List"><List size={17} /></button>
              </div>
            </div>
          </div>

          {/* Products */}
          {filtered.length === 0 ? (
            <div className={styles.noResults}>
              <p>No products match your filters.</p>
              <button className="btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? styles.productGrid : styles.productList}>
              {filtered.map(product => {
                const discount = product.mrp ? Math.round((1 - product.price / product.mrp) * 100) : 0;
                return (
                  <div key={product.id} className={styles.productCard}>
                    <div className={styles.productImageWrap}>
                      <Image src={product.image} alt={product.name} fill sizes="280px" className={styles.productImage} />
                      {discount > 0 && <span className={styles.discountBadge}>{discount}% OFF</span>}
                      {!product.inStock && <div className={styles.outOfStockOverlay}>Out of Stock</div>}
                    </div>
                    <div className={styles.productInfo}>
                      <div className={styles.productRating}>
                        <Stars rating={product.rating} />
                        <span className={styles.ratingNum}>{product.rating}</span>
                        <span className={styles.reviewCount}>({product.reviews})</span>
                      </div>
                      <Link href={`/product/${product.slug}`}>
                        <h3 className={styles.productName}>{product.name}</h3>
                      </Link>
                      <p className={styles.productBrand}>{product.brand}</p>
                      <div className={styles.productPricing}>
                        <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
                        {product.mrp && <span className={styles.mrp}>₹{product.mrp.toLocaleString('en-IN')}</span>}
                      </div>
                      <button
                        className={styles.addCartBtn}
                        disabled={!product.inStock}
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image, slug: product.slug })}
                      >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled>← Prev</button>
            <button className={`${styles.pageBtn} ${styles.pageActive}`}>1</button>
            <button className={styles.pageBtn}>2</button>
            <button className={styles.pageBtn}>3</button>
            <span className={styles.pageEllipsis}>…</span>
            <button className={styles.pageBtn}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
