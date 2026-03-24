import React from 'react';
import { motion } from 'motion/react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          <h1 className="text-6xl md:text-8xl font-serif font-medium leading-[1.1] tracking-tight mb-8">
            Premium Web <br />
            <span className="italic">Experiences</span>
          </h1>
          <p className="text-lg md:text-xl font-sans text-white/60 max-w-lg mb-12 leading-relaxed">
            We engineer high-end digital solutions for visionary brands. 
            Minimal design, powerful performance, intentional results.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6">
            <a
              href="#work"
              className="px-10 py-5 bg-white text-black text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-all text-center"
            >
              Browse Our Work
            </a>
            <a
              href="#contact"
              className="px-10 py-5 border border-white/20 text-white text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/5 transition-all text-center"
            >
              Get Your Website
            </a>
          </div>
        </motion.div>

        {/* Right Side: Abstract Visual */}
        <div className="relative h-[400px] lg:h-[600px] flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative w-full h-full"
          >
            {/* Abstract Metallic Blobs (CSS implementation) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96">
              <motion.div
                animate={{
                  borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black border border-white/10 shadow-[0_0_100px_rgba(255,255,255,0.05)]"
              />
              <motion.div
                animate={{
                  borderRadius: ["60% 40% 30% 70% / 50% 30% 70% 50%", "70% 30% 50% 50% / 30% 70% 40% 60%", "60% 40% 30% 70% / 50% 30% 70% 50%"],
                  rotate: [360, 270, 180, 90, 0]
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 w-full h-full bg-gradient-to-tl from-zinc-700/20 via-transparent to-zinc-800/20 border border-white/5 mix-blend-overlay"
              />
            </div>
          </motion.div>
          
          {/* Subtle light accents */}
          <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-white/5 blur-[80px] rounded-full" />
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-white/5 blur-[100px] rounded-full" />
        </div>
      </div>
      
      {/* Background Texture */}
      <div className="absolute inset-0 z-[-1] opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>
    </section>
  );
}
