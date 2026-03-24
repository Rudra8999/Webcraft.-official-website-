import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, User, LogOut, Layout, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth, signOut } from '../lib/firebase';
import AuthModal from './AuthModal';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();
  const { cart } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Templates', href: '#templates' },
    { name: 'Custom Website', href: '#custom' },
    { name: 'Contact Us', href: '#contact' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="/" className="text-2xl font-serif tracking-tight group">
            webcraft<span className="text-brand-blue group-hover:animate-pulse">.</span>
          </a>

          <div className="hidden md:flex items-center gap-12">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 hover:text-white transition-colors"
              >
                {item.name}
              </a>
            ))}

            <a href="#cart" className="relative text-white/60 hover:text-white transition-colors group">
              <ShoppingBag size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-brand-blue text-white text-[8px] flex items-center justify-center rounded-full font-bold animate-in zoom-in duration-300">
                  {cart.length}
                </span>
              )}
            </a>
            
            {user ? (
              <div className="flex items-center gap-6 pl-6 border-l border-white/10">
                <a href="#dashboard" className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-blue hover:text-white transition-colors flex items-center gap-2">
                  <User size={14} /> Dashboard
                </a>
                {isAdmin && (
                  <button onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'A' }))} className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-2">
                    <Layout size={14} /> Admin
                  </button>
                )}
                <button onClick={() => signOut(auth)} className="text-white/40 hover:text-red-500 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-8 py-3 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all"
              >
                Get Started
              </button>
            )}
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center gap-8 p-6"
          >
            <a
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-serif text-white/80 hover:text-white"
            >
              Home
            </a>
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif text-white/80 hover:text-white"
              >
                {item.name}
              </a>
            ))}

            <a
              href="#cart"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-serif text-brand-blue flex items-center gap-3"
            >
              Cart ({cart.length})
            </a>
            
            <div className="pt-8 border-t border-white/10 w-full flex flex-col items-center gap-6">
              {user ? (
                <>
                  <a
                    href="#dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-serif text-brand-blue"
                  >
                    Dashboard
                  </a>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.dispatchEvent(new KeyboardEvent('keydown', { ctrlKey: true, shiftKey: true, key: 'A' }));
                      }}
                      className="text-xl font-serif text-white/60"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      signOut(auth);
                    }}
                    className="text-xl font-serif text-red-500"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xl font-serif text-brand-blue"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="text-xl font-serif text-white"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
