import { motion } from 'framer-motion';
import TrekCard from '../components/TrekCard';
import Section from '../components/Section';

const allTreks = [
  { id: '1', title: 'Hampta Pass Trek', location: 'Kullu–Manali, Himachal Pradesh', duration: '5 Days', difficulty: 'Moderate', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000', price: '₹14,500' },
  { id: '2', title: 'Beas Kund Trek', location: 'Manali, Himachal Pradesh', duration: '4 Days', difficulty: 'Easy–Moderate', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000', price: '₹9,999' },
  { id: '3', title: 'Bhrigu Lake Trek', location: 'Manali, Himachal Pradesh', duration: '4 Days', difficulty: 'Moderate', image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1000', price: '₹11,500' },
  { id: '4', title: 'Kheerganga Trek', location: 'Parvati Valley, Himachal Pradesh', duration: '2 Days', difficulty: 'Easy', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1000', price: '₹6,500' },
  { id: '5', title: 'Chandratal Lake Trek', location: 'Spiti Valley, Himachal Pradesh', duration: '6 Days', difficulty: 'Moderate–Difficult', image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1000', price: '₹18,000' },
  { id: '6', title: 'Pin Parvati Pass', location: 'Spiti, Himachal Pradesh', duration: '10 Days', difficulty: 'Difficult', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1000', price: '₹28,500' },
  { id: '7', title: 'Triund Trek', location: 'Dharamshala, Himachal Pradesh', duration: '2 Days', difficulty: 'Easy', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000', price: '₹5,500' },
  { id: '8', title: 'Rupin Pass Trek', location: 'Kinnaur, Himachal Pradesh', duration: '8 Days', difficulty: 'Difficult', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&q=80&w=1000', price: '₹22,000' },
  { id: '9', title: 'Roopkund Lake Trek', location: 'Uttarakhand', duration: '8 Days', difficulty: 'Moderate–Difficult', image: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=1000', price: '₹16,500' },
];

export default function TreksPage() {
  return (
    <div className="bg-charcoal min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=2000" alt="Treks" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/50 to-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">
            Himachal Pradesh & Beyond
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl font-serif text-white leading-tight">
            All Expeditions
          </motion.h1>
        </div>
      </section>

      <Section subtitle="Choose Your Adventure" title="Our Trek Collection">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allTreks.map((trek, index) => (
            <motion.div key={trek.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.07 }}>
              <TrekCard {...trek} />
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
