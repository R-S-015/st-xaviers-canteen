"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/store/useProfileStore";
import { useCartStore } from "@/store/useCartStore";
import StripeCheckoutModal from "@/components/StripeCheckoutModal";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    favItem: any | null;
    chartData: { day: string, amount: number }[];
    maxChartAmount: number;
    menuItems: any[];
  }>({ totalOrders: 0, totalSpent: 0, favItem: null, chartData: [], maxChartAmount: 1, menuItems: [] });
  
  const [loading, setLoading] = useState(true);
  
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isPointsOpen, setIsPointsOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [pendingStripeAmount, setPendingStripeAmount] = useState(0);
  const [addAmount, setAddAmount] = useState<string>('');
  
  const { walletBalance, transactions, pointsSpent, addFunds, dietaryPreference, setDietaryPreference, toggles, toggleFilter } = useProfileStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      setUser(currentUser);

      // Fetch user's completed orders for stats
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('status', 'completed');

      if (orders) {
        const spent = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
        
        // Fetch menuData FIRST so we can cross-reference item strings
        const { data: menuData } = await supabase.from('menu_items').select('*');

        // 1. Find favorite item
        const itemFreq: Record<string, { count: number, price: number, id: number, name: string }> = {};
        orders.forEach(order => {
           if(order.items && Array.isArray(order.items)) {
              order.items.forEach((itemStr: any) => {
                 if (typeof itemStr === 'string') {
                   // itemStr is like "2x Veg Pizza"
                   const match = itemStr.match(/^(\d+)x\s+(.+)$/);
                   if (match) {
                     const qty = parseInt(match[1]);
                     const name = match[2];
                     const menuItem = menuData?.find(m => m.name === name);
                     if (menuItem) {
                       if(!itemFreq[menuItem.id]) itemFreq[menuItem.id] = { count: 0, price: menuItem.price, id: menuItem.id, name: menuItem.name };
                       itemFreq[menuItem.id].count += qty;
                     }
                   }
                 } else if (itemStr.id) {
                   // Fallback for older orders that might have been objects
                   if(!itemFreq[itemStr.id]) itemFreq[itemStr.id] = { count: 0, price: itemStr.price, id: itemStr.id, name: itemStr.name };
                   itemFreq[itemStr.id].count += itemStr.quantity || 1;
                 }
              });
           }
        });
        
        let fav = null;
        let maxCount = 0;
        Object.values(itemFreq).forEach(i => {
           if(i.count > maxCount) { maxCount = i.count; fav = i; }
        });

        // 2. Analytics (last 7 days spending)
        const last7Days: Record<string, number> = {};
        for(let i=6; i>=0; i--) {
           const d = new Date();
           d.setDate(d.getDate() - i);
           last7Days[d.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
        }

        orders.forEach(o => {
           const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { weekday: 'short' });
           if(last7Days[dateStr] !== undefined) {
              last7Days[dateStr] += Number(o.total_amount);
           }
        });
        
        const chartData = Object.entries(last7Days).map(([day, amount]) => ({ day, amount }));
        const maxChartAmount = Math.max(...chartData.map(d => d.amount), 1);

        setStats({ 
          totalOrders: orders.length, 
          totalSpent: spent, 
          favItem: fav, 
          chartData, 
          maxChartAmount,
          menuItems: menuData?.filter(m => !m.out_of_stock) || []
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-[100dvh] bg-transparent flex items-center justify-center font-bold text-[#8C7A6B]">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="w-24 h-24 bg-[#F2EAE0]/30 backdrop-blur-xl text-[#4A3C31] rounded-full flex items-center justify-center mb-6 text-4xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40">👤</div>
        <h2 className="text-2xl font-black text-[#4A3C31] mb-2 tracking-tight drop-shadow-sm">Not Logged In</h2>
        <p className="text-[#8C7A6B] mb-8 font-medium drop-shadow-sm">Please sign in to view your profile.</p>
        <Link href="/login" className="bg-[#C97A7E]/90 backdrop-blur-md text-[#F2EAE0] font-bold py-3.5 px-8 rounded-2xl hover:bg-[#B85C60] transition-all shadow-lg border border-white/30">
          Go to Login
        </Link>
      </div>
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="min-h-[100dvh] bg-transparent text-[#4A3C31] flex flex-col font-sans">
      <header className="bg-[#DCD0B6]/45 backdrop-blur-xl backdrop-saturate-[1.5] shadow-sm p-4 sticky top-0 z-10 flex items-center gap-4 border-b border-white/40">
        <Link href="/" className="text-[#5E4D3F] hover:text-[#4A3C31] transition-colors p-2 -ml-2 rounded-full hover:bg-white/20 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-xl font-black tracking-tight text-[#4A3C31] drop-shadow-sm">My Profile</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full space-y-6 mt-4 pb-24">
        
        {/* Profile Card & Puddles Points */}
        <section className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-6 flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-[#C97A7E] to-[#B85C60] text-white rounded-full flex items-center justify-center text-3xl font-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] border-4 border-white/40 flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-[#4A3C31] tracking-tight drop-shadow-sm capitalize">{displayName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <button onClick={() => setIsPointsOpen(true)} className="bg-[#F2EAE0] px-3 py-1 rounded-lg text-xs font-bold text-[#B85C60] shadow-sm border border-[#C97A7E]/20 flex items-center gap-1 hover:bg-white transition-colors active:scale-95">
                <span className="text-sm">🦆</span> {Math.floor(stats.totalSpent * 0.1) - pointsSpent} Puddles Points
              </button>
            </div>
            <p className="text-[10px] font-bold text-[#8C7A6B] mt-1 ml-1 uppercase tracking-wide">100 pts = ₹5 Reward</p>
          </div>
        </section>

        {/* Canteen Wallet Card */}
        <div 
          onClick={() => setIsWalletOpen(true)}
          className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-6 text-[#4A3C31] relative overflow-hidden cursor-pointer hover:-translate-y-1 hover:bg-[#F2EAE0]/60 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] transition-all active:scale-95 group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C97A7E]/20 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none transition-opacity group-hover:opacity-60"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[#8C7A6B] font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2 drop-shadow-sm">
                Malhar Wallet <span className="bg-white/60 px-1.5 py-0.5 rounded text-[9px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 text-[#5E4D3F]">TAP TO OPEN</span>
              </p>
              <h3 className="text-4xl font-black tracking-tight flex items-center gap-1 drop-shadow-sm">
                <span className="text-2xl text-[#8C7A6B]">₹</span>{walletBalance}
              </h3>
            </div>
            <div className="bg-white/40 p-2 rounded-xl backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#C97A7E]"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 relative z-10">
            <div className="flex-1 bg-white/40 py-2.5 rounded-xl font-black text-sm text-[#5E4D3F] backdrop-blur-md border border-white/60 flex items-center justify-center gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              Manage Funds & History →
            </div>
          </div>
        </div>

        {/* One-Tap Reorder (Your Go-To) */}
        {stats.favItem && (
          <div className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-6 flex items-center justify-between group relative overflow-hidden transition-all hover:bg-[#F2EAE0]/60 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C97A7E]/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none transition-opacity group-hover:opacity-60"></div>
            
            <div className="relative z-10 text-[#4A3C31] drop-shadow-sm flex-1 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl animate-bounce">🔥</span>
                <p className="text-[#8C7A6B] font-black text-xs uppercase tracking-widest drop-shadow-sm">Your Go-To Order</p>
              </div>
              <h4 className="font-black text-2xl text-[#4A3C31] leading-tight drop-shadow-sm mb-1">{stats.favItem.name}</h4>
              <p className="text-xs font-bold text-[#A6978A] bg-white/50 border border-white/60 inline-block px-2 py-0.5 rounded shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">Ordered {stats.favItem.count} times</p>
            </div>
            
            <button 
              onClick={() => {
                addItem({ id: stats.favItem.id, name: stats.favItem.name, price: stats.favItem.price });
                router.push('/cart');
              }}
              className="relative z-10 bg-white/60 backdrop-blur-md text-[#5E4D3F] px-5 py-4 rounded-2xl font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] hover:bg-white transition-all active:scale-95 flex flex-col items-center justify-center leading-none border border-white/60 min-w-[80px]"
            >
              <span className="text-[10px] font-bold text-[#B85C60] uppercase tracking-wider mb-1.5 drop-shadow-sm">Reorder</span>
              <span className="text-lg text-[#4A3C31] drop-shadow-sm">₹{stats.favItem.price}</span>
            </button>
          </div>
        )}

        {/* Saved Dietary Preferences */}
        <section className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-6">
          <h3 className="font-black text-[#4A3C31] mb-4 flex items-center gap-2">
            <span className="text-xl">⚙️</span> Default Preferences
          </h3>
          <p className="text-sm text-[#8C7A6B] font-medium mb-4">Automatically apply these filters when you open the menu.</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#A6978A] uppercase tracking-wider mb-2 block">Dietary Base</label>
              <div className="flex gap-2">
                {[{id: 'veg', label: 'Pure Veg'}, {id: 'nonveg', label: 'Non-Veg'}, {id: 'jain', label: 'Jain'}].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setDietaryPreference(dietaryPreference === opt.id ? null : opt.id)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border ${
                      dietaryPreference === opt.id 
                        ? 'bg-[#C97A7E] text-white border-[#C97A7E]/50 shadow-md' 
                        : 'bg-white/60 text-[#8C7A6B] border-white/80 hover:bg-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-[#A6978A] uppercase tracking-wider mb-2 block">Add-ons</label>
              <div className="flex gap-2">
                {[{id: 'spicy', label: 'Spicy 🌶️'}, {id: 'sweet', label: 'Sweet 🍫'}].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => toggleFilter(opt.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                      toggles.includes(opt.id)
                        ? 'bg-[#C97A7E] text-white border-[#C97A7E]/50 shadow-md' 
                        : 'bg-white/60 text-[#8C7A6B] border-white/80 hover:bg-white/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Spending Analytics */}
        <section className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-black text-[#4A3C31] flex items-center gap-2">
                <span className="text-xl">📈</span> Spending Trends
              </h3>
              <p className="text-sm text-[#8C7A6B] font-medium mt-1">Last 7 days</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-[#A6978A] uppercase tracking-wider block">Total</span>
              <span className="text-2xl font-black text-[#B85C60]">₹{stats.totalSpent}</span>
            </div>
          </div>
          
          <div className="h-32 flex items-end gap-2 justify-between mt-4">
            {stats.chartData.map((data, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div className="w-full flex justify-center relative h-24 items-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 bg-[#4A3C31] text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    ₹{data.amount}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full max-w-[24px] bg-[#C97A7E] rounded-t-md transition-all duration-500 ease-out hover:bg-[#B85C60]"
                    style={{ height: `${data.amount === 0 ? 5 : (data.amount / stats.maxChartAmount) * 100}%`, opacity: data.amount === 0 ? 0.2 : 1 }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-[#8C7A6B] uppercase">{data.day}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <Link href="/orders" className="w-full bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] p-4 rounded-2xl font-black text-[#4A3C31] shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 flex items-center justify-between hover:bg-[#F2EAE0]/60 transition-colors">
            <span className="flex items-center gap-3">
              <span className="text-xl">🧾</span> View All Order Receipts
            </span>
            <span>→</span>
          </Link>

          <button onClick={handleSignOut} className="w-full bg-white/45 backdrop-blur-xl backdrop-saturate-[1.5] p-4 rounded-2xl font-black text-rose-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] border border-rose-300/30 flex items-center justify-between hover:bg-white/60 transition-colors">
            <span className="flex items-center gap-3">
              <span className="text-xl">🚪</span> Sign Out
            </span>
          </button>
        </div>

      </main>

      {/* Wallet Modal */}
      {isWalletOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsWalletOpen(false)}></div>
          <div className="relative bg-[#F2EAE0]/45 backdrop-blur-3xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)] w-full max-w-lg rounded-3xl flex flex-col max-h-[85dvh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DCD0B6]/50 flex-shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-[#4A3C31] drop-shadow-sm">Manage Wallet</h2>
                <button onClick={() => setIsWalletOpen(false)} className="bg-white/40 p-2 rounded-full text-[#5E4D3F] hover:bg-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-[#5E4D3F] to-[#4A3C31] rounded-2xl p-5 text-white shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Current Balance</p>
                  <h3 className="text-4xl font-black drop-shadow-md flex items-center gap-1"><span className="text-2xl text-white/50">₹</span>{walletBalance}</h3>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-[#8C7A6B] text-sm uppercase tracking-wider drop-shadow-sm">Add Funds</h4>
                <div className="flex gap-2">
                  {[100, 250, 500].map(amt => (
                    <button 
                      key={amt} 
                      onClick={() => setAddAmount(amt.toString())}
                      className="flex-1 bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-xl py-2 font-black text-[#5E4D3F] hover:bg-white/60 transition-colors"
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[#8C7A6B]">₹</span>
                    <input 
                      type="number" 
                      value={addAmount} 
                      onChange={e => setAddAmount(e.target.value)}
                      placeholder="Custom amount" 
                      className="w-full bg-white/40 backdrop-blur-md border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-xl py-3 pl-8 pr-4 font-black text-[#4A3C31] text-base outline-none focus:border-[#C97A7E] focus:ring-2 focus:ring-[#C97A7E]/20 transition-all placeholder:text-[#8C7A6B]/50"
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const amt = parseInt(addAmount);
                      if(amt > 0) {
                        setPendingStripeAmount(amt);
                        setIsStripeModalOpen(true);
                      }
                    }}
                    disabled={!addAmount || parseInt(addAmount) <= 0}
                    className="bg-gradient-to-br from-[#C97A7E] to-[#B85C60] text-white px-6 rounded-xl font-black shadow-lg hover:from-[#B85C60] hover:to-[#A65357] disabled:opacity-50 transition-all active:scale-95 border border-white/30"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <h4 className="font-bold text-[#8C7A6B] text-sm uppercase tracking-wider mb-4 drop-shadow-sm">Recent Transactions</h4>
              {transactions.length === 0 ? (
                <p className="text-center text-[#8C7A6B] font-medium py-4">No transactions yet.</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map(t => (
                    <div key={t.id} className="flex justify-between items-center bg-white/30 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] border border-white/40 ${t.type === 'credit' ? 'bg-[#769C8A]/30 text-[#436456]' : 'bg-[#C97A7E]/30 text-[#A65357]'}`}>
                          {t.type === 'credit' ? '+' : '-'}
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3C31] text-sm drop-shadow-sm">{t.description}</p>
                          <p className="text-xs text-[#8C7A6B] font-medium">{new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>
                      <span className={`font-black drop-shadow-sm ${t.type === 'credit' ? 'text-[#5C7F6F]' : 'text-[#4A3C31]'}`}>
                        {t.type === 'credit' ? '+' : '-'}₹{t.amount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Points Modal */}
      {isPointsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsPointsOpen(false)}></div>
          <div className="relative bg-[#F2EAE0]/45 backdrop-blur-3xl backdrop-saturate-[1.5] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)] w-full max-w-lg rounded-3xl flex flex-col max-h-[85dvh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#DCD0B6]/50 bg-gradient-to-br from-[#E2B778]/20 to-[#C97A7E]/20 flex-shrink-0">
              <div className="flex justify-between items-start mb-2">
                <div className="bg-white/60 backdrop-blur-md border border-white/80 p-3 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-4xl">🦆</div>
                <button onClick={() => setIsPointsOpen(false)} className="bg-white/40 p-2 rounded-full text-[#5E4D3F] hover:bg-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              <h2 className="text-3xl font-black text-[#4A3C31] mt-2 mb-1 drop-shadow-sm">Puddles Points</h2>
              <p className="text-[#8C7A6B] font-bold text-sm drop-shadow-sm">Earn 1 point for every ₹10 spent!</p>
              
              <div className="mt-6 flex gap-3">
                <div className="flex-1 bg-white/40 backdrop-blur-md p-4 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60">
                  <p className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest mb-1 drop-shadow-sm">Current Balance</p>
                  <h3 className="text-3xl font-black text-[#B85C60] drop-shadow-md">{Math.floor(stats.totalSpent * 0.1) - pointsSpent}</h3>
                  <p className="text-xs font-bold text-[#A6978A] mt-1 drop-shadow-sm">= ₹{((Math.floor(stats.totalSpent * 0.1) - pointsSpent) * 0.05).toFixed(2)} value</p>
                </div>
                <div className="flex-1 bg-white/40 backdrop-blur-md p-4 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60">
                  <p className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-widest mb-1 drop-shadow-sm">Total Earned</p>
                  <h3 className="text-2xl font-black text-[#5E4D3F] drop-shadow-md">{Math.floor(stats.totalSpent * 0.1)}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {(() => {
                const currentPts = Math.floor(stats.totalSpent * 0.1) - pointsSpent;
                const valueInRupees = currentPts * 0.05;
                
                const affordable = stats.menuItems.filter(i => i.price <= valueInRupees).sort((a,b) => b.price - a.price).slice(0, 3);
                const closest = stats.menuItems.filter(i => i.price > valueInRupees).sort((a,b) => a.price - b.price)[0];

                return (
                  <div className="space-y-6">
                    {affordable.length > 0 && (
                      <div>
                        <h4 className="font-black text-[#4A3C31] flex items-center gap-2 mb-3 drop-shadow-sm">
                          <span className="text-xl">🎉</span> You can afford these for FREE!
                        </h4>
                        <div className="space-y-2">
                          {affordable.map(item => (
                            <div key={item.id} className="bg-white/40 backdrop-blur-md p-3 rounded-xl border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] flex justify-between items-center">
                              <span className="font-bold text-[#4A3C31] drop-shadow-sm">{item.name}</span>
                              <span className="bg-[#769C8A]/20 text-[#5C7F6F] px-2 py-1 rounded-lg text-xs font-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] border border-[#769C8A]/30">{item.price * 20} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {closest && (
                      <div className="bg-gradient-to-br from-[#4A3C31] to-[#3A2C21] text-white p-5 rounded-3xl relative overflow-hidden shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none"></div>
                        <h4 className="font-black flex items-center gap-2 mb-1 drop-shadow-md">
                          <span className="text-xl">🎯</span> Keep Earning!
                        </h4>
                        <p className="text-white/70 text-sm font-medium mb-4 drop-shadow-sm">You are almost at your next reward.</p>
                        
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md flex justify-between items-center mb-4 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                          <span className="font-bold drop-shadow-sm">{closest.name}</span>
                          <span className="text-sm font-black text-[#E2B778] drop-shadow-sm">₹{closest.price}</span>
                        </div>
                        
                        <div className="w-full bg-black/40 rounded-full h-2.5 mb-2 shadow-inner border border-white/5">
                          <div className="bg-gradient-to-r from-[#E2B778] to-[#D5A05B] h-2.5 rounded-full transition-all shadow-[0_0_10px_rgba(226,183,120,0.5)]" style={{width: `${Math.min(100, (valueInRupees / closest.price) * 100)}%`}}></div>
                        </div>
                        <p className="text-right text-xs font-bold text-white/50 tracking-wider">Only {Math.ceil((closest.price - valueInRupees) * 20)} pts left</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {/* Stripe Payment Gateway Modal */}
      <StripeCheckoutModal 
        isOpen={isStripeModalOpen}
        amount={pendingStripeAmount}
        onClose={() => setIsStripeModalOpen(false)}
        onSuccess={() => {
          setIsStripeModalOpen(false);
          setAddAmount('');
        }}
      />
    </div>
  );
}
