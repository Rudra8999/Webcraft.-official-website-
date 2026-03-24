import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { Package, User, Calendar, CreditCard, ArrowRight, X, Download, CheckCircle2, QrCode } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firebase';
import { updateProfile } from 'firebase/auth';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ displayName: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setEditFormData({ displayName: profile.displayName || '' });
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="text-xs uppercase tracking-[0.4em] text-brand-blue font-bold mb-4 block">Dashboard</span>
          <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-4">Welcome, {profile?.displayName || user.email}</h1>
          <p className="text-white/40 uppercase tracking-widest text-xs">Manage your digital legacy and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-zinc-950 border border-white/5 p-10">
              <h2 className="text-xl font-serif mb-8 flex items-center gap-3">
                <User size={20} className="text-brand-blue" /> Personal Info
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 block mb-2">Full Name</label>
                  <p className="text-lg font-serif">{profile?.displayName || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 block mb-2">Email Address</label>
                  <p className="text-lg font-serif">{user.email}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/30 block mb-2">Member Since</label>
                  <p className="text-lg font-serif">{new Date(user.metadata.creationTime!).toLocaleDateString()}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingProfile(true)}
                className="mt-10 w-full py-4 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-zinc-950 border border-white/5 p-10">
              <h2 className="text-xl font-serif mb-8 flex items-center gap-3">
                <Package size={20} className="text-brand-blue" /> Your Orders
              </h2>
              
              {loading ? (
                <p className="text-white/30 uppercase tracking-widest text-xs">Loading orders...</p>
              ) : orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="group p-6 border border-white/5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 flex items-center justify-center text-brand-blue">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-lg font-serif mb-1">Order #{order.id.slice(0, 8)}</p>
                          <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest text-white/40">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-0.5 rounded-full ${
                              order.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-brand-blue/10 text-brand-blue'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-10">
                        <p className="text-xl font-serif">₹{order.totalAmount}</p>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:text-brand-blue transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold"
                        >
                          Receipt <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border border-dashed border-white/10">
                  <p className="text-white/30 uppercase tracking-widest text-xs mb-6">No orders found yet</p>
                  <button className="px-8 py-3 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all">
                    Explore Services
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingProfile(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-950 border border-white/10 p-10"
            >
              <button onClick={() => setIsEditingProfile(false)} className="absolute top-6 right-6 text-white/40 hover:text-white"><X size={20} /></button>
              <h3 className="text-2xl font-serif mb-8">Edit Profile</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingProfile(true);
                try {
                  if (auth.currentUser) {
                    await updateProfile(auth.currentUser, { displayName: editFormData.displayName });
                    await updateDoc(doc(db, 'users', user.uid), { displayName: editFormData.displayName });
                    setIsEditingProfile(false);
                  }
                } catch (error) {
                  console.error('Error updating profile:', error);
                  handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
                } finally {
                  setIsSavingProfile(false);
                }
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editFormData.displayName} 
                    onChange={e => setEditFormData({ ...editFormData, displayName: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all disabled:opacity-50"
                >
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white text-black p-12 overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 text-black/40 hover:text-black"><X size={24} /></button>
              
              <div className="flex justify-between items-start mb-12 border-b border-black/10 pb-8">
                <div>
                  <h3 className="text-3xl font-serif mb-2">Receipt</h3>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-black/40">Order #{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-serif">webcraft.</p>
                  <p className="text-[10px] uppercase tracking-widest text-black/40">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-4">Billed To</h4>
                  <p className="font-serif text-lg">{profile?.displayName || 'Customer'}</p>
                  <p className="text-sm text-black/60">{user.email}</p>
                </div>
                <div>
                  <h4 className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-4">Payment Info</h4>
                  <p className="text-sm text-black/60 flex items-center gap-2">
                    {selectedOrder.paymentMethod === 'qr' ? <QrCode size={14} /> : <CreditCard size={14} />}
                    {selectedOrder.paymentMethod === 'qr' ? 'QR Scan Payment' : 'Card Payment'}
                  </p>
                  <p className="text-sm font-bold mt-1 uppercase tracking-widest text-green-600 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {selectedOrder.status}
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-12">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-black/40 mb-6">Order Items</h4>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-4 border-b border-black/5">
                    <div>
                      <p className="font-serif text-lg">{item.title}</p>
                      <p className="text-[10px] uppercase tracking-widest text-black/40">Premium License</p>
                    </div>
                    <p className="font-serif text-lg">₹{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/40 uppercase tracking-widest">Subtotal</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/40 uppercase tracking-widest">Tax</span>
                    <span>₹0</span>
                  </div>
                  <div className="h-px bg-black/10 my-4" />
                  <div className="flex justify-between text-2xl font-serif">
                    <span>Total</span>
                    <span className="text-brand-blue">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="mt-16 pt-8 border-t border-black/10 text-center">
                <p className="text-[10px] uppercase tracking-[0.4em] text-black/40 mb-8">Thank you for choosing webcraft.</p>
                <button 
                  onClick={() => window.print()}
                  className="px-8 py-3 bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue transition-all flex items-center gap-2 mx-auto"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
