export default function GallerySection() {
  return (
    <section className="relative h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0 flex">
        <div className="w-1/4 h-full overflow-hidden border-r border-white/5">
          <img
            src="https://images.unsplash.com/photo-1544198365-f5d60b6d8190?auto=format&fit=crop&q=80&w=600"
            className="h-full w-full object-cover hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            alt="Himalayan trek"
          />
        </div>
        <div className="w-1/2 h-full overflow-hidden border-r border-white/5">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200"
            className="h-full w-full object-cover hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            alt="Valley of Flowers"
          />
        </div>
        <div className="w-1/4 h-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&q=80&w=600"
            className="h-full w-full object-cover hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            alt="Everest Base Camp"
          />
        </div>
      </div>
      <div className="absolute inset-0 bg-charcoal/40 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <h2 className="text-5xl md:text-8xl font-serif text-white mb-4 tracking-tighter">Immersive Beauty</h2>
          <p className="text-gold text-xs uppercase tracking-[0.5em] font-bold">Captured by Our Explorers</p>
        </div>
      </div>
    </section>
  );
}
