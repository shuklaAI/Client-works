import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Section from '../../components/Section';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    role: 'Adventure Photographer',
    content: "Himgatha Trails doesn't just take you on a trek; they take you on a journey within. The attention to detail and luxury in the wild is unmatched.",
  },
  {
    name: 'David Miller',
    role: 'Corporate Executive',
    content: 'The perfect escape from the noise. The silence of the Himalayas combined with the premium service made it an unforgettable experience.',
  },
  {
    name: 'Elena Rossi',
    role: 'Yoga Instructor',
    content: "A spiritual awakening. Every moment was curated with such care. I found a peace I didn't know existed.",
  },
];

export default function TestimonialsSection() {
  return (
    <Section subtitle="Voices of the Trail" title="What Our Explorers Say">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, index) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="p-10 glass rounded-3xl relative"
          >
            <Quote className="text-gold/20 absolute top-8 right-8" size={48} />
            <div className="flex space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-gold text-gold" />
              ))}
            </div>
            <p className="text-white/80 text-lg font-serif italic mb-8 leading-relaxed">
              "{t.content}"
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gold font-serif text-xl">
                {t.name[0]}
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">{t.name}</h4>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
