import { motion } from 'framer-motion';
import Section from '../components/Section';

const experiences = [
  { title: 'The Golden Sunrise', description: 'Watch the first light kiss the Dhauladhar and Pir Panjal ranges — a spectacle no photograph can truly capture.', image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Bonfire & Stars', description: 'Gather around a dhuni under a billion stars in the high-altitude meadows of Himachal. Stories, chai, and silence.', image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Summit Clarity', description: 'The moment you crest the pass — lungs burning, soul soaring — and see nothing but the Himalayas in every direction.', image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Village Culture', description: 'Trek through ancient Himachali villages. Share rotis with locals, visit centuries-old temples, and feel the living culture.', image: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Alpine Lakes', description: 'From the moon-like Chandratal to the mythical Bhrigu Lake — these glacial mirrors reflect the sky and your own transformation.', image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=1000' },
  { title: 'Rhododendron Forests', description: 'In May, the forests of Himachal burst into crimson and pink. Walking through blooming bugyals is pure magic.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000' },
];

const inclusions = [
  { icon: '🏕️', title: 'Premium Camping', desc: 'High-quality tents, sleeping bags rated to -10°C, and cozy camp setups at stunning locations.' },
  { icon: '🍽️', title: 'Garhwali & Himachali Meals', desc: 'Nutritious dal-chawal, parathas, and hot soups prepared fresh by our trained camp cooks.' },
  { icon: '🧭', title: 'Expert Local Guides', desc: 'Certified NIMAS guides from Himachal Pradesh with decades of mountain experience.' },
  { icon: '🛡️', title: 'Safety First', desc: 'Satellite communication, first-aid trained staff, and emergency evacuation protocols on every trek.' },
  { icon: '🎒', title: 'Porter Support', desc: 'Dedicated porters carry your load so you can fully enjoy the trail.' },
  { icon: '📸', title: 'Photography Spots', desc: 'Our guides know every hidden angle — you will return with frames worth framing.' },
];

export default function ExperiencePage() {
  return (
    <div className="bg-charcoal min-h-screen">
      <section className="relative h-[50vh] w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=2000" alt="Experience" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/50 to-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">Beyond the Trail</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl font-serif text-white leading-tight">The Experience</motion.h1>
        </div>
      </section>

      <Section subtitle="Moments That Stay Forever" title="What Awaits You">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {experiences.map((exp, index) => (
            <motion.div key={exp.title} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: index * 0.15 }} className="group">
              <div className="relative h-[360px] overflow-hidden rounded-2xl mb-6">
                <img src={exp.image} alt={exp.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/0 transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-serif text-white mb-3">{exp.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed font-light">{exp.description}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section className="bg-slate-950" subtitle="What's Included" title="Trek Inclusions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inclusions.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="p-8 glass rounded-2xl">
              <span className="text-4xl mb-4 block">{item.icon}</span>
              <h4 className="text-white font-serif text-xl mb-3">{item.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
