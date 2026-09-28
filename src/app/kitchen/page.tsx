"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [pinPrompt, setPinPrompt] = useState<{orderId: number, expectedPin: string} | null>(null);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    // 1. Fetch the existing active orders when the page loads
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .not('status', 'in', '("completed","cancelled")')
        .order('id', { ascending: true });
      
      if (data) setOrders(data);
    };
    
    fetchOrders();

    // 2. Subscribe to NEW and UPDATED orders in Real-Time!
    const channel = supabase
      .channel(`realtime-orders-${Math.random()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          // Whenever a new order is inserted in the DB, it pops up here instantly!
          setOrders((currentOrders) => [...currentOrders, payload.new]);
          
          // Play sound alert
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.play().catch((e) => {
            console.warn("Audio autoplay blocked by browser. User must interact with document first.", e);
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          // If a student cancels the order, remove it from the kitchen view instantly!
          if (payload.new.status === 'cancelled') {
            setOrders((currentOrders) => currentOrders.filter(o => o.id !== payload.new.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setIsLive(true);
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const executeStatusUpdate = async (id: number, newStatus: string) => {
    // Optimistically update the screen instantly
    if (newStatus === "completed") {
      setOrders(currentOrders => currentOrders.filter(o => o.id !== id));
    } else {
      setOrders(currentOrders => currentOrders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }

    // Update the database in the background
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);

    // Trigger an Email Notification! (Fire and forget)
    if (newStatus === "ready" || newStatus === "preparing") {
      fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: newStatus })
      }).catch(err => console.error("Failed to trigger email API:", err));
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    // 1. Verification Step for Handover
    const order = orders.find(o => o.id === id);
    if (newStatus === "completed" && order?.pickup_pin) {
      setPinPrompt({ orderId: id, expectedPin: order.pickup_pin });
      setEnteredPin("");
      setPinError("");
      return; // Abort, let modal handle it
    }

    executeStatusUpdate(id, newStatus);
  };

  const renderOrderCard = (order: any, nextStatus: string, actionText: string, actionColor: string, isUrgent: boolean = false) => {
    // Calculate how long ago the order was placed
    const orderTime = new Date(order.created_at);
    const timeString = orderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div key={order.id} className={`bg-[#F2EAE0]/70 backdrop-blur-xl rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.04),inset_0_1px_1px_rgba(255,255,255,1)] border-l-8 p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 ${isUrgent ? 'border-l-rose-400' : 'border-l-[#A6978A]'} border-t border-r border-b border-white/60`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-3xl font-mono text-[#4A3C31] drop-shadow-sm">#{order.id}</h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-lg mt-2 inline-block uppercase tracking-wider shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] ${
              order.pickup_type.includes("ASAP") ? "bg-rose-100 text-[#B85C60]" : "bg-white/50 text-[#8C7A6B]"
            }`}>
              {order.pickup_type}
            </span>
          </div>
          <span className="text-[#A6978A] text-xs font-bold bg-white/40 shadow-inner px-2 py-1 rounded-lg">{timeString}</span>
        </div>
        
        <div className="border-t-2 border-dashed border-white/60"></div>
        
        <ul className="text-sm font-bold text-[#5E4D3F] space-y-1.5 drop-shadow-sm">
          {order.items.map((item: string, i: number) => (
            <li key={i} className="flex gap-2">
              <span className="text-[#A6978A]">•</span> {item}
            </li>
          ))}
        </ul>
        
        <button 
          onClick={() => updateStatus(order.id, nextStatus)}
          className={`w-full mt-2 py-3 rounded-xl font-black text-sm transition-transform active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.05),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 ${actionColor}`}
        >
          {actionText}
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-transparent font-sans flex flex-col overflow-hidden">
      
      {/* Top Navbar */}
      <header className="bg-[#2D2A26]/80 backdrop-blur-xl backdrop-saturate-150 text-[#F2EAE0] p-4 flex justify-between items-center z-10 flex-shrink-0 shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.1)] border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black tracking-wide flex items-center gap-2 drop-shadow-sm">
            <span className="text-2xl">👨‍🍳</span> Kitchen Display
          </h1>
          {isLive ? (
            <div className="bg-[#769C8A]/30 backdrop-blur-md text-[#83C5BE] border border-[#83C5BE]/30 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-inner">
              <span className="w-2 h-2 bg-[#83C5BE] rounded-full animate-ping"></span>
              Live Sync Active
            </div>
          ) : (
            <div className="bg-[#C97A7E]/30 backdrop-blur-md text-rose-300 border border-rose-400/30 text-xs font-bold px-3 py-1.5 rounded-lg shadow-inner">
              Connecting...
            </div>
          )}
          
          <button 
            onClick={() => {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0;
              audio.play().catch(() => {});
              alert("Audio alerts enabled!");
            }}
            className="ml-2 bg-[#C97A7E]/20 text-[#C97A7E] border border-[#C97A7E]/30 hover:bg-[#C97A7E]/40 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            🔔 Enable Alerts
          </button>
        </div>
        <div className="flex gap-3">
          <Link href="/kitchen/admin" className="bg-gradient-to-r from-[#769C8A] to-[#5C7F6F] hover:from-[#5C7F6F] hover:to-[#436456] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-white/20 shadow-lg text-white">
            📊 Admin Dashboard
          </Link>
          <Link href="/" className="bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-white/20 shadow-sm hidden md:block">
            Student View
          </Link>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Column 1: New Orders */}
        <div className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-[1.3] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5 px-2">
            <h2 className="font-black text-[#5E4D3F] uppercase tracking-widest text-sm drop-shadow-sm">Incoming (To Prep)</h2>
            <span className="bg-[#F2EAE0]/80 backdrop-blur-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/60 text-[#4A3C31] font-black rounded-xl w-8 h-8 flex items-center justify-center text-sm">
              {orders.filter(o => o.status === "new").length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar pb-10">
            {orders.filter(o => o.status === "new").map(order => 
              renderOrderCard(order, "preparing", "Start Preparing", "bg-white/60 text-blue-700 hover:bg-white", true)
            )}
          </div>
        </div>

        {/* Column 2: Preparing */}
        <div className="bg-[#DCD0B6]/30 backdrop-blur-xl backdrop-saturate-[1.3] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5 px-2">
            <h2 className="font-black text-blue-900 uppercase tracking-widest text-sm drop-shadow-sm">Preparing</h2>
            <span className="bg-blue-200/80 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-blue-900 font-black rounded-xl w-8 h-8 flex items-center justify-center text-sm">
              {orders.filter(o => o.status === "preparing").length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar pb-10">
            {orders.filter(o => o.status === "preparing").map(order => 
              renderOrderCard(order, "ready", "Mark Ready (Ping User)", "bg-white/60 text-[#5C7F6F] hover:bg-[#769C8A]/20")
            )}
          </div>
        </div>

        {/* Column 3: Ready for Pickup */}
        <div className="bg-[#769C8A]/30 backdrop-blur-xl backdrop-saturate-[1.3] border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] rounded-3xl p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-5 px-2">
            <h2 className="font-black text-[#2D2A26] uppercase tracking-widest text-sm drop-shadow-sm">Ready For Pickup</h2>
            <span className="bg-emerald-200/80 backdrop-blur-sm border border-white/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] text-emerald-900 font-black rounded-xl w-8 h-8 flex items-center justify-center text-sm">
              {orders.filter(o => o.status === "ready").length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 hide-scrollbar pb-10">
            {orders.filter(o => o.status === "ready").map(order => 
              renderOrderCard(order, "completed", "Verify & Handover", "bg-[#2D2A26]/80 text-[#F2EAE0] hover:bg-[#4A443B]/90")
            )}
          </div>
        </div>

      </main>

      {/* PIN Verification Modal */}
      {pinPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setPinPrompt(null)}></div>
          <div className="relative bg-[#F2EAE0]/80 backdrop-blur-2xl backdrop-saturate-[1.5] border border-white/60 shadow-[0_32px_64px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,1)] w-full max-w-sm rounded-3xl p-8 flex flex-col items-center animate-in zoom-in-95 duration-200">
            
            <div className="w-16 h-16 bg-[#C97A7E]/20 text-[#B85C60] rounded-full flex items-center justify-center mb-4 border border-[#C97A7E]/30 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            
            <h2 className="text-2xl font-black text-[#4A3C31] drop-shadow-sm text-center mb-2">Secure Handover</h2>
            <p className="text-sm text-[#8C7A6B] font-bold text-center mb-6">Ask the student for their 4-digit pickup PIN for <span className="text-[#B85C60]">Order #{pinPrompt.orderId}</span></p>
            
            <input 
              type="text"
              autoFocus
              maxLength={4}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError("");
              }}
              className="w-full text-center text-4xl font-black tracking-[0.3em] py-4 rounded-2xl bg-white/50 border border-white/80 outline-none focus:ring-4 focus:ring-[#C97A7E]/30 text-[#4A3C31] shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] placeholder:text-[#A6978A]/30 mb-2"
              placeholder="••••"
            />
            
            <div className="h-6 w-full text-center mb-4">
              {pinError && <p className="text-sm font-bold text-rose-500 animate-pulse">{pinError}</p>}
            </div>
            
            <div className="flex gap-3 w-full">
              <button 
                onClick={() => setPinPrompt(null)}
                className="flex-1 py-3.5 rounded-xl font-bold text-[#8C7A6B] bg-white/40 border border-white/60 hover:bg-white/60 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (enteredPin === pinPrompt.expectedPin) {
                    executeStatusUpdate(pinPrompt.orderId, "completed");
                    setPinPrompt(null);
                  } else {
                    setPinError("Incorrect PIN");
                  }
                }}
                className="flex-1 py-3.5 rounded-xl font-black text-[#F2EAE0] bg-[#4A3C31] hover:bg-[#5E4D3F] border border-[#3A2C21] transition-colors shadow-lg active:scale-95"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
