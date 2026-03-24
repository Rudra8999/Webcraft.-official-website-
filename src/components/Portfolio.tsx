import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, Loader2, ShoppingCart, Heart, Eye, Info } from 'lucide-react';
import { Project } from '../types';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useCart } from '../context/CartContext';

export default function Portfolio() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { cart, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleWishlist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleCart = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    const isInCart = cart.some(item => item.id === project.id);
    if (isInCart) {
      removeFromCart(project.id!);
    } else {
      addToCart({
        id: project.id!,
        title: project.title,
        price: project.price || 0,
        image: project.imageUrl
      });
    }
  };

  return (
    <section id="templates" className="py-32 bg-black min-h-screen overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-20">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Our Templates</span>
            <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">Premium <br />Web Designs</h2>
          </div>
          <p className="text-white/50 max-w-xs text-sm leading-relaxed">
            Choose from our curated collection of high-performance templates designed for modern businesses.
          </p>
        </div>
      </div>

      {/* Auto Scroll Marquee */}
      {!loading && projects.length > 0 && (
        <div className="relative flex overflow-x-hidden border-y border-white/5 py-12 mb-20 bg-zinc-950/50">
          <div className="animate-marquee flex whitespace-nowrap gap-8">
            {[...projects, ...projects].map((project, i) => (
              <div key={`${project.id}-marquee-${i}`} className="flex items-center gap-4 px-8">
                <span className="text-4xl md:text-6xl font-serif text-white/10 uppercase italic">{project.title}</span>
                <div className="w-2 h-2 rounded-full bg-brand-blue" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="text-brand-blue animate-spin" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.length > 0 ? projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedProject(project)}
                className="group relative aspect-[4/5] overflow-hidden bg-zinc-900 cursor-pointer border border-white/5"
              >
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating Actions */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                  <button 
                    onClick={(e) => toggleWishlist(e, project.id!)}
                    className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all ${wishlist.includes(project.id!) ? 'bg-red-500 text-white border-red-500' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}
                  >
                    <Heart size={18} fill={wishlist.includes(project.id!) ? 'currentColor' : 'none'} />
                  </button>
                  <button 
                    onClick={(e) => toggleCart(e, project)}
                    className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all ${cart.some(item => item.id === project.id) ? 'bg-brand-blue text-white border-brand-blue' : 'bg-black/40 text-white hover:bg-white hover:text-black'}`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                  {project.demoUrl && (
                    <a 
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition-all"
                    >
                      <Eye size={18} />
                    </a>
                  )}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-3xl font-serif">{project.title}</h3>
                    <div className="flex flex-col items-end">
                      <span className="text-brand-blue font-bold text-xl">₹{project.price || 0}</span>
                      <span className="text-[8px] text-white/30 uppercase tracking-widest">One-time payment</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-white/40 text-[9px] uppercase tracking-[0.2em] font-bold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-brand-blue" />
                      <span>Responsive</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-brand-blue" />
                      <span>SEO Ready</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-20 text-center border border-white/5 bg-zinc-900/20">
                <p className="text-white/30 uppercase tracking-[0.3em] text-xs font-bold italic">No templates available yet... Coming Soon</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 max-w-5xl w-full max-h-[90vh] overflow-y-auto no-scrollbar relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-6 right-6 text-white/50 hover:text-white z-10"
              >
                <X size={32} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="aspect-square lg:aspect-auto">
                  <img
                    src={selectedProject.imageUrl}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-12 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold block">Template Details</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40">Available Now</span>
                    </div>
                  </div>
                  <h3 className="text-5xl font-serif mb-8">{selectedProject.title}</h3>
                  <div className="grid grid-cols-2 gap-8 mb-12">
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/30">Price</p>
                      <p className="text-2xl font-bold text-brand-blue">₹{selectedProject.price || 0}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-white/30">License</p>
                      <p className="text-xs uppercase tracking-widest font-bold">Commercial</p>
                    </div>
                  </div>
                  <p className="text-white/60 leading-relaxed mb-12 text-lg">
                    {selectedProject.description}
                  </p>
                  <div className="flex flex-wrap gap-6">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.2em] font-bold group bg-white text-black px-8 py-4 hover:bg-brand-blue hover:text-white transition-all"
                      >
                        Live Preview 
                        <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </a>
                    )}
                    {selectedProject.demoUrl && (
                      <a
                        href={selectedProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 text-xs uppercase tracking-[0.2em] font-bold group border border-white/10 px-8 py-4 hover:bg-white/5 transition-all"
                      >
                        Demo Link
                        <Eye size={16} />
                      </a>
                    )}
                    <button
                      onClick={(e) => toggleCart(e, selectedProject)}
                      className={`inline-flex items-center gap-4 text-xs uppercase tracking-[0.2em] font-bold group px-8 py-4 transition-all ${cart.some(item => item.id === selectedProject.id) ? 'bg-brand-blue text-white' : 'bg-white/5 text-white hover:bg-white hover:text-black'}`}
                    >
                      {cart.some(item => item.id === selectedProject.id) ? 'In Cart' : 'Add to Cart'}
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
