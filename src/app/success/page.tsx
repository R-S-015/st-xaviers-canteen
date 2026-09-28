"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = React.useState<any>(null);

  React.useEffect(() => {
    if (!orderId) return;

    // 1. Fetch the initial order state
    const fetchOrder = async () => {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (data) setOrder(data);
    };
    fetchOrder();

    // 2. Subscribe to realtime updates for THIS exact order!
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        (payload) => {
          setOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'new': return { label: 'Order Sent to Kitchen', color: 'text-[#8C7A6B]', bg: 'bg-[#CFBFA3]/20' };
      case 'preparing': return { label: 'Chef is Preparing 👨‍🍳', color: 'text-[#B85C60]', bg: 'bg-[#C97A7E]/20' };
      case 'ready': return { label: 'Ready for Pickup! 🏃', color: 'text-[#5C7F6F]', bg: 'bg-[#769C8A]/20' };
      case 'completed': return { label: 'Order Completed ✅', color: 'text-[#4A3C31]', bg: 'bg-[#DCD0B6]/50' };
      default: return { label: 'Processing...', color: 'text-[#8C7A6B]', bg: 'bg-[#CFBFA3]/20' };
    }
  };

  const statusInfo = getStatusDisplay(order?.status || 'new');

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 text-center pb-20 font-sans">
      
      {/* Dynamic Status Icon */}
      {order?.status === 'ready' ? (
        <div className="w-28 h-28 bg-[#769C8A] text-[#F2EAE0] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#83C5BE]/30 border-4 border-[#FDFDFB] animate-bounce">
          <span className="text-5xl">🏃</span>
        </div>
      ) : order?.status === 'preparing' ? (
        <div className="w-28 h-28 bg-[#C97A7E] text-[#F2EAE0] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-rose-200 border-4 border-[#FDFDFB] animate-pulse">
          <span className="text-5xl">👨‍🍳</span>
        </div>
      ) : (
        <div className="w-28 h-28 bg-[#DCD0B6] text-[#4A3C31] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#DCD0B6]/30 border-4 border-[#FDFDFB]">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      )}
      
      <h1 className="text-4xl font-black text-[#4A3C31] mb-3 tracking-tight drop-shadow-sm">Order Confirmed!</h1>
      <p className="text-[#5E4D3F] mb-8 max-w-xs font-bold text-lg leading-snug drop-shadow-sm">Your payment was successful. Keep an eye on your status below.</p>

      {/* The Token Card */}
      <div className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-150 p-10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)] w-full max-w-sm border border-white/50 relative overflow-hidden transition-all duration-500">
        
        {/* Ticket cutouts */}
        <div className="absolute top-1/2 -left-6 w-12 h-12 bg-[#E5DCC5]/50 backdrop-blur-md rounded-full transform -translate-y-1/2 border-r border-white/50 shadow-inner"></div>
        <div className="absolute top-1/2 -right-6 w-12 h-12 bg-[#E5DCC5]/50 backdrop-blur-md rounded-full transform -translate-y-1/2 border-l border-white/50 shadow-inner"></div>
        
        <p className="text-xs font-black text-[#8C7A6B] uppercase tracking-[0.2em] mb-2 drop-shadow-sm">Pickup Token</p>
        <h2 className="text-6xl font-black text-[#4A3C31] font-mono tracking-tighter mb-6 drop-shadow-sm">#{orderId || '...'}</h2>
        
        {/* Live Status Badge */}
        <div className={`py-3 px-4 rounded-xl font-black text-sm tracking-wide transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)] ${statusInfo.bg} ${statusInfo.color}`}>
          Live Status: {statusInfo.label}
        </div>
        
        {order?.pickup_pin && (
          <div className="mt-6 bg-[#C97A7E]/10 border border-[#C97A7E]/30 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-black text-[#B85C60] uppercase tracking-[0.1em] mb-1">Secure Pickup PIN</p>
            <p className="text-4xl font-black text-[#4A3C31] tracking-[0.2em]">{order.pickup_pin}</p>
          </div>
        )}
        
        <div className="border-t-2 border-dashed border-white/50 w-full my-6"></div>

        <div className="mt-6 bg-[#DCD0B6]/20 backdrop-blur-md text-[#5E4D3F] p-4 rounded-2xl text-sm font-bold border border-white/40 leading-relaxed shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
          Show this PIN at the <span className="font-black text-[#4A3C31]">Online Orders</span> counter when it says Ready!
        </div>
      </div>

      <div className="mt-10 flex gap-4">
        <Link href="/orders" className="text-[#F2EAE0] font-black tracking-wide bg-[#4A3C31]/90 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-white/10 hover:bg-[#4A3C31] active:scale-95 transition-all text-sm">
          Track in Orders
        </Link>
        <Link href="/" className="text-[#5E4D3F] font-black tracking-wide bg-[#F2EAE0]/50 backdrop-blur-md px-6 py-4 rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 hover:bg-[#F2EAE0]/70 active:scale-95 transition-all text-sm">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function Success() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-transparent flex items-center justify-center text-[#8C7A6B] font-bold">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
