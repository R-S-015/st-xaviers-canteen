"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function Cart() {
  const { items, updateQuantity, getTotalPrice } = useCartStore();
  const [pickupTime, setPickupTime] = useState("ASAP");

  const subtotal = getTotalPrice();
  const convenienceFee = items.length > 0 ? 2 : 0;
  const total = subtotal + convenienceFee;

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="w-24 h-24 bg-[#EBE6DD] text-[#8C7A6B] rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm border border-[#CFBFA3]">🛒</div>
        <h2 className="text-2xl font-black text-[#4A3C31] mb-2 tracking-tight">Your cart is empty</h2>
        <p className="text-[#8C7A6B] mb-8 font-medium">Looks like you haven't added anything yet.</p>
        <Link href="/" className="bg-[#C97A7E] text-[#F2EAE0] font-bold py-3.5 px-8 rounded-2xl hover:bg-[#B85C60] hover:text-[#F2EAE0] transition-colors shadow-md border border-[#C97A7E]/30">
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-transparent text-[#4A3C31] pb-32 font-sans">
      {/* Header */}
      {/* Header */}
      <header className="bg-[#DCD0B6]/30 backdrop-blur-md backdrop-saturate-150 shadow-sm p-4 sticky top-0 z-10 flex items-center gap-4 border-b border-white/30">
        <Link href="/" className="text-[#5E4D3F] hover:text-[#4A3C31] transition-colors p-2 -ml-2 rounded-full hover:bg-white/20 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-xl font-black tracking-tight text-[#4A3C31] drop-shadow-sm">Your Cart</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 max-w-lg mx-auto space-y-6 mt-2">
        
        {/* Cart Items */}
        <section className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-[1.3] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 p-5 space-y-5">
          <h2 className="font-bold text-[#8C7A6B] text-xs uppercase tracking-widest drop-shadow-sm">Order Items</h2>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center group">
              <div className="flex-1 pr-4">
                <h3 className="font-bold text-[#4A3C31] text-lg leading-tight">{item.name}</h3>
                <p className="text-[#8C7A6B] font-bold text-sm mt-0.5 drop-shadow-sm">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-4 bg-white/20 border border-white/40 rounded-xl p-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F2EAE0]/80 text-[#B85C60] font-black shadow-sm hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-95 transition-all"
                >-</button>
                <span className="font-black text-[#B85C60] w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#F2EAE0]/80 text-[#B85C60] font-black shadow-sm hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-95 transition-all"
                >+</button>
              </div>
            </div>
          ))}
          <Link href="/" className="block text-center text-[#5C7F6F] bg-[#769C8A]/20 backdrop-blur-sm border border-white/50 rounded-xl text-sm font-bold mt-4 py-3 hover:bg-[#769C8A]/80 hover:text-white transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]">
            + Add more items
          </Link>
        </section>

        {/* Scheduling */}
        <section className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-[1.3] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 p-5 space-y-4">
          <h2 className="font-bold text-[#8C7A6B] text-xs uppercase tracking-widest drop-shadow-sm">Pickup Time</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-colors backdrop-blur-sm ${
              pickupTime.startsWith("ASAP") ? "border-white/60 bg-[#C97A7E]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" : "border-white/30 bg-white/10 hover:bg-white/20"
            }`}>
              <input type="radio" name="pickupTime" checked={pickupTime.startsWith("ASAP")} onChange={() => setPickupTime("ASAP")} className="hidden" />
              <div className="flex flex-col">
                <span className={`font-black ${pickupTime.startsWith("ASAP") ? "text-[#B85C60]" : "text-[#4A3C31]"}`}>ASAP</span>
                <span className={`text-xs font-bold mt-1 ${pickupTime.startsWith("ASAP") ? "text-[#B85C60]" : "text-[#8C7A6B]"}`}>15-20 mins</span>
              </div>
            </label>
            
            <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-colors backdrop-blur-sm ${
              !pickupTime.startsWith("ASAP") ? "border-white/60 bg-[#C97A7E]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" : "border-white/30 bg-white/10 hover:bg-white/20"
            }`}>
              <input type="radio" name="pickupTime" checked={!pickupTime.startsWith("ASAP")} onChange={() => setPickupTime("Scheduled: 13:00")} className="hidden" />
              <div className="flex flex-col">
                <span className={`font-black ${!pickupTime.startsWith("ASAP") ? "text-[#B85C60]" : "text-[#4A3C31]"}`}>Schedule</span>
                <span className={`text-xs font-bold mt-1 ${!pickupTime.startsWith("ASAP") ? "text-[#B85C60]" : "text-[#8C7A6B]"}`}>Select time</span>
              </div>
            </label>
          </div>

          {!pickupTime.startsWith("ASAP") && (
            <div className="mt-4 p-5 bg-[#C97A7E]/20 backdrop-blur-md rounded-2xl border border-white/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-bold text-[#B85C60] mb-2 drop-shadow-sm">When do you want to pick it up?</label>
              <div className="flex items-center gap-3 bg-white/40 backdrop-blur-sm p-2 rounded-xl border border-white/50 shadow-inner focus-within:ring-2 focus-within:ring-[#C97A7E] focus-within:border-[#C97A7E] transition-all">
                <span className="text-xl pl-2 opacity-80">⏰</span>
                <input 
                  type="time" 
                  className="w-full p-2 bg-transparent text-[#4A3C31] font-black text-lg focus:outline-none appearance-none cursor-pointer"
                  value={pickupTime.replace("Scheduled: ", "")}
                  onChange={(e) => setPickupTime(`Scheduled: ${e.target.value}`)}
                  required
                />
              </div>
              
              {(() => {
                const time = pickupTime.replace("Scheduled: ", "");
                if (!time) return null;
                const [h, m] = time.split(":").map(Number);
                const totalMins = h * 60 + m;
                
                // 10:30 AM (630) to 12:00 PM (720) OR 2:00 PM (840) to 3:00 PM (900)
                const isRushHour = (totalMins >= 630 && totalMins <= 720) || (totalMins >= 840 && totalMins <= 900);
                
                return isRushHour ? (
                  <div className="mt-3 bg-[#B85C60]/20 backdrop-blur-sm border border-white/40 rounded-lg p-2.5 flex items-start gap-2 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                    <span className="text-lg">🔥</span>
                    <p className="text-xs font-bold text-[#B85C60] leading-snug drop-shadow-sm">
                      You've selected a Campus Rush Hour! Expect slightly longer wait times as the kitchen gets busy.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-[#8C7A6B] mt-3 flex items-center gap-1 drop-shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Food will be prepared exactly for this time.
                  </p>
                );
              })()}
            </div>
          )}
        </section>

        {/* Bill Details */}
        <section className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-[1.3] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 p-5 space-y-3 text-sm">
          <h2 className="font-bold text-[#8C7A6B] text-xs uppercase tracking-widest mb-3 drop-shadow-sm">Bill Summary</h2>
          <div className="flex justify-between text-[#5E4D3F] font-bold">
            <span>Item Total</span>
            <span className="font-black text-[#4A3C31]">₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-[#5E4D3F] font-bold">
            <span>Convenience Fee</span>
            <span className="font-black text-[#4A3C31]">₹{convenienceFee}</span>
          </div>
          <div className="border-t border-dashed border-white/60 my-3"></div>
          <div className="flex justify-between font-black text-xl text-[#4A3C31] items-end drop-shadow-sm">
            <span>Grand Total</span>
            <span className="text-2xl text-[#B85C60]">₹{total}</span>
          </div>
        </section>

      </main>

      {/* Floating Checkout Button */}
      <div className="fixed bottom-0 left-0 w-full bg-[#F2EAE0]/60 backdrop-blur-xl backdrop-saturate-[1.5] border-t border-white/50 p-4 z-20 pb-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#5E4D3F] uppercase tracking-widest drop-shadow-sm">Total to pay</span>
            <span className="text-2xl font-black text-[#4A3C31] drop-shadow-sm">₹{total}</span>
          </div>
          <Link href={`/checkout?type=${pickupTime}`} className="flex-1 bg-[#C97A7E]/90 backdrop-blur-md text-[#F2EAE0] py-4 px-6 rounded-2xl font-black shadow-[0_8px_16px_rgba(201,122,126,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)] hover:bg-[#B85C60] hover:text-[#F2EAE0] active:scale-[0.98] transition-all flex justify-center items-center gap-2 border border-white/30 text-lg tracking-wide">
            Proceed to Pay
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
