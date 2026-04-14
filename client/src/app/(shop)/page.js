import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, Clock, Zap, Star, ChevronRight, Award } from 'lucide-react';
import HomeProductCard from '@/components/HomeProductCard';
import styles from './Home.module.css';

const FEATURED_CATEGORIES = [
  { name: 'Arduino', slug: 'development-boards', icon: '⚡', count: '240+' },
  { name: 'Sensors', slug: 'sensors-modules', icon: '📡', count: '180+' },
  { name: 'Drone Parts', slug: 'drone-parts', icon: '🚁', count: '95+' },
  { name: 'Motors', slug: 'motors-actuators', icon: '⚙️', count: '120+' },
  { name: '3D Printing', slug: '3d-printing', icon: '🖨️', count: '60+' },
  { name: 'Batteries', slug: 'batteries-power', icon: '🔋', count: '75+' },
  { name: 'IoT & WiFi', slug: 'iot-wifi', icon: '📶', count: '85+' },
  { name: 'Robotics Kits', slug: 'robotics-kits', icon: '🤖', count: '40+' },
];

const NEW_ARRIVALS = [
  { id: '1', name: 'Raspberry Pi 5 8GB', price: 7499, mrp: 8499, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1629292921160-a84ffccc5e26?w=400&h=400&fit=crop', slug: 'raspberry-pi-5-8gb', badge: 'New' },
  { id: '2', name: 'Arduino Mega 2560 R3', price: 1499, mrp: 2199, rating: 4.7, reviews: 342, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop', slug: 'arduino-mega-2560', badge: null },
  { id: '3', name: 'F450 Quadcopter Frame', price: 799, mrp: 1199, rating: 4.5, reviews: 89, image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=400&h=400&fit=crop', slug: 'f450-quadcopter-frame', badge: 'Popular' },
  { id: '4', name: 'Ender 3 V3 3D Printer', price: 16999, mrp: 21999, rating: 4.9, reviews: 56, image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop', slug: 'ender-3-v3', badge: 'Best Seller' },
];

const BESTSELLERS = [
  { id: '5', name: 'Arduino Uno R4 WiFi', price: 2199, mrp: 2799, rating: 4.9, reviews: 512, image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop', slug: 'arduino-uno-r4-wifi' },
  { id: '6', name: 'ESP32-S3 DevKit', price: 649, mrp: 899, rating: 4.7, reviews: 278, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=400&fit=crop', slug: 'esp32-s3-devkit' },
  { id: '7', name: 'NEMA 17 Stepper Motor', price: 449, mrp: 699, rating: 4.6, reviews: 195, image: 'https://images.unsplash.com/photo-1562408590-e32931084e23?w=400&h=400&fit=crop', slug: 'nema-17-stepper' },
  { id: '8', name: 'LiPo 5000mAh 3S Battery', price: 1899, mrp: 2499, rating: 4.8, reviews: 167, image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=400&fit=crop', slug: 'lipo-5000-3s' },
];

const TESTIMONIALS = [
  { name: 'Arjun Sharma', role: 'IIT Delhi Student', rating: 5, text: 'Ordered drone parts for my final year project. Delivery in 2 days to Delhi, components were 100% genuine. TechBharat is my go-to store now.' },
  { name: 'Priya Menon', role: 'Electronics Hobbyist', rating: 5, text: 'Love the curated selection of Arduino components. The pricing is competitive and customer support actually knows their electronics.' },
  { name: 'Rahul Nair', role: 'Startup Founder', rating: 5, text: 'Bulk ordered ESP32 modules for our IoT product. Got special pricing and fast delivery. Highly recommend for bulk orders too.' },
];



export default function Home() {
  return (
    <div className={styles.home}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroGlow} />
          <div className={styles.heroGrid} />
        </div>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroTag}>
              <img src="/logo.png" alt="TechBharat" style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} />
              India's #1 Electronics & Robotics Store
            </div>
            <h1 className={styles.heroTitle}>
              Build the <em className={styles.heroEm}>Future</em><br />
              with Authentic Parts
            </h1>
            <p className={styles.heroDesc}>
              Over 5,000+ genuine components — Arduino, Raspberry Pi, Drone Parts, EV Kits & more.
              Fast nationwide delivery. Expert technical support.
            </p>
            <div className={styles.heroActions}>
              <Link href="/category/development-boards" className="btn-primary">
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link href="/category/robotics-kits" className="btn-outline">
                Explore Kits
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}><strong>5,000+</strong><span>Products</span></div>
              <div className={styles.statDiv} />
              <div className={styles.stat}><strong>50,000+</strong><span>Orders</span></div>
              <div className={styles.statDiv} />
              <div className={styles.stat}><strong>4.8★</strong><span>Rating</span></div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroCard}>
              <Image
                src="https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=560&h=440&fit=crop"
                alt="Electronic Components"
                width={560} height={440}
                className={styles.heroImage}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className={styles.trustBar}>
        <div className={`container ${styles.trustGrid}`}>
          {[
            { icon: <Truck size={28} />, title: 'Free Shipping', sub: 'Orders above ₹999' },
            { icon: <ShieldCheck size={28} />, title: '100% Genuine', sub: 'Authentic components only' },
            { icon: <Clock size={28} />, title: '24/7 Support', sub: 'Technical help always' },
            { icon: <Award size={28} />, title: 'Easy Returns', sub: '7-day return policy' },
          ].map((item, i) => (
            <div key={i} className={styles.trustItem}>
              <div className={styles.trustIcon}>{item.icon}</div>
              <div>
                <h4 className={styles.trustTitle}>{item.title}</h4>
                <p className={styles.trustSub}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className="section-label">Explore</p>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
          </div>
          <Link href="/categories" className={styles.viewAll}>
            All Categories <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.categoryGrid}>
          {FEATURED_CATEGORIES.map((cat, i) => (
            <Link href={`/category/${cat.slug}`} key={i} className={styles.categoryCard}>
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryName}>{cat.name}</span>
              <span className={styles.categoryCount}>{cat.count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <p className="section-label">Just In</p>
              <h2 className={styles.sectionTitle}>New Arrivals</h2>
            </div>
            <Link href="/new-arrivals" className={styles.viewAll}>
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className={styles.productGrid}>
            {NEW_ARRIVALS.map(p => <HomeProductCard key={p.id} product={p} styles={styles} />)}
          </div>
        </div>
      </section>

      {/* ── PROMO BANNER ── */}
      <section className="container">
        <div className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <div className={styles.promoTag}>Limited Time Offer</div>
            <h2 className={styles.promoTitle}>Student Discount — 10% OFF</h2>
            <p className={styles.promoSub}>
              Are you a student working on your college project? Get exclusive discounts on bulk orders.
              Valid student ID required.
            </p>
            <div className={styles.promoActions}>
              <Link href="/student-offer" className="btn-primary">Claim Discount <ArrowRight size={16} /></Link>
              <Link href="/bulk" className="btn-outline">Bulk Orders</Link>
            </div>
          </div>
          <div className={styles.promoDecor}>🎓</div>
        </div>
      </section>

      {/* ── BESTSELLERS ── */}
      <section className={`container ${styles.section}`}>
        <div className={styles.sectionHeader}>
          <div>
            <p className="section-label">Top Picks</p>
            <h2 className={styles.sectionTitle}>Bestsellers</h2>
          </div>
          <Link href="/bestsellers" className={styles.viewAll}>
            View All <ChevronRight size={16} />
          </Link>
        </div>
        <div className={styles.productGrid}>
          {BESTSELLERS.map(p => <HomeProductCard key={p.id} product={p} styles={styles} />)}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={`${styles.section} ${styles.darkSection}`}>
        <div className="container">
          <div className={styles.sectionHeader} style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <p className="section-label" style={{ justifyContent: 'center' }}>What Makers Say</p>
              <h2 className={styles.sectionTitle}>Trusted by 50,000+ Engineers</h2>
            </div>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" className="text-gold" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>{t.name[0]}</div>
                  <div>
                    <strong className={styles.testimonialName}>{t.name}</strong>
                    <span className={styles.testimonialRole}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
