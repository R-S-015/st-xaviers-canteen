"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeaderAuth from "@/components/HeaderAuth";
import { useCartStore } from "@/store/useCartStore";

export default function HomeDashboard() {
  const { addItem, items: cartItems } = useCartStore();
  const [user, setUser] = useState<any>(null);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Get User
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. Fetch Last Order
      if (currentUser) {
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (orders && orders.length > 0) {
          setLastOrder(orders[0]);
        }
      }

      // 3. Fetch Popular Items (Hardcoding some names for aesthetic display, then querying them)
      const popularNames = ["Veg Sandwich", "Sada Dosa", "Chicken Biryani", "Cold Coffee"];
      const { data: popData } = await supabase
        .from('menu_items')
        .select('*')
        .in('name', popularNames);
      
      if (popData) setPopularItems(popData);

      // 4. Fetch unique categories (we can just fetch all and extract)
      const { data: allItems } = await supabase.from('menu_items').select('category');
      if (allItems) {
        const cats = new Set(allItems.map(i => i.category));
        setCategories(Array.from(cats));
      }

      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="min-h-[100dvh] bg-transparent flex items-center justify-center font-bold text-[#8C7A6B]">Loading your dashboard...</div>;
  }

  // Get name from email if possible
  const displayName = user?.email?.split('@')[0] || "Guest";

  return (
    <div className="min-h-[100dvh] bg-transparent text-[#4A3C31] flex flex-col font-sans pb-24">
      <header className="bg-[#DCD0B6]/30 backdrop-blur-md backdrop-saturate-150 shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center border-b border-white/30">
        <h1 className="text-xl font-black text-[#B85C60] flex items-center gap-2 tracking-tight">
          <span className="text-2xl">🍱</span> Canteen Connect
        </h1>
        <HeaderAuth />
      </header>

      <main className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-10">
        
        {/* Welcome Section */}
        <section className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] p-8 md:p-10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-[#4A3C31] mb-2 tracking-tight drop-shadow-sm">
              Hello, <span className="text-[#B85C60] capitalize">{displayName}</span>! 👋
            </h2>
            <p className="text-lg font-bold text-[#8C7A6B] mb-8 max-w-md leading-snug drop-shadow-sm">
              Skip the queue. Order your favorite canteen food right from your desk.
            </p>
            <Link href="/menu" className="inline-block bg-[#C97A7E]/90 backdrop-blur-md text-[#F2EAE0] font-black py-4 px-10 rounded-2xl hover:bg-[#B85C60] active:scale-[0.98] transition-all shadow-lg tracking-wide text-lg border border-[#B85C60]/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
              Browse Full Menu
            </Link>
          </div>
          {/* Abstract Deco */}
          <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10 blur-sm pointer-events-none transform rotate-12 drop-shadow-lg">🍔</div>
        </section>

        {/* Quick Reorder (Last Order) */}
        {lastOrder && (
          <section className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-4 px-2">
              <h3 className="font-black text-xl text-[#5E4D3F] uppercase tracking-widest drop-shadow-sm">Order Again</h3>
            </div>
            <div className="bg-[#DCD0B6]/45 backdrop-blur-xl backdrop-saturate-[1.5] p-6 rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-2">Last ordered on {new Date(lastOrder.created_at).toLocaleDateString()}</p>
                <ul className="text-sm font-black text-[#4A3C31] space-y-1">
                  {lastOrder.items.slice(0, 3).map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                  {lastOrder.items.length > 3 && <li className="text-[#8C7A6B]">+{lastOrder.items.length - 3} more items...</li>}
                </ul>
              </div>
              <Link href="/menu" className="bg-[#F2EAE0]/60 backdrop-blur-md text-[#4A3C31] px-6 py-3 rounded-xl font-bold border border-white/50 hover:bg-[#F2EAE0]/80 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] whitespace-nowrap">
                Remix Order
              </Link>
            </div>
          </section>
        )}

        {/* Popular Items */}
        {popularItems.length > 0 && (
          <section>
            <h3 className="font-black text-xl text-[#5E4D3F] uppercase tracking-widest mb-4 px-2 drop-shadow-sm">Campus Favorites</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularItems.map((item) => {
                const isInCart = cartItems.some(i => i.id === item.id);
                return (
                  <div key={item.id} className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] p-5 rounded-3xl border border-white/40 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-[#F2EAE0]/60 hover:-translate-y-1 flex flex-col justify-between transition-all group relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl -mr-10 -mt-10 opacity-40 ${
                      /(chicken|egg|mutton|prawn)/i.test(item.name) ? 'bg-red-400' : 'bg-emerald-400'
                    }`}></div>
                    
                    <div className="relative z-10 mb-6">
                      <h4 className="font-black text-lg text-[#4A3C31] leading-tight mb-1">{item.name}</h4>
                      <p className="font-bold text-[#8C7A6B]">₹{item.price}</p>
                    </div>

                    <div className="relative z-10">
                      {isInCart ? (
                        <Link href="/cart" className="block text-center w-full bg-[#769C8A]/45 backdrop-blur-md text-[#5C7F6F] font-black py-2.5 rounded-xl border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
                          Added to Cart ✓
                        </Link>
                      ) : (
                        <button 
                          disabled={item.out_of_stock}
                          onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                          className={`w-full py-2.5 rounded-xl font-black transition-all active:scale-95 ${
                            !item.out_of_stock 
                            ? "bg-[#F2EAE0]/60 backdrop-blur-md text-[#769C8A] border border-white/60 hover:bg-[#F2EAE0]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]" 
                            : "bg-transparent text-[#A6978A] cursor-not-allowed border-transparent"
                          }`}
                        >
                          {!item.out_of_stock ? "ADD" : "OUT OF STOCK"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Categories Grid */}
        <section>
          <div className="flex justify-between items-end mb-4 px-2">
            <h3 className="font-black text-xl text-[#5E4D3F] uppercase tracking-widest drop-shadow-sm">Explore Categories</h3>
            <Link href="/menu" className="text-sm font-bold text-[#C97A7E] hover:underline drop-shadow-sm">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.slice(0, 8).map(cat => (
              <Link href="/menu" key={cat} className="bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] p-4 rounded-2xl border border-white/40 text-center hover:bg-[#F2EAE0]/60 transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1 flex flex-col items-center justify-center gap-2 h-28 group">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.includes("Juice") || cat.includes("Beverage") ? "🍹" : 
                   cat.includes("Chinese") ? "🍜" : 
                   cat.includes("Pizza") ? "🍕" : 
                   cat.includes("Sandwich") ? "🥪" : "🍽️"}
                </span>
                <span className="font-bold text-[#4A3C31] text-xs uppercase tracking-wider">{cat}</span>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Floating Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#4A3C31]/80 backdrop-blur-xl text-[#F2EAE0] p-2 rounded-full shadow-[0_12px_32px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10 flex items-center gap-2 z-50">
        <Link href="/" className="px-6 py-2.5 rounded-full bg-[#5E4D3F] font-black text-sm transition-colors">Home</Link>
        <Link href="/menu" className="px-6 py-2.5 rounded-full hover:bg-[#5E4D3F] font-bold text-sm text-[#A6978A] hover:text-[#F2EAE0] transition-colors">Menu</Link>
        <Link href="/orders" className="px-6 py-2.5 rounded-full hover:bg-[#5E4D3F] font-bold text-sm text-[#A6978A] hover:text-[#F2EAE0] transition-colors">Orders</Link>
      </div>

    </div>
  );
}
