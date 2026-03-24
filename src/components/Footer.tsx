import React from 'react';

export default function Footer() {
  return (
    <footer className="py-20 bg-black border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
          <div>
            <a href="#" className="text-4xl font-serif font-bold tracking-tighter mb-6 block">
              webcraft<span className="text-brand-blue">.</span>
            </a>
            <p className="text-white/40 max-w-xs text-sm leading-relaxed">
              Engineering digital excellence for the world's most visionary brands.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24">
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30">Contact</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>+91 7620308314</li>
                <li>+91 92847 07118</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30">Social</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="https://instagram.com/webcraft_sites.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram @webcraft_sites.in</a></li>
              </ul>
            </div>
            <div className="hidden md:block space-y-4">
              <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5 gap-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
            © 2026 Webcraft Studio. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#contact" className="text-[10px] uppercase tracking-[0.3em] text-brand-blue font-bold hover:text-white transition-colors">
              Start a Project
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
