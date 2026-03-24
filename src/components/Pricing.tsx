import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const PLANS = [
  {
    title: "Essential",
    price: "$5,000",
    features: ["Custom Design", "Responsive Layout", "5 Pages", "Basic SEO", "Contact Form"],
    isCustom: false
  },
  {
    title: "Premium",
    price: "$12,000",
    features: ["Immersive Motion", "Advanced SEO", "Unlimited Pages", "CMS Integration", "Priority Support"],
    isCustom: false
  },
  {
    title: "Enterprise",
    price: "Custom",
    features: ["Bespoke Solutions", "Full Brand Identity", "E-commerce", "Custom Integrations", "Dedicated Manager"],
    isCustom: true
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-32 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Investment</span>
          <h2 className="text-5xl md:text-7xl font-serif font-medium tracking-tight">Transparent Value</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`p-12 border ${plan.isCustom ? 'border-brand-blue/30 bg-brand-blue/5' : 'border-white/10 bg-zinc-900/50'} flex flex-col`}
            >
              <h3 className="text-2xl font-serif mb-2">{plan.title}</h3>
              <div className="mb-10">
                <span className="text-4xl font-serif font-bold">{plan.price}</span>
                {!plan.isCustom && <span className="text-white/40 text-sm ml-2">starting at</span>}
              </div>
              
              <ul className="space-y-6 mb-12 flex-grow">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-4 text-sm text-white/60">
                    <Check size={16} className="text-brand-blue" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`w-full py-5 text-xs uppercase tracking-[0.2em] font-bold text-center transition-all ${
                  plan.isCustom 
                    ? 'bg-brand-blue text-white hover:bg-brand-blue/90' 
                    : 'border border-white/20 text-white hover:bg-white/5'
                }`}
              >
                {plan.isCustom ? 'Inquire Now' : 'Get Started'}
              </a>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-white/40 text-sm italic">
            * All projects are subject to custom scoping for precise requirements.
          </p>
        </div>
      </div>
    </section>
  );
}
