import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Clock, Mountain } from 'lucide-react';

export default function TrekCard({ id, title, location, duration, difficulty, image, price }) {
  return (
    <motion.div whileHover={{ y: -10 }} className="group relative h-[500px] w-full overflow-hidden rounded-2xl cursor-pointer">
      <Link to={`/trek/${id}`} className="absolute inset-0 z-10" />
      <div className="absolute inset-0 overflow-hidden">
        <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent opacity-80" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end p-8">
        <div className="flex items-center space-x-2 text-gold text-[10px] uppercase tracking-[0.2em] font-semibold mb-2">
          <MapPin size={12} /><span>{location}</span>
        </div>
        <h3 className="text-3xl font-serif text-white mb-4 group-hover:text-gold transition-colors duration-300">{title}</h3>
        <div className="flex items-center space-x-6 text-white/60 text-[10px] uppercase tracking-[0.15em] mb-6">
          <div className="flex items-center space-x-1.5"><Clock size={12} /><span>{duration}</span></div>
          <div className="flex items-center space-x-1.5"><Mountain size={12} /><span>{difficulty}</span></div>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Starting from</span>
            <span className="text-xl font-serif text-white">{price}</span>
          </div>
          <motion.div whileHover={{ x: 5 }} className="flex items-center space-x-2 text-gold text-[10px] uppercase tracking-[0.2em] font-bold">
            <span>Details</span><ArrowRight size={14} />
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}
