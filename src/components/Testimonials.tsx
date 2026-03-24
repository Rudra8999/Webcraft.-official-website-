import React from 'react';
import { motion } from 'motion/react';

const TESTIMONIALS = [
  {
    name: "Sarah Jenkins",
    role: "Founder, Bloom Digital",
    text: "Webcraft transformed our online presence. The attention to detail and premium feel of their templates is unmatched in the industry."
  },
  {
    name: "Marcus Thorne",
    role: "Creative Director, Studio X",
    text: "The speed and efficiency of the custom build process was incredible. We went from concept to launch in record time."
  },
  {
    name: "Elena Rodriguez",
    role: "CEO, TechFlow",
    text: "Finally, a agency that understands the balance between high-end design and technical performance. Our conversion rates have skyrocketed."
  },
  {
    name: "David Chen",
    role: "Marketing Head, Zenith",
    text: "The ongoing support and the quality of the admin dashboard make managing our site a breeze. Highly recommended for any serious business."
  }
];

export default function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="py-32 bg-zinc-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Client Voices</span>
        <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">Trusted by Visionaries</h2>
      </div>

      <div className="relative flex">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
            <div
              key={i}
              className="w-[400px] md:w-[500px] p-12 bg-black border border-white/5 flex flex-col justify-between"
            >
              <p className="text-lg md:text-xl font-serif italic text-white/80 leading-relaxed mb-12 whitespace-normal">
                "{t.text}"
              </p>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest mb-1">{t.name}</h4>
                <p className="text-xs text-brand-blue uppercase tracking-widest">{t.role}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
