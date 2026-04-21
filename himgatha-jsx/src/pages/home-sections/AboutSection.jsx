import { Compass, Star } from 'lucide-react';
import Section from '../../components/Section';

export default function AboutSection() {
  return (
    <Section id="about" className="py-0 overflow-visible" fullWidth>
      <div className="flex flex-col lg:flex-row items-stretch">
        <div className="lg:w-1/2 relative h-[600px] lg:h-auto">
          <img
            src="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?auto=format&fit=crop&q=80&w=1000"
            alt="Our Story"
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-charcoal/20" />
        </div>
        <div className="lg:w-1/2 bg-charcoal p-12 md:p-24 flex flex-col justify-center">
          <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold mb-6">Our Philosophy</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white mb-8 leading-tight">
            Crafting Memories <br />
            <span className="italic font-light">In the High Altitudes.</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg leading-relaxed mb-10 font-light max-w-xl">
            Himgatha Trails was born out of a deep love for the mountains and a desire to provide a trekking experience that respects the majesty of the Himalayas while offering the comfort and luxury our guests deserve.
          </p>
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-xl text-gold">
                <Compass size={24} />
              </div>
              <div>
                <h4 className="text-white font-serif text-lg mb-1">Expert Guides</h4>
                <p className="text-white/40 text-xs">Certified local experts with decades of experience.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-xl text-gold">
                <Star size={24} />
              </div>
              <div>
                <h4 className="text-white font-serif text-lg mb-1">Premium Gear</h4>
                <p className="text-white/40 text-xs">Top-of-the-line equipment for safety and comfort.</p>
              </div>
            </div>
          </div>
          <button className="w-fit px-10 py-4 border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white hover:text-charcoal transition-all duration-300">
            Learn More About Us
          </button>
        </div>
      </div>
    </Section>
  );
}
