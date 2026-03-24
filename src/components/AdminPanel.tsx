import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Layout, 
  Users, 
  ShoppingBag, 
  FileText, 
  PlusSquare, 
  Tag,
  LogOut,
  ChevronRight,
  Search,
  Filter,
  QrCode,
  CreditCard,
  Settings,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { db, auth, signOut, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  setDoc,
  updateDoc,
  query, 
  orderBy 
} from 'firebase/firestore';
import { Project } from '../types';
import { useAuth } from '../context/AuthContext';

type AdminTab = 'templates' | 'users' | 'orders' | 'custom-orders' | 'addons' | 'promo-codes' | 'testimonials' | 'settings';

interface AdminPanelProps {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: AdminPanelProps) {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('templates');
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ paymentQrUrl: '' });
  const [settingsFormData, setSettingsFormData] = useState({ paymentQrUrl: '' });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const isAdmin = profile?.role === 'admin' || user?.email === 'leaninkclothing@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;

    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('order', 'asc')), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    const unsubCustomOrders = onSnapshot(query(collection(db, 'custom_orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setCustomOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'custom_orders'));

    const unsubAddons = onSnapshot(collection(db, 'addons'), (snapshot) => {
      setAddons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'addons'));

    const unsubPromoCodes = onSnapshot(collection(db, 'promo_codes'), (snapshot) => {
      setPromoCodes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'promo_codes'));

    const unsubTestimonials = onSnapshot(collection(db, 'testimonials'), (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'testimonials'));

    const unsubSettings = onSnapshot(collection(db, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setSettings({ id: snapshot.docs[0].id, ...data });
        setSettingsFormData({ paymentQrUrl: data.paymentQrUrl || '' });
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'settings'));

    return () => {
      unsubProjects();
      unsubUsers();
      unsubOrders();
      unsubCustomOrders();
      unsubAddons();
      unsubPromoCodes();
      unsubTestimonials();
      unsubSettings();
    };
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-md w-full text-center">
          <h2 className="text-4xl font-serif mb-4 text-red-500">Access Denied</h2>
          <p className="text-white/50 mb-8">You do not have administrative privileges.</p>
          <button onClick={() => signOut(auth)} className="text-white/30 hover:text-white underline">Sign Out</button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const collectionName = activeTab === 'templates' ? 'projects' :
                          activeTab === 'custom-orders' ? 'custom_orders' : 
                          activeTab === 'promo-codes' ? 'promo_codes' : activeTab;
    
    // Clean up data before saving
    const { id: _, ...dataToSave } = formData;

    try {
      if (editingId) {
        await setDoc(doc(db, collectionName, editingId), dataToSave, { merge: true });
      } else {
        const finalData = { ...dataToSave };
        if (activeTab === 'testimonials' && !finalData.userId) {
          finalData.userId = user?.uid;
          finalData.userName = finalData.userName || user?.displayName || 'Admin';
          finalData.isApproved = true;
        }
        await addDoc(collection(db, collectionName), {
          ...finalData,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({});
    } catch (error) {
      console.error('Error saving:', error);
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, `${collectionName}/${editingId || 'new'}`);
    }
  };

  const handleDelete = async (id: string) => {
    const collectionName = activeTab === 'templates' ? 'projects' :
                          activeTab === 'custom-orders' ? 'custom_orders' : 
                          activeTab === 'promo-codes' ? 'promo_codes' : activeTab;
    
    try {
      await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error('Error deleting:', error);
      handleFirestoreError(error, OperationType.DELETE, `${collectionName}/${id}`);
    }
  };

  const sidebarItems = [
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'custom-orders', label: 'Custom Orders', icon: FileText },
    { id: 'addons', label: 'Add-ons', icon: PlusSquare },
    { id: 'promo-codes', label: 'Promo Codes', icon: Tag },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data: any[]) => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (settings.id) {
        await updateDoc(doc(db, 'settings', settings.id), settingsFormData);
      } else {
        await addDoc(collection(db, 'settings'), settingsFormData);
      }
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      handleFirestoreError(error, OperationType.WRITE, 'settings');
    }
  };

  const handleApproveTestimonial = async (id: string, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { isApproved });
    } catch (error) {
      console.error('Error updating testimonial:', error);
      handleFirestoreError(error, OperationType.UPDATE, 'testimonials');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, imageUrl: reader.result as string });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSettingsFormData({ ...settingsFormData, paymentQrUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Horizontal Navigation */}
      <header className="border-b border-white/5 bg-zinc-950 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-serif tracking-tight">
              webcraft<span className="text-brand-blue">.</span> admin
            </h1>
            <nav className="hidden lg:flex items-center gap-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AdminTab)}
                  className={`flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-full ${
                    activeTab === item.id ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'
                  }`}
                >
                  <item.icon size={12} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 hover:text-white transition-all"
            >
              <ChevronRight size={14} className="rotate-180" /> Back to Site
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="p-2 text-red-500 hover:bg-red-500/5 rounded-full transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        
        {/* Mobile Nav */}
        <div className="lg:hidden border-t border-white/5 p-2 overflow-x-auto no-scrollbar flex items-center gap-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all rounded-full ${
                activeTab === item.id ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'
              }`}
            >
              <item.icon size={12} />
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-serif capitalize">{activeTab.replace('-', ' ')}</h2>
          <button
            onClick={() => { setIsAdding(true); setFormData({}); }}
            className="px-8 py-3 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Add New
          </button>
        </div>
          {/* Table View */}
          <div className="bg-zinc-950 border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.3em] text-white/30">
                    {activeTab === 'templates' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('title')}>Name</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>Price</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('order')}>Order</th>
                      </>
                    )}
                    {activeTab === 'users' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('displayName')}>Name</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('email')}>Email</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('role')}>Role</th>
                      </>
                    )}
                    {activeTab === 'orders' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('id')}>Order ID</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('userEmail')}>Customer</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('total')}>Total</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('paymentMethod')}>Payment</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>Status</th>
                      </>
                    )}
                    {activeTab === 'custom-orders' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('projectType')}>Type</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('status')}>Status</th>
                      </>
                    )}
                    {activeTab === 'addons' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>Name</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('price')}>Price</th>
                      </>
                    )}
                    {activeTab === 'promo-codes' && (
                      <>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('code')}>Code</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('discountValue')}>Discount</th>
                        <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('isActive')}>Status</th>
                      </>
                    )}
                    {activeTab === 'testimonials' && (
                      <>
                        <th className="px-8 py-6">User</th>
                        <th className="px-8 py-6">Rating</th>
                        <th className="px-8 py-6">Status</th>
                      </>
                    )}
                    {activeTab === 'settings' && (
                      <th className="px-8 py-6">Configuration</th>
                    )}
                    <th className="px-8 py-6 cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>Date</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {activeTab === 'templates' && getSortedData(projects).map(project => (
                    <tr key={project.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={project.imageUrl} className="w-12 h-12 object-cover bg-zinc-900" referrerPolicy="no-referrer" />
                          <p className="font-serif text-lg">{project.title}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-brand-blue">${project.price || 0}</td>
                      <td className="px-8 py-6 text-sm text-white/60">{project.order}</td>
                      <td className="px-8 py-6 text-sm text-white/40">-</td>
                      <td className="px-8 py-6 text-right space-x-4">
                        <button onClick={() => { setEditingId(project.id!); setFormData(project); setIsAdding(true); }} className="text-white/40 hover:text-white"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(project.id!)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'users' && getSortedData(users).map(user => (
                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-serif text-lg">{user.displayName || 'No Name'}</td>
                      <td className="px-8 py-6 text-sm text-white/40">{user.email}</td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${user.role === 'admin' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-white/5 text-white/40'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => { setEditingId(user.id); setFormData(user); setIsAdding(true); }} className="text-white/40 hover:text-white mr-4"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(user.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'orders' && getSortedData(orders).map(order => (
                    <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-serif text-lg">#{order.id?.slice(-6)}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.items?.map((item: any, idx: number) => (
                            <span key={idx} className="text-[8px] uppercase tracking-tighter bg-brand-blue/20 px-1 text-brand-blue border border-brand-blue/30">
                              {item.title}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-sm text-white/80">{order.userEmail}</p>
                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">{order.userId?.slice(0, 8)}...</p>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-brand-blue">${order.totalAmount || order.total}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            {order.paymentMethod === 'qr' ? <QrCode size={12} className="text-brand-blue" /> : <CreditCard size={12} className="text-white/40" />}
                            <span className="text-[10px] uppercase tracking-widest text-white/40">
                              {order.paymentMethod || 'card'}
                            </span>
                          </div>
                          {order.paymentProofUrl && (
                            <a 
                              href={order.paymentProofUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-blue hover:underline flex items-center gap-1"
                            >
                              <ExternalLink size={10} /> View Proof
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={order.status || 'pending'} 
                          onChange={async (e) => {
                            try {
                              await setDoc(doc(db, 'orders', order.id), { status: e.target.value }, { merge: true });
                            } catch (err) {
                              handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
                            }
                          }}
                          className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-zinc-900 border border-white/10 outline-none cursor-pointer ${
                            order.status === 'completed' ? 'text-green-500 border-green-500/30' : 
                            order.status === 'processing' ? 'text-brand-blue border-brand-blue/30' : 
                            order.status === 'cancelled' ? 'text-red-500 border-red-500/30' : 'text-white/40 border-white/10'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete(order.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'custom-orders' && getSortedData(customOrders).map(order => (
                    <tr key={order.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-serif text-lg">{order.projectType}</td>
                      <td className="px-8 py-6">
                        <span className="text-[10px] uppercase tracking-widest text-white/40">{order.status}</span>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => { setEditingId(order.id); setFormData(order); setIsAdding(true); }} className="text-white/40 hover:text-white mr-4"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(order.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'addons' && getSortedData(addons).map(addon => (
                    <tr key={addon.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-serif text-lg">{addon.name}</td>
                      <td className="px-8 py-6 text-sm font-bold text-brand-blue">₹{addon.price}</td>
                      <td className="px-8 py-6 text-sm text-white/40">-</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => { setEditingId(addon.id); setFormData(addon); setIsAdding(true); }} className="text-white/40 hover:text-white mr-4"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(addon.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'promo-codes' && getSortedData(promoCodes).map(promo => (
                    <tr key={promo.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6 font-serif text-lg tracking-widest">{promo.code}</td>
                      <td className="px-8 py-6 text-sm text-white/40">{promo.discountType === 'percentage' ? `${promo.discountValue}% off` : `₹${promo.discountValue} off`}</td>
                      <td className="px-8 py-6">
                        <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${promo.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {promo.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">{promo.expiryDate ? new Date(promo.expiryDate).toLocaleDateString() : 'No Expiry'}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => { setEditingId(promo.id); setFormData(promo); setIsAdding(true); }} className="text-white/40 hover:text-white mr-4"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(promo.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'testimonials' && getSortedData(testimonials).map(testimonial => (
                    <tr key={testimonial.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-6">
                        <p className="font-serif text-lg">{testimonial.userName || 'Anonymous'}</p>
                        <p className="text-[10px] text-white/30 italic truncate max-w-[300px] mt-1">"{testimonial.content}"</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < testimonial.rating ? 'bg-brand-blue' : 'bg-white/10'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => handleApproveTestimonial(testimonial.id, !testimonial.isApproved)}
                          className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                            testimonial.isApproved ? 'bg-green-500/10 text-green-500 border-green-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                          }`}
                        >
                          {testimonial.isApproved ? 'Approved' : 'Pending'}
                        </button>
                      </td>
                      <td className="px-8 py-6 text-sm text-white/40">{testimonial.createdAt ? new Date(testimonial.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="px-8 py-6 text-right">
                        <button onClick={() => handleDelete(testimonial.id)} className="text-white/40 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {activeTab === 'settings' && (
                    <tr>
                      <td colSpan={5} className="px-8 py-12">
                        <div className="max-w-xl">
                          <form onSubmit={handleSaveSettings} className="space-y-8">
                            <div className="space-y-4">
                              <label className="text-[10px] uppercase tracking-widest text-white/40">Payment QR Code</label>
                              <div className="flex items-center gap-8">
                                <div className="p-4 bg-white rounded-xl w-40 h-40 flex items-center justify-center border border-white/10">
                                  {settingsFormData.paymentQrUrl ? (
                                    <img src={settingsFormData.paymentQrUrl} alt="QR Code" className="w-full h-full object-contain" />
                                  ) : (
                                    <QrCode size={48} className="text-black/10" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-4">
                                  <label className="block cursor-pointer">
                                    <div className="px-6 py-3 border border-white/10 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-white/5 transition-all text-center">
                                      Upload QR Image
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" onChange={handleQrUpload} />
                                  </label>
                                  <input 
                                    type="text" 
                                    placeholder="Or enter image URL" 
                                    value={settingsFormData.paymentQrUrl}
                                    onChange={(e) => setSettingsFormData({...settingsFormData, paymentQrUrl: e.target.value})}
                                    className="w-full bg-transparent border-b border-white/10 py-2 focus:border-brand-blue outline-none transition-colors text-xs"
                                  />
                                </div>
                              </div>
                            </div>
                            <button type="submit" className="px-12 py-4 bg-white text-black text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all">
                              Save Settings
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {(activeTab === 'orders' && orders.length === 0) || 
               (activeTab === 'custom-orders' && customOrders.length === 0) || 
               (activeTab === 'addons' && addons.length === 0) || 
               (activeTab === 'promo-codes' && promoCodes.length === 0) ? (
                <div className="py-20 text-center">
                  <p className="text-white/20 uppercase tracking-widest text-xs italic">No items found in this section.</p>
                </div>
              ) : null}
            </div>
          </div>
      </main>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-2xl h-full bg-zinc-950 border-l border-white/5 p-12 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-serif">{editingId ? 'Edit' : 'Add New'} {activeTab}</h3>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white"><X size={24} /></button>
              </div>

              <form onSubmit={handleSave} className="space-y-8">
                {activeTab === 'templates' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Name</label>
                      <input type="text" required value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Description</label>
                      <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Image</label>
                      <div className="flex items-center gap-4">
                        {formData.imageUrl && (
                          <img src={formData.imageUrl} className="w-20 h-20 object-cover border border-white/10" referrerPolicy="no-referrer" />
                        )}
                        <label className="flex-1 cursor-pointer">
                          <div className="w-full border-2 border-dashed border-white/10 rounded-lg py-8 flex flex-col items-center justify-center gap-2 hover:border-brand-blue transition-colors">
                            <PlusSquare size={24} className="text-white/20" />
                            <span className="text-[10px] uppercase tracking-widest text-white/40">{isUploading ? 'Uploading...' : 'Click to upload image'}</span>
                          </div>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                      </div>
                      <input type="url" placeholder="Or enter image URL" value={formData.imageUrl || ''} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors text-xs" />
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Price ($)</label>
                        <input type="number" required value={formData.price || 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Order</label>
                        <input type="number" required value={formData.order || 0} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Display Name</label>
                      <input type="text" required value={formData.displayName || ''} onChange={e => setFormData({...formData, displayName: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Role</label>
                      <select value={formData.role || 'user'} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-zinc-900 border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}
                {activeTab === 'orders' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Status</label>
                      <select value={formData.status || 'pending'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-900 border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Total Amount ($)</label>
                      <input type="number" required value={formData.totalAmount || formData.total || 0} onChange={e => setFormData({...formData, totalAmount: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                  </>
                )}
                {activeTab === 'custom-orders' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Project Type</label>
                      <input type="text" required value={formData.projectType || ''} onChange={e => setFormData({...formData, projectType: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Description</label>
                      <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Status</label>
                      <select value={formData.status || 'pending'} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-zinc-900 border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors">
                        <option value="pending">Pending</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </>
                )}
                {activeTab === 'addons' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Name</label>
                      <input type="text" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Description</label>
                      <textarea required value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors resize-none" rows={3} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Price (₹)</label>
                      <input type="number" required value={formData.price || 0} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                  </>
                )}
                {activeTab === 'promo-codes' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Code</label>
                      <input type="text" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Discount Type</label>
                      <select value={formData.discountType || 'percentage'} onChange={e => setFormData({...formData, discountType: e.target.value})} className="w-full bg-zinc-900 border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Discount Value</label>
                      <input type="number" required value={formData.discountValue || 0} onChange={e => setFormData({...formData, discountValue: parseFloat(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="flex items-center gap-4 py-4">
                      <input type="checkbox" checked={formData.isActive ?? true} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4" />
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Is Active</label>
                    </div>
                  </>
                )}
                {activeTab === 'testimonials' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">User Name</label>
                      <input type="text" required value={formData.userName || ''} onChange={e => setFormData({...formData, userName: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Content</label>
                      <textarea required value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors resize-none" rows={4} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Rating (1-5)</label>
                      <input type="number" min="1" max="5" required value={formData.rating || 5} onChange={e => setFormData({...formData, rating: parseInt(e.target.value)})} className="w-full bg-transparent border-b border-white/10 py-4 focus:border-brand-blue outline-none transition-colors" />
                    </div>
                    <div className="flex items-center gap-4 py-4">
                      <input type="checkbox" checked={formData.isApproved ?? true} onChange={e => setFormData({...formData, isApproved: e.target.checked})} className="w-4 h-4" />
                      <label className="text-[10px] uppercase tracking-[0.3em] text-white/40">Is Approved</label>
                    </div>
                  </>
                )}
                
                <button type="submit" className="w-full py-6 bg-white text-black text-xs uppercase tracking-[0.3em] font-bold hover:bg-brand-blue hover:text-white transition-all flex items-center justify-center gap-3">
                  <Save size={16} /> {editingId ? 'Update' : 'Create'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
