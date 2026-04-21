import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

export default function Section({ children, className, id, title, subtitle, fullWidth = false }) {
  return (
    <section
      id={id}
      className={cn(
        'relative py-24 md:py-32 overflow-hidden',
        className
      )}
    >
      <div className={cn(
        'mx-auto px-6',
        fullWidth ? 'w-full' : 'max-w-7xl'
      )}>
        {(title || subtitle) && (
          <div className="mb-16 md:mb-24 text-center">
            {subtitle && (
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-gold font-semibold mb-4 block"
              >
                {subtitle}
              </motion.span>
            )}
            {title && (
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl lg:text-7xl font-serif text-white leading-tight"
              >
                {title}
              </motion.h2>
            )}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-[1px] w-24 bg-gold mx-auto mt-8 origin-center"
            />
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
