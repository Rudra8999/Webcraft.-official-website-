import React, { useState, useEffect } from 'react';
import OpeningAnimation from './components/OpeningAnimation';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import ErrorBoundary from './components/ErrorBoundary';
import WhatsAppButton from './components/WhatsAppButton';
import UserDashboard from './components/UserDashboard';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function AppContent() {
  const [showOpening, setShowOpening] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#');
  const { isAdmin, user, loading } = useAuth();

  useEffect(() => {
    const handleHashChange = () => setCurrentPath(window.location.hash || '#');
    window.addEventListener('hashchange', handleHashChange);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsAdminMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-brand-blue animate-pulse font-serif text-2xl">webcraft.</div>
      </div>
    );
  }

  if (isAdminMode && isAdmin) {
    return (
      <ErrorBoundary>
        <AdminPanel onExit={() => setIsAdminMode(false)} />
      </ErrorBoundary>
    );
  }

  const renderContent = () => {
    switch (currentPath) {
      case '#dashboard':
        return user ? <UserDashboard /> : <Hero />;
      case '#templates':
        return <Portfolio />;
      case '#custom':
        return <Services />;
      case '#contact':
        return <Contact />;
      case '#cart':
        return <CartPage />;
      case '#checkout':
        return <CheckoutPage />;
      default:
        return (
          <>
            <Hero />
            <Portfolio />
            <Services />
            <Testimonials />
            <Contact />
          </>
        );
    }
  };

  return (
    <ErrorBoundary>
      {showOpening && <OpeningAnimation onComplete={() => setShowOpening(false)} />}
      
      {!showOpening && (
        <main className="bg-black min-h-screen selection:bg-brand-blue selection:text-white">
          <Navbar />
          {renderContent()}
          <Footer />
          <WhatsAppButton />
          <ScrollToTop />
          
          {/* Admin Shortcut Hint */}
          <div className="fixed bottom-4 right-4 text-[8px] text-white/10 uppercase tracking-widest pointer-events-none">
            Ctrl+Shift+A for Admin
          </div>
        </main>
      )}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
