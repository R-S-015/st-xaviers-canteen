"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function KitchenInventoryManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
        
      if (data) setItems(data);
      setLoading(false);
    };
    
    fetchItems();
  }, []);

  const toggleOutOfStock = async (id: number, currentStatus: boolean) => {
    // Optimistic UI Update
    setItems(items.map(item => 
      item.id === id ? { ...item, out_of_stock: !currentStatus } : item
    ));

    // Supabase Update
    const { error } = await supabase
      .from('menu_items')
      .update({ out_of_stock: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error("Failed to update stock status", error);
      alert("Failed to update stock status.");
      // Revert on error
      setItems(items.map(item => 
        item.id === id ? { ...item, out_of_stock: currentStatus } : item
      ));
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[100dvh] bg-transparent font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#2D2A26]/80 backdrop-blur-xl backdrop-saturate-150 text-[#F2EAE0] p-4 flex justify-between items-center z-10 sticky top-0 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] border-b border-white/10">
        <div className="flex items-center gap-4">
          <Link href="/kitchen" className="text-[#F2EAE0] hover:text-[#C97A7E] transition-colors p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h1 className="text-xl font-black tracking-wide flex items-center gap-2 drop-shadow-sm">
            <span className="text-2xl">📦</span> Inventory Manager
          </h1>
        </div>
        <Link href="/" className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-white/20 shadow-sm">
          Student View
        </Link>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto w-full flex-1">
        
        {/* Search Bar */}
        <div className="mb-6 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#8C7A6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text" 
            placeholder="Search items to mark out of stock..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[#F2EAE0]/60 backdrop-blur-md border border-white/50 text-[#4A3C31] placeholder-[#A6978A] font-bold outline-none focus:ring-2 focus:ring-[#769C8A]/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_1px_1px_rgba(255,255,255,0.8)] transition-all text-lg"
          />
        </div>

        {/* Inventory Grid */}
        {loading ? (
          <div className="text-center font-bold text-[#8C7A6B] py-10">Loading inventory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] border p-5 rounded-3xl flex justify-between items-center transition-all shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,0.8)] ${
                  item.out_of_stock ? 'border-[#C97A7E]/50 bg-[#C97A7E]/20' : 'border-white/40'
                }`}
              >
                <div>
                  <h3 className={`font-black text-lg drop-shadow-sm ${item.out_of_stock ? 'text-[#B85C60] line-through' : 'text-[#4A3C31]'}`}>
                    {item.name}
                  </h3>
                  <p className="text-[#8C7A6B] font-bold text-sm uppercase tracking-wider mt-0.5">{item.category} • ₹{item.price}</p>
                </div>
                
                {/* Toggle Switch */}
                <button
                  onClick={() => toggleOutOfStock(item.id, item.out_of_stock)}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors border shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#F2EAE0] focus:ring-[#C97A7E] ${
                    item.out_of_stock ? 'bg-[#C97A7E] border-[#B85C60]' : 'bg-[#769C8A] border-[#5C7F6F]'
                  }`}
                  aria-pressed={item.out_of_stock}
                >
                  <span className="sr-only">Mark {item.out_of_stock ? 'in stock' : 'out of stock'}</span>
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-md ${
                      item.out_of_stock ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
