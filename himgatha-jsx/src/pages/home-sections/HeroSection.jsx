import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={heroRef} className="relative h-screen w-full overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 ken-burns">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2000"
          alt="Himalayan Peaks"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-charcoal" />
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative h-full flex flex-col items-center justify-center text-center px-6"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs md:text-sm uppercase tracking-[0.5em] text-gold font-semibold mb-6"
        >
          Welcome to Himgatha Trails
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="text-5xl md:text-7xl lg:text-9xl font-serif text-white mb-8 leading-tight max-w-5xl"
        >
          Escape the Noise. <br />
          <span className="italic font-light">Find Yourself.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-white/60 text-sm md:text-lg tracking-widest uppercase mb-12 max-w-2xl"
        >
          Curated luxury trekking experiences in the heart of the Himalayas.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8"
        >
          <a href="#treks" className="px-10 py-4 bg-gold text-charcoal text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white transition-all duration-300 flex items-center group">
            Explore Treks
            <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <button className="px-10 py-4 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white/10 transition-all duration-300">
            Book Now
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-4">Scroll to Explore</span>
        <div className="w-[1px] h-16 bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  );
}
