"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useProfileStore } from "@/store/useProfileStore";
import Fuse from "fuse.js";

export default function MenuList({ items }: { items: any[] }) {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("highlight");
  const { items: cartItems, addItem, updateQuantity, getTotalItems, getTotalPrice } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Extract unique categories and add "All" at the beginning
  const categories = useMemo(() => {
    const cats = new Set(items.map(item => item.category));
    return ["All", ...Array.from(cats)];
  }, [items]);

  const [activeCategory, setActiveCategory] = useState(categories[0] || "All");

  // Setup Fuse.js for fuzzy search
  const fuse = useMemo(() => new Fuse(items, {
    keys: ['name', 'category'],
    threshold: 0.3, // Allow typos
  }), [items]);

  const dietaryOptions = [
    { id: "veg", label: "Pure Veg 🥦", test: (item: any) => !/(chicken|egg|prawn|mutton|meat|omlet)/i.test(item.name) },
    { id: "nonveg", label: "Non-Veg 🍗", test: (item: any) => /(chicken|egg|prawn|mutton|meat|omlet)/i.test(item.name) },
    { id: "jain", label: "Jain (No Onion/Garlic) 🌿", test: (item: any) => !/(chicken|egg|prawn|mutton|meat|omlet|onion|garlic)/i.test(item.name) },
  ];

  const toggleFilters = [
    { id: "spicy", label: "Spicy 🌶️", test: (item: any) => /(schezwan|chilli|spicy|peri peri|masala)/i.test(item.name) },
    { id: "sweet", label: "Sweet Treats 🍫", test: (item: any) => /(sweet|chocolate|milkshake|juice|oreo)/i.test(item.name) },
  ];

  const { dietaryPreference: activeDietary, setDietaryPreference: setActiveDietary, toggles: activeToggles, toggleFilter } = useProfileStore();
  const [isDietaryMenuOpen, setIsDietaryMenuOpen] = useState(false);
  
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [isPriceMenuOpen, setIsPriceMenuOpen] = useState(false);
  const [activePriceLabel, setActivePriceLabel] = useState<string | null>(null);

  // Apply Search -> Filter -> Category -> Price
  const displayedItems = useMemo(() => {
    let results = items;

    // 1. Apply Fuzzy Search
    if (searchQuery.trim() !== "") {
      results = fuse.search(searchQuery).map(res => res.item);
    } else if (activeCategory !== "All") {
      // If no search and not "All", filter by category
      results = results.filter(item => item.category === activeCategory);
    }

    // 2. Apply Dietary Filter
    if (activeDietary) {
      const config = dietaryOptions.find(f => f.id === activeDietary);
      if (config) {
        results = results.filter(item => config.test(item));
      }
    }

    // 2.5 Apply Toggles (Multiple allowed)
    activeToggles.forEach(toggleId => {
      const config = toggleFilters.find(f => f.id === toggleId);
      if (config) {
        results = results.filter(item => config.test(item));
      }
    });

    // 3. Apply Price Filter
    if (minPrice !== "") {
      results = results.filter(item => item.price >= Number(minPrice));
    }
    if (maxPrice !== "") {
      results = results.filter(item => item.price <= Number(maxPrice));
    }

    return results;
  }, [items, searchQuery, activeCategory, activeDietary, activeToggles, minPrice, maxPrice, fuse, dietaryOptions, toggleFilters]);

  const handlePresetPrice = (min: string, max: string, label: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    setActivePriceLabel(label);
    setIsPriceMenuOpen(false);
  };

  const clearPriceFilter = () => {
    setMinPrice("");
    setMaxPrice("");
    setActivePriceLabel(null);
    setIsPriceMenuOpen(false);
  };

  // For smart empty state - trending items
  const trendingItems = useMemo(() => {
    const trendingNames = ["Veg Sandwich", "Chicken Frankie", "Cold Coffee"];
    return items.filter(item => trendingNames.includes(item.name));
  }, [items]);

  useEffect(() => {
    if (highlightedId) {
      setActiveCategory("All"); // Show all items so it's guaranteed to be visible
      setSearchQuery(""); // Clear search if any
      setActiveDietary(null);
      setActiveToggles([]);
      
      // Allow DOM to update first
      setTimeout(() => {
        const el = document.getElementById(`item-${highlightedId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [highlightedId]);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  // Helper to get quantity of an item in the cart
  const getItemQuantity = (id: number) => {
    const cartItem = cartItems.find(i => i.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="flex w-full h-full p-4 md:p-6 gap-6 relative font-sans text-[#4A3C31]">
      
      {/* Left Sidebar (Categories) */}
      <div className="hidden md:flex flex-col w-[260px] bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden flex-shrink-0">
        <div className="p-5 border-b border-[#CFBFA3]/50 bg-[#DCD0B6]/45">
          <h2 className="font-bold text-[#5E4D3F] tracking-wide uppercase text-xs">Categories</h2>
        </div>
        <div className="overflow-y-auto hide-scrollbar flex-1 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSearchQuery(""); 
              }}
              className={`w-full text-left px-5 py-4 border-b border-[#F7F5F0]/20 transition-all flex justify-between items-center ${
                activeCategory === cat && searchQuery === "" 
                  ? "bg-[#C97A7E]/20 border-l-4 border-l-rose-400 font-bold text-[#B85C60] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] relative z-10" 
                  : "text-[#5E4D3F] hover:bg-[#E5DCC5]/40 font-medium"
              }`}
            >
              <span className="text-sm tracking-wide">{cat}</span>
              {activeCategory === cat && searchQuery === "" && (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m9 18 6-6-6-6"/></svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Main Area (Items) */}
      <div className="flex-1 bg-[#F2EAE0]/45 backdrop-blur-xl backdrop-saturate-[1.5] rounded-3xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] overflow-hidden flex flex-col relative">
        
        {/* Sticky Search & Filters Header */}
        <div className="border-b border-[#CFBFA3]/40 bg-[#F2EAE0]/20 z-40 flex flex-col">
          <div className="p-4 md:p-5 pb-3 flex gap-3 items-center">
            <Link href="/" className="flex-shrink-0 bg-[#E5DCC5]/50 hover:bg-[#DCD0B6]/70 backdrop-blur-md backdrop-saturate-150 transition-colors p-3.5 rounded-2xl border border-white/50 text-[#5E4D3F] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </Link>
            <div className="relative w-full max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A8A296" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3.5 border border-white/40 rounded-2xl leading-5 bg-[#E5DCC5]/40 backdrop-blur-md backdrop-saturate-150 placeholder-[#A8A296] focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-[#F2EAE0]/70 transition-all text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),0_1px_1px_rgba(255,255,255,0.8)] font-bold text-[#5E4D3F]"
                placeholder="Search for Pizza, Sandwich, Dosa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Dietary & Price Filters Pill List */}
          <div className="px-4 md:px-5 pb-3 flex gap-2 flex-wrap items-center">
            
            {/* Dietary Preference Dropdown */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsDietaryMenuOpen(!isDietaryMenuOpen)}
                className={`flex items-center gap-1 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] ${
                  activeDietary
                    ? "bg-[#C97A7E] text-white border-[#C97A7E]/50 shadow-md"
                    : "bg-[#EBE6DD]/60 text-[#8C7A6B] border-white/50 hover:bg-[#E5DCC5]"
                }`}
              >
                {activeDietary ? dietaryOptions.find(d => d.id === activeDietary)?.label : "Dietary Preference 🍽️"}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isDietaryMenuOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {isDietaryMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-[#F2EAE0]/95 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl shadow-xl border border-white/60 z-50 p-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="font-bold text-[#5E4D3F] text-sm">Select Preference</span>
                    {activeDietary && (
                      <button onClick={() => { setActiveDietary(null); setIsDietaryMenuOpen(false); }} className="text-xs text-[#B85C60] font-bold hover:underline">Clear</button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dietaryOptions.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => { setActiveDietary(opt.id); setIsDietaryMenuOpen(false); }} 
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                          activeDietary === opt.id ? "bg-[#C97A7E]/20 text-[#B85C60]" : "text-[#5E4D3F] hover:bg-[#C97A7E]/10"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-white/60 mx-1 flex-shrink-0"></div>

            {/* Multiple Allowed Toggles */}
            {toggleFilters.map(f => (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] ${
                  activeToggles.includes(f.id)
                    ? "bg-[#C97A7E] text-white border-[#C97A7E]/50 shadow-md"
                    : "bg-[#EBE6DD]/60 text-[#8C7A6B] border-white/50 hover:bg-[#E5DCC5]"
                }`}
              >
                {f.label}
              </button>
            ))}
            
            {/* Price Filter Dropdown Toggle */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setIsPriceMenuOpen(!isPriceMenuOpen)}
                className={`flex items-center gap-1 whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] ${
                  activePriceLabel || minPrice || maxPrice
                    ? "bg-[#769C8A] text-white border-[#769C8A]/50 shadow-md"
                    : "bg-[#EBE6DD]/60 text-[#8C7A6B] border-white/50 hover:bg-[#E5DCC5]"
                }`}
              >
                {activePriceLabel || ((minPrice || maxPrice) ? `₹${minPrice || '0'} - ₹${maxPrice || '∞'}` : "Price Filter 💰")}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isPriceMenuOpen ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {/* Pop-up Menu */}
              {isPriceMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#F2EAE0]/95 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl shadow-xl border border-white/60 z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-[#5E4D3F] text-sm">Price Range</span>
                    {(minPrice || maxPrice || activePriceLabel) && (
                      <button onClick={clearPriceFilter} className="text-xs text-[#B85C60] font-bold hover:underline">Clear</button>
                    )}
                  </div>
                  
                  {/* Custom Range Inputs */}
                  <div className="flex items-center gap-2 mb-4">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setActivePriceLabel(null); }}
                      className="w-full bg-white/50 border border-white/60 rounded-lg px-2 py-1.5 text-sm text-[#4A3C31] outline-none focus:ring-2 focus:ring-[#769C8A]/50 placeholder-[#A8A296]"
                    />
                    <span className="text-[#A8A296] font-bold">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setActivePriceLabel(null); }}
                      className="w-full bg-white/50 border border-white/60 rounded-lg px-2 py-1.5 text-sm text-[#4A3C31] outline-none focus:ring-2 focus:ring-[#769C8A]/50 placeholder-[#A8A296]"
                    />
                  </div>

                  {/* Presets */}
                  <div className="space-y-1.5">
                    <button onClick={() => handlePresetPrice("0", "50", "Under ₹50 🪙")} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#5E4D3F] hover:bg-[#769C8A]/10 hover:text-[#5C7F6F] transition-colors">Under ₹50 🪙</button>
                    <button onClick={() => handlePresetPrice("50", "100", "₹50 - ₹100 💵")} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#5E4D3F] hover:bg-[#769C8A]/10 hover:text-[#5C7F6F] transition-colors">₹50 - ₹100 💵</button>
                    <button onClick={() => handlePresetPrice("100", "", "Above ₹100 💸")} className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold text-[#5E4D3F] hover:bg-[#769C8A]/10 hover:text-[#5C7F6F] transition-colors">Above ₹100 💸</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="md:hidden px-4 pb-3 flex gap-2 overflow-x-auto hide-scrollbar w-full relative">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setSearchQuery("");
                }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] ${
                  activeCategory === cat && searchQuery === ""
                    ? "bg-[#C97A7E] text-white border-[#C97A7E]/50 shadow-md"
                    : "bg-[#EBE6DD]/60 text-[#8C7A6B] border-white/50 hover:bg-[#E5DCC5]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-transparent">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#4A3C31] tracking-tight capitalize flex items-center gap-3">
              {searchQuery !== "" ? `Search Results for "${searchQuery}"` : activeCategory}
              {(activeDietary || activeToggles.length > 0 || minPrice || maxPrice || activePriceLabel) && <span className="text-sm font-bold text-[#B85C60] bg-[#C97A7E]/20 px-2 py-1 rounded-lg">Filtered</span>}
            </h2>
            <span className="bg-[#EBE6DD]/60 backdrop-blur-md backdrop-saturate-150 text-[#5E4D3F] text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
              {displayedItems.length} Items
            </span>
          </div>

          {displayedItems.length === 0 ? (
            <div className="flex flex-col items-center p-8 text-[#A6978A] bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-150 rounded-3xl border border-dashed border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)]">
              <div className="text-5xl mb-4 opacity-50">🍽️</div>
              <h3 className="text-xl font-black text-[#8C7A6B] mb-2">We couldn't find exactly that...</h3>
              <p className="text-sm text-[#A6978A] mb-6 text-center max-w-sm">Try loosening your search terms or dietary filters. Here are some trending items instead:</p>
              
              <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {trendingItems.map((item) => (
                  <div key={item.id} className="bg-white/40 p-4 rounded-2xl border border-white/60">
                    <h4 className="font-bold text-[#5E4D3F]">{item.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-black text-[#4A3C31]">₹{item.price}</span>
                      <button 
                        onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                        className="text-xs bg-[#769C8A]/20 text-[#5C7F6F] font-bold px-3 py-1.5 rounded-lg border border-white/50 hover:bg-[#769C8A]/30 transition-colors"
                      >
                        ADD +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedItems.map((item) => {
                const quantity = getItemQuantity(item.id);
                const isHighlighted = highlightedId === item.id.toString();
                return (
                <div 
                  key={item.id} 
                  id={`item-${item.id}`}
                  className={`backdrop-blur-xl backdrop-saturate-[1.5] p-5 rounded-3xl border flex flex-col justify-between transition-all duration-700 hover:-translate-y-1 group ${
                    isHighlighted 
                      ? "border-[#C97A7E] shadow-[0_0_20px_rgba(201,122,126,0.6),inset_0_1px_1px_rgba(255,255,255,1)] bg-[#C97A7E]/20 scale-[1.02] z-10" 
                      : "bg-[#F2EAE0]/45 border-white/40 hover:bg-[#F2EAE0]/60 shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)]"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className={`mt-1.5 w-3 h-3 rounded-sm border flex items-center justify-center flex-shrink-0 ${
                        /(chicken|egg|prawn|mutton|meat)/i.test(item.name) 
                          ? "border-[#C97A7E]/30" 
                          : "border-[#769C8A]/30"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          /(chicken|egg|prawn|mutton|meat)/i.test(item.name) 
                            ? "bg-[#C97A7E]" 
                            : "bg-[#769C8A]"
                        }`}></div>
                      </div>
                      <h3 className="font-bold text-[#5E4D3F] text-lg leading-tight flex-1">{item.name}</h3>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-[#4A3C31] font-black text-lg">₹{item.price}</p>
                      {item.rating ? (
                        <div className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-md border border-white/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
                          <span className="text-yellow-500 text-[10px]">⭐</span>
                          <span className="text-xs font-black text-[#5E4D3F]">{item.rating}</span>
                          <span className="text-[10px] font-bold text-[#8C7A6B]">({item.reviewsCount})</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-[#8C7A6B] uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md">New</span>
                      )}
                    </div>
                    
                    {item.out_of_stock && (
                      <span className="text-xs text-[#B85C60] font-bold mt-2 inline-block bg-[#C97A7E]/10 px-2 py-1 rounded border border-[#C97A7E]/30 uppercase tracking-wide shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                        Out of stock
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-5 pt-4 flex justify-end">
                    {item.out_of_stock ? (
                      <button disabled className="px-8 py-2.5 rounded-xl font-bold text-sm bg-[#DCD0B6]/50 text-[#8C7A6B] cursor-not-allowed border border-[#CFBFA3]/50">
                        UNAVAILABLE
                      </button>
                    ) : quantity > 0 ? (
                      // IN-PLACE INCREMENT / DECREMENT CONTROLS
                      <div className="flex items-center gap-4 bg-[#C97A7E]/10 border border-[#C97A7E]/30 rounded-xl px-2 py-1.5 shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F2EAE0] text-[#B85C60] font-black shadow-sm hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-95 transition-all text-lg"
                        >-</button>
                        <span className="font-black text-[#B85C60] w-4 text-center">{quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F2EAE0] text-[#B85C60] font-black shadow-sm hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-95 transition-all text-lg"
                        >+</button>
                      </div>
                    ) : (
                      // ADD BUTTON
                      <button 
                        onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
                        className="relative px-8 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 bg-[#F2EAE0] text-[#5C7F6F] border border-[#CFBFA3] hover:border-[#769C8A]/30 hover:bg-[#769C8A]/10 shadow-sm"
                      >
                        ADD
                        <span className="absolute -top-2 -right-2 bg-[#F2EAE0] text-[#5C7F6F] border border-[#769C8A]/30 text-xs w-6 h-6 flex items-center justify-center rounded-full font-black shadow-sm">
                          +
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
          
          {/* Bottom Padding for floating cart */}
          <div className="h-28"></div> 
        </div>
      </div>

      {/* Floating Action Button (Cart) */}
      {totalItems > 0 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-xl z-30 animate-in slide-in-from-bottom-10 fade-in duration-300 px-4">
          <Link href="/cart" className="w-full bg-[#C97A7E] text-[#F2EAE0] p-4 md:p-5 rounded-2xl font-bold shadow-2xl hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-[0.98] transition-all flex justify-between items-center border border-[#C97A7E]/30">
            <div className="flex flex-col items-start leading-tight drop-shadow-sm">
              <span className="text-xs md:text-sm text-[#F2EAE0]/90 uppercase tracking-widest font-black">{totalItems} item{totalItems !== 1 ? 's' : ''} added</span>
              <span className="text-lg md:text-xl font-black">View cart • ₹{totalPrice}</span>
            </div>
            <span className="flex items-center gap-2 bg-[#F2EAE0] text-[#D58588] px-5 py-3 rounded-xl md:text-base font-black shadow-sm">
              Checkout 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
