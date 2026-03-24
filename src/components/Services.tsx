import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Smartphone, Zap, Send, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const SERVICES = [
  {
    icon: Globe,
    title: "Corporate Identity",
    description: "High-end corporate websites that establish authority and trust in your industry."
  },
  {
    icon: Smartphone,
    title: "E-Commerce",
    description: "Seamless shopping experiences designed to convert visitors into loyal customers."
  },
  {
    icon: Zap,
    title: "Landing Pages",
    description: "High-conversion landing pages for your marketing campaigns and product launches."
  }
];

export default function Services() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    projectType: '',
    description: '',
    budget: '',
    timeline: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to submit a request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'custom_orders'), {
        ...formData,
        userId: user.uid,
        userEmail: user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      setIsSuccess(true);
      setFormData({ projectType: '', description: '', budget: '', timeline: '' });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="custom" className="py-32 bg-zinc-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 pt-20">
          <div>
            <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Custom Solutions</span>
            <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-12">Tailored to Your <br />Vision</h2>
            
            <div className="space-y-12">
              {SERVICES.map((service, i) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-8 group"
                >
                  <div className="w-16 h-16 bg-white/5 flex items-center justify-center group-hover:bg-brand-blue transition-colors duration-500">
                    <service.icon size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif mb-2">{service.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-sm">
                      {service.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="bg-black p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
            
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-20"
              >
                <CheckCircle2 size={64} className="text-brand-blue mb-6" />
                <h3 className="text-3xl font-serif mb-4">Request Received</h3>
                <p className="text-white/50 mb-8">Our team will review your requirements and get back to you within 24 hours.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="text-xs uppercase tracking-widest font-bold text-brand-blue hover:text-white transition-colors"
                >
                  Submit Another Request
                </button>
              </motion.div>
            ) : (
              <>
                <h3 className="text-3xl font-serif mb-8">Request a Custom Website</h3>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Project Type</label>
                    <select 
                      required
                      value={formData.projectType}
                      onChange={e => setFormData({...formData, projectType: e.target.value})}
                      className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors"
                    >
                      <option value="" disabled className="bg-black">Select Type</option>
                      <option value="corporate" className="bg-black">Corporate Website</option>
                      <option value="ecommerce" className="bg-black">E-Commerce Store</option>
                      <option value="landing" className="bg-black">Landing Page</option>
                      <option value="other" className="bg-black">Other Custom Project</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Project Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Tell us about your brand and goals..."
                      className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Budget Range</label>
                      <input 
                        type="text"
                        placeholder="e.g. ₹50k - ₹1L"
                        value={formData.budget}
                        onChange={e => setFormData({...formData, budget: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Timeline</label>
                      <input 
                        type="text"
                        placeholder="e.g. 2-4 weeks"
                        value={formData.timeline}
                        onChange={e => setFormData({...formData, timeline: e.target.value})}
                        className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : (
                      <>
                        Send Request <Send size={14} />
                      </>
                    )}
                  </button>
                  
                  {!user && (
                    <p className="text-[10px] text-center text-red-500 uppercase tracking-widest">
                      Please login to submit your request
                    </p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
