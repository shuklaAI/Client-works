import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Instagram, Facebook, Twitter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Treks', href: '/treks' },
    { name: 'Experience', href: '/experience' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-2',
      isScrolled ? 'bg-charcoal/90 backdrop-blur-lg border-b border-white/10 py-1' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                'text-xs uppercase tracking-[0.2em] font-medium transition-colors relative group',
                location.pathname === link.href ? 'text-gold' : 'text-white/70 hover:text-white'
              )}
            >
              {link.name}
              <span className={cn(
                'absolute -bottom-1 left-0 h-[1px] bg-gold transition-all duration-300',
                location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
              )} />
            </Link>
          ))}
          <Link to="/contact" className="px-6 py-2 border border-white/20 rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-charcoal transition-all duration-300">
            Book Now
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-charcoal border-b border-white/10 p-8 flex flex-col items-center space-y-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-serif tracking-widest uppercase text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/contact" className="w-full py-4 border border-white/20 rounded-full text-xs uppercase tracking-[0.2em] text-center" onClick={() => setIsMobileMenuOpen(false)}>
              Book Now
            </Link>
            <div className="flex space-x-6 pt-4">
              <Instagram size={20} className="text-white/50" />
              <Facebook size={20} className="text-white/50" />
              <Twitter size={20} className="text-white/50" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
