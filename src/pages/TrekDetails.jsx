import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Mountain, CheckCircle2, Calendar, ShieldCheck, Users, Info, Star } from 'lucide-react';

const trekData = {
  '1': {
    title: 'Hampta Pass Trek',
    location: 'Kullu–Manali, Himachal Pradesh',
    duration: '5 Days',
    difficulty: 'Moderate',
    altitude: '4,270 m',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=2000',
    price: '₹14,500',
    description: 'The Hampta Pass trek is a dramatic crossover from the lush green Kullu Valley to the stark, barren moonscape of Spiti. This short but stunning trek packs in alpine meadows, glacial rivers, dramatic passes, and possibly the most dramatic landscape contrast in all of Himachal Pradesh.',
    itinerary: [
      { day: 'Day 1', title: 'Manali to Jobra Camp', description: 'Drive to Jobra (2,950m) and an easy warm-up walk to basecamp through deodar forests.' },
      { day: 'Day 2', title: 'Jobra to Balu Ka Ghera', description: 'Trek through the wide meadows of Chika, passing the Rani Nallah river. Camp at 3,600m.' },
      { day: 'Day 3', title: 'Balu Ka Ghera to Shea Goru via Hampta Pass', description: 'The big day. Cross the Hampta Pass (4,270m) and descend dramatically into Lahaul. Views of Indrasan and Deo Tibba.' },
      { day: 'Day 4', title: 'Shea Goru to Chhatru', description: 'Walk through the moonscape of Lahaul to the confluence point at Chhatru. Optional: Drive to Chandratal Lake.' },
      { day: 'Day 5', title: 'Chhatru back to Manali', description: 'Drive back over Rohtang to Manali, carrying memories that last a lifetime.' },
    ],
    highlights: [
      'Dramatic contrast: green Kullu Valley vs barren Spiti',
      'Views of Indrasan, Deo Tibba, and Pir Panjal range',
      'Optional extension to the stunning Chandratal Lake',
      'High meadows of Chika and Balu Ka Ghera',
    ],
    inclusions: [
      'Premium waterproof tents and -10°C sleeping bags',
      'NIMAS-certified guide from Himachal Pradesh',
      'Nutritious Himachali meals — all breakfasts, lunches, dinners',
      'Forest & Rohtang permits included',
      'Porter support for your luggage',
      'Emergency oxygen and first-aid kit',
    ],
  },
  '2': {
    title: 'Beas Kund Trek',
    location: 'Manali, Himachal Pradesh',
    duration: '4 Days',
    difficulty: 'Easy–Moderate',
    altitude: '3,890 m',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000',
    price: '₹9,999',
    description: 'Beas Kund is the high-altitude glacial lake that is the source of the mighty Beas River. A perfect beginner trek in the Manali region, it takes you through lush alpine meadows with stunning views of Hanuman Tibba, Lady of Keylong, and the Pir Panjal range. Ideal for first-timers.',
    itinerary: [
      { day: 'Day 1', title: 'Manali to Dhundi Camp', description: 'Short drive to Solang Valley trailhead. Begin trek to Dhundi, crossing beautiful streams.' },
      { day: 'Day 2', title: 'Dhundi to Bakarthach Meadows', description: 'Walk through pine forests and open meadows. Camp at the stunning Bakarthach ground.' },
      { day: 'Day 3', title: 'Bakarthach to Beas Kund & Back', description: 'Summit day — reach the sacred Beas Kund (3,890m) with views of Hanuman Tibba. Descend to camp.' },
      { day: 'Day 4', title: 'Bakarthach to Manali', description: 'Leisurely descent back through forests and meadows to Solang Valley and Manali.' },
    ],
    highlights: [
      'Source of the sacred Beas River at 3,890m',
      'Views of Hanuman Tibba and Lady of Keylong',
      'Stunning Bakarthach and Swaragini meadows',
      'Perfect beginner trek — no prior experience needed',
    ],
    inclusions: [
      'Quality tents and sleeping bags',
      'Certified local guide',
      'All meals on trek (breakfast, lunch, dinner)',
      'Forest department permits',
      'First aid and safety equipment',
    ],
  },
};

// Default for all other IDs
const defaultTrek = trekData['1'];

export default function TrekDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const trek = trekData[id] || defaultTrek;

  return (
    <div className="bg-charcoal min-h-screen">
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={trek.image} alt={trek.title} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/20 via-charcoal/40 to-charcoal" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="absolute top-32 left-8 md:left-12 flex items-center space-x-2 text-white/60 hover:text-white transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Back</span>
          </motion.button>
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-xs md:text-sm uppercase tracking-[0.5em] text-gold font-semibold mb-6">{trek.location}</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-8 leading-tight max-w-4xl">{trek.title}</motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="flex flex-wrap justify-center gap-8 md:gap-16 mt-4">
            {[
              { icon: <Clock size={24} className="text-gold mb-2" />, label: 'Duration', value: trek.duration },
              { icon: <Mountain size={24} className="text-gold mb-2" />, label: 'Difficulty', value: trek.difficulty },
              { icon: <Calendar size={24} className="text-gold mb-2" />, label: 'Max Altitude', value: trek.altitude || 'Varies' },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex flex-col items-center">
                {icon}
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</span>
                <span className="text-lg font-serif text-white">{value}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-20">
          <section>
            <h2 className="text-3xl font-serif text-white mb-8 flex items-center space-x-4"><span className="w-12 h-[1px] bg-gold" /><span>The Journey</span></h2>
            <p className="text-white/60 text-lg leading-relaxed font-light italic">{trek.description}</p>
          </section>

          <section>
            <h2 className="text-3xl font-serif text-white mb-12 flex items-center space-x-4"><span className="w-12 h-[1px] bg-gold" /><span>Itinerary</span></h2>
            <div className="space-y-12 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
              {trek.itinerary.map((item, index) => (
                <motion.div key={item.day} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="relative pl-16 group">
                  <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-charcoal border border-white/20 flex items-center justify-center text-[10px] font-bold text-gold group-hover:border-gold transition-colors duration-300">{index + 1}</div>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                    <h4 className="text-xl font-serif text-white">{item.title}</h4>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">{item.day}</span>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-serif text-white mb-8 flex items-center space-x-4"><span className="w-8 h-[1px] bg-gold" /><span>Highlights</span></h2>
              <ul className="space-y-4">
                {trek.highlights.map((h) => (
                  <li key={h} className="flex items-start space-x-3 text-white/60 text-sm">
                    <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" /><span>{h}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-serif text-white mb-8 flex items-center space-x-4"><span className="w-8 h-[1px] bg-gold" /><span>Inclusions</span></h2>
              <ul className="space-y-4">
                {trek.inclusions.map((item) => (
                  <li key={item} className="flex items-start space-x-3 text-white/60 text-sm">
                    <ShieldCheck size={18} className="text-gold shrink-0 mt-0.5" /><span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-32 glass p-8 rounded-3xl space-y-8">
            <div className="flex justify-between items-end pb-6 border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Price per person</span>
                <span className="text-4xl font-serif text-white">{trek.price}</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold">All Inclusive</span>
            </div>
            <div className="space-y-6">
              {[
                { icon: <Users size={18} />, label: 'Group Size', value: 'Max 12 persons' },
                { icon: <Calendar size={18} />, label: 'Best Season', value: 'May – October' },
                { icon: <Info size={18} />, label: 'Availability', value: 'Limited Slots' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-3 text-white/60">{icon}<span>{label}</span></div>
                  <span className={label === 'Availability' ? 'text-emerald-400 font-medium' : 'text-white font-medium'}>{value}</span>
                </div>
              ))}
            </div>
            <a
            href={`https://wa.me/918859332491?text=${encodeURIComponent(
              `Hi, I'm interested in the ${trek.title}.
            Location: ${trek.location}
            Duration: ${trek.duration}
            Price: ${trek.price}
            
            Please share full itinerary, availability, and booking details.`
              )}`}
              target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-5 bg-gold text-charcoal text-xs uppercase tracking-[0.3em] font-bold rounded-full hover:bg-white transition-all duration-300 shadow-xl shadow-gold/10 text-center"
            >
            Book on WhatsApp
            </a>
            <p className="text-[10px] text-center text-white/30 uppercase tracking-widest">Secure payment via UPI, NEFT, or Card</p>
            <div className="pt-6 border-t border-white/10 flex items-center justify-center space-x-6 text-white/40">
              <div className="flex flex-col items-center"><ShieldCheck size={20} className="mb-1" /><span className="text-[8px] uppercase tracking-tighter">Safe Travel</span></div>
              <div className="flex flex-col items-center"><Star size={20} className="mb-1" /><span className="text-[8px] uppercase tracking-tighter">5-Star Rated</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
