import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function Footer() {
  return (
    <footer id="contact" className="bg-slate-950 pt-24 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
        
        {/* Brand */}
        <div className="space-y-8">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Himgatha Trails" className="h-20 w-auto object-contain" />
          </Link>

          <p className="text-white/40 text-sm leading-relaxed font-light">
            Curating premium Himalayan trekking experiences across Himachal Pradesh & Uttarakhand for the modern Indian explorer.
          </p>

          {/* Social Icons */}
          <div className="flex space-x-6">
            <a
              href="https://www.instagram.com/himgatha_trails?igsh=MTl1d3QxdHNyaGNodw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-gold transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Facebook size={20} /></a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-white/40 hover:text-gold transition-colors"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-serif text-xl mb-8">Explore</h4>
          <ul className="space-y-4">
            <li><Link to="/treks" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest">All Treks</Link></li>
            <li><Link to="/experience" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest">The Experience</Link></li>
            <li><Link to="/about" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest">Our Story</Link></li>
            <li><a href="#" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest">Safety First</a></li>
            <li><a href="#" className="text-white/40 hover:text-white transition-colors text-sm uppercase tracking-widest">Sustainability</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-serif text-xl mb-8">Contact</h4>
          <ul className="space-y-6">

            <li className="flex items-start space-x-4">
              <MapPin size={18} className="text-gold shrink-0 mt-1" />
              <span className="text-white/40 text-sm leading-relaxed">
                Gali No 8, A Block, Hans Residential Colony, Kamalpur Buradi, Delhi – 110084
              </span>
            </li>

            <li className="flex items-center space-x-4">
              <Phone size={18} className="text-gold shrink-0" />
              <a
                href="https://wa.me/918859332491"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 text-sm hover:text-white transition-colors"
              >
                +91 88593 32491
              </a>
            </li>

            <li className="flex items-center space-x-4">
              <Mail size={18} className="text-gold shrink-0" />
              <a
                href="mailto:himgathatravel@gmail.com"
                className="text-white/40 text-sm hover:text-white transition-colors"
              >
                himgathatravel@gmail.com
              </a>
            </li>

          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white font-serif text-xl mb-8">Newsletter</h4>
          <p className="text-white/40 text-sm mb-6 font-light">
            Join our community of explorers and get the latest trail updates.
          </p>

          <div className="relative">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:outline-none focus:border-gold transition-colors"
            />
            <button className="absolute right-2 top-2 bottom-2 px-6 bg-gold text-charcoal text-[10px] uppercase tracking-widest font-bold rounded-full hover:bg-white transition-all duration-300">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-7xl mx-auto pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <p className="text-white/20 text-[10px] uppercase tracking-widest">
          © 2026 Himgatha Trails. All Rights Reserved.
        </p>

        <div className="flex space-x-8">
          <Link to="/privacy-policy" className="text-white/20 hover:text-white transition-colors text-[10px] uppercase tracking-widest">
            Privacy Policy
          </Link>
          <a href="#" className="text-white/20 hover:text-white transition-colors text-[10px] uppercase tracking-widest">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}