'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Zap, Bell, Shield } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import styles from './Header.module.css';

const NAV_LINKS = [
  { label: 'Dev Boards', slug: 'development-boards' },
  { label: 'Sensors', slug: 'sensors-modules' },
  { label: 'Motors', slug: 'motors-actuators' },
  { label: 'Drone Parts', slug: 'drone-parts' },
  { label: '3D Printing', slug: '3d-printing' },
  { label: 'Batteries', slug: 'batteries-power' },
  { label: 'Kits', slug: 'robotics-kits' },
  { label: 'Tools', slug: 'tools-equipment' },
];

export default function Header() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const { isAuthenticated, user, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      {/* Announcement bar */}
      <div className={styles.announcementBar}>
        <div className={`container ${styles.announcementInner}`}>
          <div className={styles.announcementText}>
            <Zap size={13} />
            <span>Free shipping on orders above ₹999 | Use code <strong>TECHBHARAT10</strong> for 10% off</span>
          </div>
          <div className={styles.topLinks}>
            <Link href="/about">About</Link>
            <span className={styles.dot}>·</span>
            <Link href="/contact">Contact</Link>
            {isAuthenticated && user?.role === 'admin' && (
              <>
                <span className={styles.dot}>·</span>
                <Link href="/admin" className={styles.adminTopLink}><Shield size={11} /> Admin</Link>
              </>
            )}
            {!isAuthenticated && (
              <>
                <span className={styles.dot}>·</span>
                <Link href="/login">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main header row */}
      <div className={styles.mainBar}>
        <div className={`container ${styles.mainInner}`}>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <img src="/logo.png" alt="TechBharat" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
            <span className={styles.logoText}>
              Tech<span className={styles.logoGold}>Bharat</span>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              placeholder="Search Arduino, Raspberry Pi, Drone Parts…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} aria-label="Search">
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className={styles.actions}>
            {/* User */}
            <div className={styles.userWrapper} ref={userMenuRef}>
              <button
                className={styles.actionBtn}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Account"
              >
                <User size={20} />
                <span className={styles.actionLabel}>
                  {isAuthenticated ? user?.name?.split(' ')[0] : 'Account'}
                </span>
                <ChevronDown size={14} className={userMenuOpen ? styles.chevronOpen : ''} />
              </button>
              {userMenuOpen && (
                <div className={styles.userMenu}>
                  {isAuthenticated ? (
                    <>
                      <div className={styles.userMenuHeader}>
                        <span className={styles.userMenuName}>{user?.name}</span>
                        <span className={styles.userMenuEmail}>{user?.email}</span>
                      </div>
                      <div className={styles.userMenuDivider} />
                      <Link href="/account" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>My Account</Link>
                      <Link href="/account/orders" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      <Link href="/account/wishlist" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      {user?.role === 'admin' && (
                        <>
                          <div className={styles.userMenuDivider} />
                          <Link href="/admin" className={`${styles.userMenuItem} ${styles.adminMenuItem}`} onClick={() => setUserMenuOpen(false)}>
                            <Shield size={14} /> Admin Panel
                          </Link>
                        </>
                      )}
                      <div className={styles.userMenuDivider} />
                      <button className={`${styles.userMenuItem} ${styles.logoutBtn}`} onClick={handleLogout}>
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className={`${styles.userMenuItem} ${styles.userMenuPrimary}`} onClick={() => setUserMenuOpen(false)}>
                        Sign In
                      </Link>
                      <Link href="/register" className={styles.userMenuItem} onClick={() => setUserMenuOpen(false)}>
                        Create Account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className={styles.cartBtn} aria-label="Cart">
              <div className={styles.cartIconWrap}>
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className={styles.cartBadge}>{itemCount > 99 ? '99+' : itemCount}</span>
                )}
              </div>
              <span className={styles.actionLabel}>Cart</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              className={styles.menuToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Category Nav */}
      <nav className={styles.categoryNav}>
        <div className={`container ${styles.navInner}`}>
          <ul className={styles.navList}>
            {NAV_LINKS.map((link) => (
              <li key={link.slug} className={styles.navItem}>
                <Link href={`/category/${link.slug}`} className={styles.navLink}>
                  {link.label}
                </Link>
              </li>
            ))}
            <li className={styles.navItem}>
              <Link href="/deals" className={`${styles.navLink} ${styles.navLinkDeal}`}>
                🔥 Deals
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className={styles.mobileBackdrop} onClick={() => setMobileOpen(false)} />
          <div className={styles.mobileDrawer}>
            <form onSubmit={handleSearch} className={styles.mobileSearch}>
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.mobileSearchInput}
              />
              <button type="submit" className={styles.mobileSearchBtn}><Search size={16} /></button>
            </form>

            <nav className={styles.mobileNav}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.slug}
                  href={`/category/${link.slug}`}
                  className={styles.mobileNavLink}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className={styles.mobileDivider} />
            {isAuthenticated ? (
              <>
                <Link href="/account" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>My Account</Link>
                <Link href="/account/orders" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>My Orders</Link>
                <button className={`${styles.mobileNavLink} ${styles.logoutBtn}`} onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link href="/register" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Create Account</Link>
              </>
            )}
          </div>
        </>
      )}
    </header>
  );
}
