import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import TrekCard from '../components/TrekCard';
import Section from '../components/Section';
import logo from '../assets/logo.png';

const featuredTreks = [
  { id: '1', title: 'Hampta Pass Trek', location: 'Kullu–Manali, Himachal Pradesh', duration: '5 Days', difficulty: 'Moderate', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000', price: '₹14,500' },
  { id: '2', title: 'Beas Kund Trek', location: 'Manali, Himachal Pradesh', duration: '4 Days', difficulty: 'Easy–Moderate', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000', price: '₹9,999' },
  { id: '3', title: 'Bhrigu Lake Trek', location: 'Manali, Himachal Pradesh', duration: '4 Days', difficulty: 'Moderate', image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1000', price: '₹11,500' },
];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="relative">
      
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
        
        {/* Background */}
        <motion.div style={{ y }} className="absolute inset-0 ken-burns">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2000"
            alt="Himalayan Peaks"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-charcoal" />
        </motion.div>

        {/* Content */}
        <motion.div
          style={{ opacity }}
          className="relative h-full flex flex-col items-center justify-center text-center px-6 space-y-6"
        >
          
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src={logo}
              alt="Himgatha Trails"
              className="h-40 md:h-48 lg:h-56 w-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* Tagline */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xs md:text-sm uppercase tracking-[0.5em] text-gold font-semibold"
          >
            Himachal Pradesh • Uttarakhand • Nepal
          </motion.span>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-9xl font-serif text-white leading-tight max-w-5xl"
          >
            Come for the Snow <br />
            <span className="italic font-light">Stay for the Story!</span>
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-white/60 text-sm md:text-lg tracking-widest uppercase max-w-2xl"
          >
            Premium Himalayan treks crafted for the Indian explorer's soul.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col md:flex-row items-center gap-6 pt-4"
          >
            <Link to="/treks" className="px-10 py-4 bg-gold text-charcoal text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white transition-all duration-300 flex items-center group">
              Explore Treks <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link to="/contact" className="px-10 py-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white/10 transition-all duration-300">
              Book Now
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator (fixed position) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center"
        >
          <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
        </motion.div>

      </section>

      {/* Featured Treks */}
      <Section id="treks" subtitle="Curated Journeys" title="Featured Expeditions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTreks.map((trek, index) => (
            <motion.div key={trek.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <TrekCard {...trek} />
            </motion.div>
          ))}
        </div>
      </Section>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/918859332491"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 p-4 bg-emerald-500 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <MessageCircle size={28} />
      </a>

    </div>
  );
}