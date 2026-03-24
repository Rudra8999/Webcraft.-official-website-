import React from 'react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <section id="about" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative aspect-square bg-zinc-900 overflow-hidden"
          >
            <img
              src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1000"
              alt="Studio"
              className="w-full h-full object-cover grayscale opacity-50"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 border-[20px] border-black" />
          </motion.div>

          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">The Studio</span>
            <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-12">Engineering <br />Digital Art</h2>
            <div className="space-y-8 text-white/60 leading-relaxed text-lg">
              <p>
                Webcraft is a boutique digital agency dedicated to the pursuit of digital excellence. We believe that the web should be more than just functional—it should be an experience.
              </p>
              <p>
                Our team of engineers and designers work at the intersection of high-end aesthetics and cutting-edge performance. We don't follow trends; we set the standard for what a premium digital presence should be.
              </p>
              <p>
                Trust is our foundation. Quality is our obsession. Your legacy is our mission.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-2 gap-12">
              <div>
                <span className="text-4xl font-serif block mb-2">100+</span>
                <span className="text-xs uppercase tracking-widest text-white/40">Projects Delivered</span>
              </div>
              <div>
                <span className="text-4xl font-serif block mb-2">12</span>
                <span className="text-xs uppercase tracking-widest text-white/40">Global Awards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
