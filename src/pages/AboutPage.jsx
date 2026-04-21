import { motion } from 'framer-motion';
import { Compass, Star, Mountain, Heart, Shield, Users } from 'lucide-react';
import Section from '../components/Section';

const testimonials = [
  { name: 'Arjun Mehta', role: 'Software Engineer, Bengaluru', content: 'Hampta Pass with Himgatha was a soul-changing experience. Bhupesh bhaiya (our guide) knew every stone on the trail. The camp food was better than most Manali restaurants!' },
  { name: 'Priya Sharma', role: 'Yoga Teacher, Delhi', content: 'Finally a trek company that understands the Indian trekker. They sorted everything — permits, meals, even arranged for hot water in the mornings at 4000m. Absolutely fabulous.' },
  { name: 'Rohan Kapoor', role: 'Entrepreneur, Mumbai', content: 'Took my whole team of 12 for Beas Kund. Every single person came back transformed. Himgatha\'s organisation and local expertise is unmatched in Himachal.' },
  { name: 'Kavya Nair', role: 'Doctor, Kochi', content: 'As a solo female trekker, safety was my top priority. The team was professional, respectful, and incredibly supportive throughout the Kheerganga trek. Will definitely return.' },
  { name: 'Vikram Singh', role: 'Army Officer, Dehradun', content: 'I\'ve trekked across the Himalayas, but Himgatha\'s attention to detail sets them apart. The local knowledge, the storytelling around the fire — it\'s more than a trek, it\'s a journey home.', },
  { name: 'Ananya Joshi', role: 'Student, Pune', content: 'Did Chandratal with friends — it was our first high-altitude trek. Himgatha held our hands through every step. The sunset over the lake was beyond words. Best decision of my life.' },
];

const values = [
  { icon: <Mountain size={28} />, title: 'Mountain First', desc: 'We operate with deep respect for the Himalayas — Leave No Trace is not a rule for us, it\'s a way of life.' },
  { icon: <Heart size={28} />, title: 'Local Love', desc: 'All our guides are from Himachal Pradesh. We hire locally, pay fairly, and share stories that textbooks never tell.' },
  { icon: <Shield size={28} />, title: 'Safety Always', desc: 'NIMAS-certified guides, wilderness first-aid trained staff, and satellite phones on every trek.' },
  { icon: <Users size={28} />, title: 'Small Groups', desc: 'We cap groups at 12 to protect the trail and give each trekker the personal attention they deserve.' },
];

export default function AboutPage() {
  return (
    <div className="bg-charcoal min-h-screen">
      <section className="relative h-[50vh] w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&q=80&w=2000" alt="About" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/50 to-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">Our Philosophy</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-serif text-white leading-tight">Our Story</motion.h1>
        </div>
      </section>

      {/* Story */}
      <Section fullWidth className="py-0 overflow-visible">
        <div className="flex flex-col lg:flex-row items-stretch">
          <div className="lg:w-1/2 relative h-[600px] lg:h-auto">
            <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1000" alt="Our Story" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-charcoal/20" />
          </div>
          <div className="lg:w-1/2 bg-charcoal p-12 md:p-24 flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold mb-6">Born from the Mountains</span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
              Crafting Memories <br /><span className="italic font-light">In the High Altitudes.</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-6 font-light">
              Himgatha Trails was born on a cold September morning at 4,200 metres on the Hampta Pass, when our founder Rahul Verma realised that most Indian trekkers deserved far better than what the market offered — rushed itineraries, unsafe equipment, and zero local connection.
            </p>
            <p className="text-white/60 text-base leading-relaxed mb-10 font-light">
              Today, operating out of Manali, we've taken over 2,000 Indians into the mountains of Himachal Pradesh. Every trek we run is intimate, thoughtfully curated, and led by guides who grew up in these very ranges.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[{ icon: <Compass size={24} />, t: 'Expert Guides', d: 'NIMAS-certified, local born.' }, { icon: <Star size={24} />, t: 'Premium Gear', d: 'Best-in-class equipment only.' }].map(({ icon, t, d }) => (
                <div key={t} className="flex items-start space-x-4">
                  <div className="p-3 bg-white/5 rounded-xl text-gold">{icon}</div>
                  <div><h4 className="text-white font-serif text-lg mb-1">{t}</h4><p className="text-white/40 text-xs">{d}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Values */}
      <Section subtitle="What We Stand For" title="Our Values" className="bg-slate-950">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="p-8 glass rounded-2xl text-center">
              <div className="text-gold mb-4 flex justify-center">{v.icon}</div>
              <h4 className="text-white font-serif text-xl mb-3">{v.title}</h4>
              <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section subtitle="Voices of the Trail" title="What Our Explorers Say">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="p-10 glass rounded-3xl relative">
              <div className="flex space-x-1 mb-6">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-gold text-gold" />)}
              </div>
              <p className="text-white/80 text-lg font-serif italic mb-8 leading-relaxed">"{t.content}"</p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-gold font-serif text-xl">{t.name[0]}</div>
                <div>
                  <h4 className="text-white font-medium text-sm">{t.name}</h4>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
}
