import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  auth, 
  db,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Create user profile in Firestore
        try {
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: displayName,
            role: user.email === 'leaninkclothing@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          });
        } catch (fsErr) {
          handleFirestoreError(fsErr, OperationType.CREATE, `users/${user.uid}`);
        }
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-white/10 p-8 md:p-12"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-10">
              <h2 className="text-3xl font-serif mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join Webcraft'}
              </h2>
              <p className="text-sm text-white/40 uppercase tracking-widest">
                {mode === 'login' ? 'Enter your credentials' : 'Create your digital legacy'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                    <User size={12} /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                  <Lock size={12} /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 uppercase tracking-widest">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-3 group"
              >
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
                {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="ml-2 text-white hover:text-brand-blue transition-colors font-bold"
                >
                  {mode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
