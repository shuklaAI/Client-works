import { motion } from 'framer-motion';
import Section from '../../components/Section';

const experiences = [
  {
    title: 'The Golden Hour',
    description: 'Witness the first light of dawn painting the peaks in hues of gold and crimson.',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1000',
  },
  {
    title: 'Starry Nights',
    description: 'Gather around the warmth of a crackling bonfire under a blanket of a billion stars.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000',
  },
  {
    title: 'Summit Moments',
    description: 'The silence of the peak, the weight of the world below, and the clarity of the soul.',
    image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1000',
  },
];

export default function ExperienceSection() {
  return (
    <Section id="experience" className="bg-slate-950" subtitle="The Experience" title="Beyond the Trail">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {experiences.map((exp, index) => (
          <motion.div
            key={exp.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="group"
          >
            <div className="relative h-[400px] overflow-hidden rounded-2xl mb-8">
              <img
                src={exp.image}
                alt={exp.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/0 transition-colors duration-500" />
            </div>
            <h3 className="text-2xl font-serif text-white mb-4">{exp.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed font-light">{exp.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
