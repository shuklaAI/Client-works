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
      [e.target.name]: e.target.value
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
        alert("Message sent successfully 🚀");
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        });
      } else {
        alert("Something went wrong. Try again.");
      }

    } catch (err) {
      console.error(err);
      alert("Network error.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-charcoal min-h-screen">

      {/* HERO */}
      <section className="relative h-[40vh] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=2000"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/60 to-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <motion.span className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">
            We're Right Here
          </motion.span>
          <motion.h1 className="text-5xl md:text-7xl font-serif text-white">
            Get in Touch
          </motion.h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">

        {/* LEFT SIDE */}
        <div className="space-y-12">
          <div>
            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold mb-4 block">
              Find Us
            </span>
            <h2 className="text-4xl font-serif text-white mb-6">
              Let's Plan Your <span className="italic font-light">Mountain Journey</span>
            </h2>
            <p className="text-white/50 leading-relaxed font-light">
              Whether you have questions about a trek or want a custom plan — reach out.
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start space-x-5">
              <div className="p-3 bg-white/5 rounded-xl">
                <MapPin className="text-gold" />
              </div>
              <p className="text-white text-sm">
                Delhi, India
              </p>
            </div>

            <div className="flex items-start space-x-5">
              <div className="p-3 bg-white/5 rounded-xl">
                <Phone className="text-gold" />
              </div>
              <p className="text-white text-sm">
                88593 32491
              </p>
            </div>

            <div className="flex items-start space-x-5">
              <div className="p-3 bg-white/5 rounded-xl">
                <Mail className="text-gold" />
              </div>
              <p className="text-white text-sm">
                himgathatravel@gmail.com
              </p>
            </div>

            <div className="flex items-start space-x-5">
              <div className="p-3 bg-white/5 rounded-xl">
                <Clock className="text-gold" />
              </div>
              <p className="text-white text-sm">
                We reply within 2 hours
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4">
            <a
              href="https://wa.me/918859332491"
              target="_blank"
              className="px-6 py-3 bg-emerald-500/20 rounded-full text-emerald-400 text-xs"
            >
              WhatsApp
            </a>

            <a
              href="https://instagram.com/himgatha_trails"
              target="_blank"
              className="px-6 py-3 bg-pink-500/20 rounded-full text-pink-400 text-xs"
            >
              Instagram
            </a>
          </div>
        </div>

        {/* FORM */}
        <motion.div className="glass p-10 rounded-3xl">
          <h3 className="text-2xl font-serif text-white mb-8">
            Send Us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="input"
                required
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone / WhatsApp"
                className="input"
                required
              />
            </div>

            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="input"
              required
            />

            <textarea
              rows={4}
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your Message..."
              className="input resize-none"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gold text-charcoal font-bold rounded-full disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

          </form>
        </motion.div>

      </div>
    </div>
  );
}