"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Fuse from "fuse.js";

export default function GlobalSearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();

  // Handle Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && menuItems.length === 0) {
      const fetchData = async () => {
        // Fetch Menu
        const { data: menuData } = await supabase.from('menu_items').select('*');
        if (menuData) setMenuItems(menuData);

        // Fetch User's Orders
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('id, items, created_at, status')
            .eq('user_id', session.user.id);
          if (orderData) setOrders(orderData);
        }
      };
      fetchData();
    }
  }, [isOpen, menuItems.length]);

  // Setup Fuse instances
  const menuFuse = useMemo(() => new Fuse(menuItems, { keys: ['name', 'category'], threshold: 0.3 }), [menuItems]);
  const orderFuse = useMemo(() => new Fuse(orders, { keys: ['id', 'items'], threshold: 0.3 }), [orders]);

  // Search Results
  const menuResults = useMemo(() => query ? menuFuse.search(query).map(r => r.item).slice(0, 5) : [], [query, menuFuse]);
  const orderResults = useMemo(() => query ? orderFuse.search(query).map(r => r.item).slice(0, 3) : [], [query, orderFuse]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4 sm:px-6 font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
      
      <div className="relative w-full max-w-2xl bg-[#F2EAE0]/90 backdrop-blur-2xl backdrop-saturate-150 rounded-3xl shadow-2xl overflow-hidden border border-white/50 animate-in fade-in slide-in-from-top-4 duration-200">
        
        {/* Search Input */}
        <div className="p-4 border-b border-white/30 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            autoFocus
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-xl font-bold text-[#4A3C31] placeholder-[#A8A296]"
            placeholder="Search menu or past orders..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={() => setIsOpen(false)} className="text-xs bg-white/40 px-2 py-1 rounded text-[#8C7A6B] font-bold border border-white/50 shadow-inner">ESC</button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2 hide-scrollbar">
          {!query && (
            <div className="p-8 text-center text-[#A6978A]">
              <p className="font-bold">Start typing to search globally.</p>
              <p className="text-sm mt-1">Search for items like "Dosa" or order IDs.</p>
            </div>
          )}

          {query && menuResults.length === 0 && orderResults.length === 0 && (
            <div className="p-8 text-center text-[#8C7A6B] font-bold">
              No results found for "{query}".
            </div>
          )}

          {/* Menu Results */}
          {menuResults.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 py-2 text-xs font-black text-[#A6978A] uppercase tracking-widest">Menu Items</h3>
              {menuResults.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/menu?highlight=${item.id}`);
                  }}
                  className="w-full flex justify-between items-center px-4 py-3 hover:bg-white/40 rounded-xl transition-colors text-left"
                >
                  <div>
                    <h4 className="font-bold text-[#4A3C31]">{item.name}</h4>
                    <p className="text-xs text-[#8C7A6B]">{item.category}</p>
                  </div>
                  <span className="font-black text-[#B85C60]">₹{item.price}</span>
                </button>
              ))}
            </div>
          )}

          {/* Order Results */}
          {orderResults.length > 0 && (
            <div>
              <h3 className="px-4 py-2 text-xs font-black text-[#A6978A] uppercase tracking-widest">Past Orders</h3>
              {orderResults.map(order => (
                <button
                  key={order.id}
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/orders`);
                  }}
                  className="w-full flex justify-between items-center px-4 py-3 hover:bg-white/40 rounded-xl transition-colors text-left"
                >
                  <div>
                    <h4 className="font-bold text-[#4A3C31]">Order #{order.id}</h4>
                    <p className="text-xs text-[#8C7A6B] truncate max-w-xs">{order.items.join(', ')}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${
                    order.status === 'completed' ? 'bg-[#DCD0B6] text-[#4A3C31]' : 'bg-[#C97A7E]/20 text-[#B85C60]'
                  }`}>
                    {order.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
