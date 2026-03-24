import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Phone } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contact" className="py-32 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Get in Touch</span>
            <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-12">Let's Build <br />Something Iconic</h2>
            
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-brand-blue">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">WhatsApp</h4>
                  <p className="text-xl font-serif">+91 7620308314</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-brand-blue">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">Secondary Contact</h4>
                  <p className="text-xl font-serif">+91 92847 07118</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-12 border border-white/5">
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Name</label>
                  <input
                    type="text"
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors font-sans"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Email</label>
                  <input
                    type="email"
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors font-sans"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Project Type</label>
                <select className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors font-sans appearance-none">
                  <option className="bg-black">Web Development</option>
                  <option className="bg-black">Brand Identity</option>
                  <option className="bg-black">E-commerce</option>
                  <option className="bg-black">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Message</label>
                <textarea
                  rows={4}
                  className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors font-sans resize-none"
                  placeholder="Tell us about your vision..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-6 bg-white text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-white/90 transition-all"
              >
                Send Inquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
