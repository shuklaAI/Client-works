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
      alert("Message sent successfully 🚀");
      setFormData({ name: '', phone: '', email: '', message: '' });
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
<section className="relative h-[40vh] w-full overflow-hidden">
<img src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=2000" alt="Contact" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
<div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/60 to-charcoal" />
<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
<motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.5em] text-gold font-semibold mb-4">We're Right Here</motion.span>
<motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-5xl md:text-7xl font-serif text-white leading-tight">Get in Touch</motion.h1>
</div>
</section>

<div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16">  
      
<motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-12">  
{/* SAME LEFT SIDE — untouched */}  
<div>
<span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold mb-4 block">Find Us</span>
<h2 className="text-4xl font-serif text-white mb-6">Let's Plan Your <span className="italic font-light">Mountain Journey</span></h2>
<p className="text-white/50 leading-relaxed font-light">
Whether you have questions about a specific trek, want a custom group itinerary, or just want to know if the trail is open — we're here. Drop us a message or call us directly.
</p>
</div>

<div className="space-y-8">
{[
{
icon: <MapPin size={20} className="text-gold" />,
label: 'Base Camp',
value: 'Gali No 8, A Block, Hans Residential Colony, Kamalpur Buradi, Delhi – 110084'
},
{
icon: <Phone size={20} className="text-gold" />,
label: 'Call / WhatsApp',
value: '88593 32491'
},
{
icon: <Mail size={20} className="text-gold" />,
label: 'Email',
value: 'himgathatravel@gmail.com'
},
{
icon: <Clock size={20} className="text-gold" />,
label: 'Response Time',
value: 'We reply within 2 hours, 9am–8pm IST'
},
].map(({ icon, label, value }) => (
<div key={label} className="flex items-start space-x-5">
<div className="p-3 bg-white/5 rounded-xl shrink-0">{icon}</div>
<div>
<p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{label}</p>

{label === 'Call / WhatsApp' ? (
<a href="https://wa.me/918859332491" target="_blank" rel="noopener noreferrer" className="text-white text-sm hover:underline">
{value}
</a>
) : label === 'Email' ? (
<a href="mailto:himgathatravel@gmail.com" className="text-white text-sm hover:underline">
{value}
</a>
) : (
<p className="text-white text-sm">{value}</p>
)}
</div>
</div>
))}
</div>

<div className="flex space-x-4">
<a href="https://wa.me/918859332491?text=Hi%20I%20am%20interested%20in%20your%20treks" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs uppercase tracking-widest hover:bg-emerald-500/30 transition-all">
<MessageCircle size={16} />
<span>WhatsApp Us</span>
</a>

<a href="https://www.instagram.com/himgatha_trails?igsh=MTl1d3QxdHNyaGNodw==" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 px-6 py-3 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-400 text-xs uppercase tracking-widest hover:bg-pink-500/30 transition-all">
<Instagram size={16} />
<span>Instagram</span>
</a>
</div>
</motion.div>

{/* ✅ ONLY CHANGE: WRAPPED FORM */}
<motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="glass p-10 rounded-3xl">
<h3 className="text-2xl font-serif text-white mb-8">Send Us a Message</h3>

<form onSubmit={handleSubmit} className="space-y-6">

<div className="grid grid-cols-2 gap-4">
<input type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold" />
<input type="tel" placeholder="Phone / WhatsApp" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold" />
</div>

<input type="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold" />

<textarea rows={4} placeholder="Your Message..." value={formData.message} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-gold resize-none" />

<button type="submit" disabled={loading} className="w-full py-5 bg-gold text-charcoal text-xs uppercase tracking-[0.3em] font-bold rounded-full hover:bg-white transition-all disabled:opacity-50">
{loading ? "Sending..." : "Send Message"}
</button>

</form>
</motion.div>

</div>
</div>
);
}