import React from 'react';
import { motion } from 'motion/react';
import { Trash2, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, total } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag size={32} className="text-white/20" />
        </div>
        <h2 className="text-3xl font-serif mb-4">Your cart is empty</h2>
        <p className="text-white/40 mb-8 uppercase tracking-widest text-xs">Explore our premium templates to get started</p>
        <a 
          href="#templates" 
          className="px-8 py-4 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2"
        >
          Browse Templates <ArrowRight size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <a href="#" className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </a>
          <h1 className="text-4xl md:text-6xl font-serif">Shopping Bag</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id}
                className="flex gap-6 p-6 bg-zinc-950 border border-white/5 group"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden bg-zinc-900">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-serif mb-1">{item.title}</h3>
                    <p className="text-xs text-white/40 uppercase tracking-widest">Premium Template License</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-blue font-bold">₹{item.price}</span>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-white/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="p-8 bg-zinc-950 border border-white/5">
              <h3 className="text-xs uppercase tracking-[0.3em] text-white/40 mb-8">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Platform Fee</span>
                  <span>₹0</span>
                </div>
                <div className="h-px bg-white/5 my-4" />
                <div className="flex justify-between text-lg font-serif">
                  <span>Total</span>
                  <span className="text-brand-blue">₹{total}</span>
                </div>
              </div>
              <a 
                href="#checkout" 
                className="w-full py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={14} />
              </a>
            </div>
            
            <p className="text-[10px] text-white/20 uppercase tracking-widest text-center leading-relaxed">
              Secure checkout powered by Webcraft. All digital assets are delivered instantly upon successful payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
