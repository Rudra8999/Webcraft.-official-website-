import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export default function OpeningAnimation({ onComplete }: OpeningAnimationProps) {
  const [isAssembled, setIsAssembled] = useState(false);
  const text = "webcraft.";
  const letters = text.split("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAssembled(true);
    }, 3500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden">
      <div className="relative flex">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            initial={{ 
              opacity: 0, 
              x: Math.random() * 400 - 200, 
              y: Math.random() * 400 - 200,
              scale: 0,
              rotate: Math.random() * 360
            }}
            animate={{ 
              opacity: 1, 
              x: 0, 
              y: 0,
              scale: 1,
              rotate: 0
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            className={`text-6xl md:text-8xl font-serif font-medium tracking-tighter ${
              letter === '.' ? 'text-brand-blue' : 'text-white'
            }`}
          >
            {letter}
          </motion.span>
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isAssembled ? 0.3 : 0 }}
        className="absolute bottom-12 text-[10px] uppercase tracking-[0.4em] font-sans text-white/50"
      >
        Engineering Digital Excellence
      </motion.div>
    </div>
  );
}
