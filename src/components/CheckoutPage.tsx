import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ArrowRight, Lock, CreditCard, Mail, User, MapPin, QrCode, Upload, Star, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, limit, doc, getDoc } from 'firebase/firestore';

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod] = useState<'qr'>('qr');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [qrUrl, setQrUrl] = useState('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=webcraft-payment-request');
  
  // Testimonial State
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [testimonialContent, setTestimonialContent] = useState('');
  const [testimonialRating, setTestimonialRating] = useState(5);
  const [isSubmittingTestimonial, setIsSubmittingTestimonial] = useState(false);
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'general'));
        if (settingsDoc.exists() && settingsDoc.data().paymentQrUrl) {
          setQrUrl(settingsDoc.data().paymentQrUrl);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleApplyPromo = async () => {
    setPromoError('');
    if (!promoCode) return;

    try {
      const q = query(collection(db, 'promo_codes'), where('code', '==', promoCode.toUpperCase()), where('isActive', '==', true), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setPromoError('Invalid or inactive promo code');
        return;
      }

      const promoData = querySnapshot.docs[0].data();
      const now = new Date().toISOString();
      
      if (promoData.expiryDate && promoData.expiryDate < now) {
        setPromoError('Promo code has expired');
        return;
      }

      setAppliedPromo({ id: querySnapshot.docs[0].id, ...promoData });
    } catch (err) {
      setPromoError('Error applying promo code');
    }
  };

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === 'percentage') {
      return (total * appliedPromo.discountValue) / 100;
    }
    return appliedPromo.discountValue;
  };

  const finalTotal = Math.max(0, total - calculateDiscount());

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage. For now, use a data URL or placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to complete your purchase');
      return;
    }

    if (!paymentProofUrl) {
      alert('Please upload payment proof before proceeding');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Create order in Firestore
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price })),
        totalAmount: finalTotal,
        status: 'pending',
        paymentMethod: 'qr',
        paymentProofUrl: paymentProofUrl,
        promoCodeApplied: appliedPromo?.code || null,
        createdAt: new Date().toISOString()
      });

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      handleFirestoreError(error, OperationType.CREATE, 'orders');
      setIsProcessing(false);
    }
  };

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmittingTestimonial(true);
    try {
      await addDoc(collection(db, 'testimonials'), {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        content: testimonialContent,
        rating: testimonialRating,
        isApproved: false,
        createdAt: new Date().toISOString()
      });
      setTestimonialSubmitted(true);
      setTimeout(() => setShowTestimonialForm(false), 3000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'testimonials');
    } finally {
      setIsSubmittingTestimonial(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-brand-blue rounded-full flex items-center justify-center mb-10 shadow-2xl shadow-brand-blue/20"
        >
          <Lock size={40} className="text-white" />
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-serif mb-6">Order Confirmed</h2>
        <p className="text-white/40 mb-12 uppercase tracking-[0.4em] text-xs max-w-md leading-relaxed">
          Your digital assets have been delivered to your dashboard and email. Admin will verify your payment proof shortly.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <a 
            href="#dashboard" 
            className="px-12 py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-brand-blue hover:text-white transition-all"
          >
            Go to Dashboard
          </a>
          <button 
            onClick={() => setShowTestimonialForm(true)}
            className="px-12 py-5 border border-white/10 text-white text-xs font-bold uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
          >
            Leave a Testimonial
          </button>
        </div>

        <AnimatePresence>
          {showTestimonialForm && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-xl p-10 bg-zinc-950 border border-white/5 text-left"
            >
              {testimonialSubmitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-serif mb-2">Thank You!</h3>
                  <p className="text-white/40 uppercase tracking-widest text-[10px]">Your testimonial has been submitted for approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTestimonial} className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold">Share Your Experience</h3>
                    <button type="button" onClick={() => setShowTestimonialForm(false)} className="text-white/20 hover:text-white text-[10px] uppercase tracking-widest">Close</button>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Rating</label>
                    <div className="flex gap-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setTestimonialRating(star)}
                          className={`transition-all ${star <= testimonialRating ? 'text-brand-blue scale-110' : 'text-white/10'}`}
                        >
                          <Star size={24} fill={star <= testimonialRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Your Thoughts</label>
                    <textarea 
                      required
                      value={testimonialContent}
                      onChange={(e) => setTestimonialContent(e.target.value)}
                      placeholder="How was your experience with WebCraft?"
                      className="w-full bg-transparent border border-white/10 p-4 focus:border-brand-blue outline-none transition-colors font-sans text-sm min-h-[120px] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingTestimonial}
                    className="w-full py-5 bg-white text-black text-xs font-bold uppercase tracking-[0.3em] hover:bg-brand-blue hover:text-white transition-all"
                  >
                    {isSubmittingTestimonial ? 'Submitting...' : 'Submit Testimonial'}
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <a href="#cart" className="text-white/40 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </a>
          <h1 className="text-4xl md:text-6xl font-serif">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <form onSubmit={handleCheckout} className="space-y-12">
            <div className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold">Billing Details</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <User size={12} /> First Name
                  </label>
                  <input required type="text" className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans text-sm" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                    <User size={12} /> Last Name
                  </label>
                  <input required type="text" className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans text-sm" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <Mail size={12} /> Email Address
                </label>
                <input required type="email" className="w-full bg-transparent border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans text-sm" />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                  <MapPin size={12} /> Country / Region
                </label>
                <select defaultValue="India" className="w-full bg-zinc-950 border-b border-white/10 py-3 focus:border-brand-blue outline-none transition-colors font-sans text-sm">
                  <option>India</option>
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                </select>
              </div>
            </div>

            <div className="space-y-8">
              <h3 className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold">Payment Method</h3>
              
              <div className="grid grid-cols-1 gap-4 mb-6">
                <div className="p-4 border border-brand-blue bg-brand-blue/5 flex flex-col items-center gap-3">
                  <QrCode size={24} className="text-brand-blue" />
                  <span className="text-[10px] uppercase tracking-widest font-bold">QR Scan Payment</span>
                </div>
              </div>

              <div className="p-8 bg-zinc-950 border border-brand-blue/30 flex flex-col items-center text-center space-y-8">
                <div className="p-4 bg-white rounded-xl">
                  <img 
                    src={qrUrl} 
                    alt="Payment QR Code" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest">Scan to Pay</h4>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest leading-relaxed max-w-[240px]">
                    Scan this QR code with any UPI app to complete the payment of <span className="text-white font-bold">₹{finalTotal}</span>
                  </p>
                </div>

                <div className="w-full pt-8 border-t border-white/5 space-y-6">
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <Upload size={12} /> Upload Payment Proof
                    </label>
                    <div className="relative group">
                      <label className="block w-full cursor-pointer">
                        <div className={`border-2 border-dashed transition-all p-6 text-center ${paymentProofUrl ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 hover:border-brand-blue/30 hover:bg-white/5'}`}>
                          {paymentProofUrl ? (
                            <div className="flex items-center justify-center gap-3 text-green-500">
                              <CheckCircle2 size={16} />
                              <span className="text-[10px] uppercase tracking-widest font-bold">Proof Uploaded</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload size={20} className="mx-auto text-white/20 group-hover:text-brand-blue transition-colors" />
                              <p className="text-[9px] uppercase tracking-widest text-white/40">Click to upload screenshot</p>
                            </div>
                          )}
                        </div>
                        <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
                      </label>
                    </div>
                  </div>
                  <p className="text-[9px] text-brand-blue uppercase tracking-[0.2em] font-bold italic">
                    Admin will verify and update status manually
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-6 bg-white text-black text-xs font-bold uppercase tracking-[0.4em] hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing Transaction...' : `Complete Order - ₹${finalTotal}`}
              {!isProcessing && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="space-y-8">
            <div className="p-10 bg-zinc-950 border border-white/5">
              <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 mb-10">Order Review</h3>
              
              <div className="space-y-6 mb-10">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-serif">{item.title}</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest">Digital License</p>
                    </div>
                    <span className="text-sm font-bold">₹{item.price}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/5 my-8" />

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between text-xs uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  
                  {appliedPromo && (
                    <div className="flex justify-between text-xs uppercase tracking-widest text-green-500">
                      <span>Discount ({appliedPromo.code})</span>
                      <span>-₹{calculateDiscount()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-serif pt-4">
                    <span>Total Amount</span>
                    <span className="text-brand-blue">₹{finalTotal}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="PROMO CODE" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-transparent border-b border-white/10 py-2 focus:border-brand-blue outline-none transition-colors text-[10px] uppercase tracking-widest"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-6 py-2 border border-white/10 text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <p className="text-[9px] text-red-500 mt-2 uppercase tracking-widest">{promoError}</p>}
                  {appliedPromo && <p className="text-[9px] text-green-500 mt-2 uppercase tracking-widest">Promo code applied successfully!</p>}
                </div>
              </div>
            </div>

            <div className="p-8 border border-white/5 flex items-start gap-4">
              <Lock size={18} className="text-brand-blue mt-1" />
              <div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-2">Secure Transaction</h4>
                <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                  Your payment information is handled securely. Admin will verify your payment proof manually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
