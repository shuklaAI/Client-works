import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Section from '../../components/Section';
import TrekCard from '../../components/TrekCard';

const featuredTreks = [
  {
    id: '1',
    title: 'Roopkund Lake Expedition',
    location: 'Uttarakhand, India',
    duration: '8 Days',
    difficulty: 'Moderate-Difficult',
    image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1000',
    price: '$1,200',
  },
  {
    id: '2',
    title: 'Valley of Flowers',
    location: 'Uttarakhand, India',
    duration: '6 Days',
    difficulty: 'Easy-Moderate',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    price: '$850',
  },
  {
    id: '3',
    title: 'Everest Base Camp',
    location: 'Khumbu, Nepal',
    duration: '14 Days',
    difficulty: 'Difficult',
    image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1000',
    price: '$2,400',
  },
];

export default function TreksSection() {
  return (
    <Section id="treks" subtitle="Curated Journeys" title="Featured Expeditions">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredTreks.map((trek, index) => (
          <motion.div
            key={trek.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <TrekCard {...trek} />
          </motion.div>
        ))}
      </div>
      <div className="mt-16 text-center">
        <button className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold hover:text-white transition-colors flex items-center mx-auto group">
          View All Treks
          <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </Section>
  );
}
