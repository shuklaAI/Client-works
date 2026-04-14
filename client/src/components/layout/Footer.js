import Link from 'next/link';
import { Mail, Phone, MapPin, Zap, Github, Twitter, Instagram, Youtube } from 'lucide-react';
import styles from './Footer.module.css';

const CATEGORIES = [
  { name: 'Development Boards', slug: 'development-boards' },
  { name: 'Sensors & Modules', slug: 'sensors-modules' },
  { name: 'Drone Parts', slug: 'drone-parts' },
  { name: '3D Printing', slug: '3d-printing' },
  { name: 'Robotics Kits', slug: 'robotics-kits' },
  { name: 'Batteries & Power', slug: 'batteries-power' },
];

const QUICK_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Track Your Order', href: '/account/orders' },
  { name: 'FAQ', href: '/faq' },
  { name: 'Blog', href: '/blog' },
  { name: 'Bulk Orders', href: '/bulk' },
];

const POLICIES = [
  { name: 'Shipping Policy', href: '/shipping' },
  { name: 'Returns & Refunds', href: '/returns' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Warranty', href: '/warranty' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Newsletter */}
      <div className={styles.newsletter}>
        <div className={`container ${styles.newsletterInner}`}>
          <div>
            <h3 className={styles.newsletterTitle}>Stay ahead of the curve.</h3>
            <p className={styles.newsletterSub}>Latest launches, restocks & exclusive deals — straight to your inbox.</p>
          </div>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="your@email.com" className={styles.newsletterInput} required />
            <button type="submit" className="btn-primary">Subscribe</button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className={`container ${styles.mainFooter}`}>
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo}>
              <span>⚡</span>
              <span className={styles.logoText}>Tech<span className={styles.logoGold}>Bharat</span></span>
            </Link>
            <p className={styles.brandDesc}>
              India's premier destination for robotics, electronics, and maker components. Empowering engineers, hobbyists, and students since 2020.
            </p>
            <div className={styles.contact}>
              <a href="mailto:support@techbharat.com" className={styles.contactItem}>
                <Mail size={15} /> support@techbharat.com
              </a>
              <a href="tel:+911234567890" className={styles.contactItem}>
                <Phone size={15} /> +91 123 456 7890
              </a>
              <span className={styles.contactItem}>
                <MapPin size={15} /> Bengaluru, Karnataka 560001
              </span>
            </div>
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Twitter"><Twitter size={17} /></a>
              <a href="#" className={styles.socialIcon} aria-label="Instagram"><Instagram size={17} /></a>
              <a href="#" className={styles.socialIcon} aria-label="YouTube"><Youtube size={17} /></a>
              <a href="#" className={styles.socialIcon} aria-label="GitHub"><Github size={17} /></a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className={styles.colTitle}>Categories</h4>
            <ul className={styles.linkList}>
              {CATEGORIES.map(c => (
                <li key={c.slug}><Link href={`/category/${c.slug}`}>{c.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={styles.colTitle}>Quick Links</h4>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map(l => (
                <li key={l.href}><Link href={l.href}>{l.name}</Link></li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className={styles.colTitle}>Policies</h4>
            <ul className={styles.linkList}>
              {POLICIES.map(l => (
                <li key={l.href}><Link href={l.href}>{l.name}</Link></li>
              ))}
            </ul>
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>🔒 SSL Secure</div>
              <div className={styles.trustBadge}>✅ Razorpay</div>
              <div className={styles.trustBadge}>🇮🇳 Made in India</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} TechBharat Store. All rights reserved.
          </p>
          <div className={styles.paymentIcons}>
            <span className={styles.payIcon}>Razorpay</span>
            <span className={styles.payIcon}>UPI</span>
            <span className={styles.payIcon}>VISA</span>
            <span className={styles.payIcon}>Mastercard</span>
            <span className={styles.payIcon}>Net Banking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
