import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Instagram, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.placeholder.includes("Name") ? "name" :
       e.target.placeholder.includes("Phone") ? "phone" :
       e.target.placeholder.includes("Email") ? "email" :
       "message"]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('phone', formData.phone);
      data.append('email', formData.email);
      data.append('message', formData.message);
      data.append('_subject', 'New Trek Inquiry - Himgatha Trails');
      data.append('_template', 'table');
      data.append('_captcha', 'false');

      const res = await fetch('https://formsubmit.co/himgathatravel@gmail.com', {
        method: 'POST',
        body: data,
      });

      if (res.ok) {
        alert("Message sent 🚀");
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        alert("Failed to send");
      }

    } catch (err) {
      console.error(err);
      alert("Network error");
    }

    setLoading(false);
  };

  return (
    <div className="bg-charcoal min-h-screen">

      {/* HERO */}
      <section className="relative h-[40vh] w-full overflow-hidden">
        <img src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=2000" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/60 to-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">We're Right Here</motion.span>
          <motion.h1 className="text-5xl md:text-7xl font-serif text-white">Get in Touch</motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* LEFT SIDE SAME */}
        <motion.div className="space-y-12">
          {/* keep your existing content EXACTLY same */}
        </motion.div>

        {/* ✅ FORM (UI SAME, just wrapped in form + logic) */}
        <motion.div className="glass p-10 rounded-3xl">
          <h3 className="text-2xl font-serif text-white mb-8">Send Us a Message</h3>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20"
              />

              <input
                type="tel"
                placeholder="Phone / WhatsApp"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20"
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20"
            />

            <textarea
              rows={4}
              placeholder="Your Message..."
              value={formData.message}
              onChange={handleChange}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 resize-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gold text-charcoal text-xs uppercase tracking-[0.3em] font-bold rounded-full hover:bg-white transition-all disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>
        </motion.div>

      </div>
    </div>
  );
}