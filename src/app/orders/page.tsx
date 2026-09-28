"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import HeaderAuth from "@/components/HeaderAuth";

export default function OrdersPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      // 1. Get the currently logged-in user from the browser session
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      // 2. Fetch orders if user exists
      if (currentUser) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });
        
        if (data) setOrders(data);

        // 3. Subscribe to Realtime updates for THIS user's orders!
        const channel = supabase
          .channel(`my-orders-realtime-${Math.random()}`)
          .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${currentUser.id}` },
            (payload) => {
              // Automatically update the state when the kitchen changes the status!
              setOrders((currentOrders) => 
                currentOrders.map(o => o.id === payload.new.id ? payload.new : o)
              );
            }
          )
          .subscribe();

        setLoading(false);

        // Cleanup on unmount
        return () => {
          supabase.removeChannel(channel);
        };
      }
      
      setLoading(false);
    };

    const cleanup = fetchUserAndOrders();
    return () => {
      cleanup.then(cleanFn => { if (cleanFn) cleanFn() });
    };
  }, []);

  if (loading) {
    return <div className="min-h-[100dvh] bg-transparent flex items-center justify-center font-bold text-[#8C7A6B]">Loading your orders...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-transparent flex flex-col items-center justify-center p-4 font-sans text-center">
        <div className="w-24 h-24 bg-[#F2EAE0] text-[#4A3C31] rounded-full flex items-center justify-center mb-6 text-4xl shadow-sm border border-[#CFBFA3]">👤</div>
        <h2 className="text-2xl font-black text-[#4A3C31] mb-2 tracking-tight">Not Logged In</h2>
        <p className="text-[#8C7A6B] mb-8 font-medium">Please sign in to view your order history.</p>
        <Link href="/login" className="bg-[#C97A7E] text-[#F2EAE0] font-bold py-3.5 px-8 rounded-2xl hover:bg-[#B85C60] transition-all shadow-sm">
          Go to Login
        </Link>
      </div>
    );
  }

  // Separate active vs past orders
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return "bg-[#DCD0B6] text-[#4A3C31] border-[#CFBFA3]";
      case 'preparing': return "bg-[#C97A7E]/20 text-[#B85C60] border-[#C97A7E]/30";
      case 'ready': return "bg-[#769C8A]/20 text-[#5C7F6F] border-[#769C8A]/30";
      case 'cancelled': return "bg-rose-100/50 text-rose-600 border-rose-200/50";
      default: return "bg-[#F2EAE0] text-[#8C7A6B] border-[#CFBFA3]";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return "Waitlisted";
      case 'preparing': return "Preparing 👨‍🍳";
      case 'ready': return "Ready for Pickup! 🏃";
      case 'cancelled': return "Cancelled & Refunded";
      default: return "Completed";
    }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent text-[#4A3C31] flex flex-col font-sans">
      <header className="bg-[#DCD0B6]/30 backdrop-blur-md backdrop-saturate-150 shadow-sm p-4 sticky top-0 z-10 flex justify-between items-center border-b border-white/30 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#5E4D3F] hover:text-[#4A3C31] transition-colors p-2 -ml-2 rounded-full hover:bg-white/20 active:scale-95">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <h1 className="text-xl font-black tracking-tight text-[#4A3C31] drop-shadow-sm">My Orders</h1>
        </div>
        <HeaderAuth />
      </header>

      <main className="p-4 max-w-2xl mx-auto w-full space-y-8 mt-4 pb-20 print:hidden">
        
        {/* Active Orders */}
        <section>
          <h2 className="font-black text-[#5E4D3F] uppercase tracking-widest text-sm mb-4 drop-shadow-sm">Live Orders</h2>
          {activeOrders.length === 0 ? (
            <div className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-150 rounded-3xl p-8 text-center border border-white/40 border-dashed shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <p className="text-[#8C7A6B] font-bold">You have no active orders right now.</p>
              <Link href="/" className="inline-block mt-4 text-[#769C8A] font-bold hover:underline drop-shadow-sm">Order some food!</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map(order => (
                <div key={order.id} className="block bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-[1.3] rounded-3xl p-5 border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,1)] hover:bg-[#F2EAE0]/50 transition-all relative overflow-hidden group">
                  <div className={`absolute top-0 left-0 w-2 h-full ${order.status === 'ready' ? 'bg-[#769C8A]' : order.status === 'preparing' ? 'bg-[#C97A7E]' : 'bg-[#A6978A]'}`}></div>
                  <div className="flex justify-between items-start mb-4 ml-3">
                    <div>
                      <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-1 drop-shadow-sm">Order #{order.id}</p>
                      <h3 className="font-black text-xl text-[#4A3C31] drop-shadow-sm">₹{order.total_amount}</h3>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border shadow-[inset_0_1px_1px_rgba(255,255,255,0.5)] ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                  <div className="border-t border-dashed border-white/50 my-3 ml-3"></div>
                  <ul className="text-sm font-bold text-[#5E4D3F] space-y-1 ml-3 drop-shadow-sm mb-4">
                    {order.items.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                  <div className="ml-3 flex gap-2">
                    <Link href={`/success?orderId=${order.id}`} className="flex-1 text-center bg-white/40 hover:bg-white/60 text-[#4A3C31] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/50 shadow-sm transition-colors">
                      View Ticket
                    </Link>
                    {order.status === 'new' && (
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if(confirm("Cancel this order and refund ₹" + order.total_amount + " to your wallet?")) {
                            // 1. Update order status
                            await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
                            
                            // 2. Fetch current wallet balance
                            const { data: profileData } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();
                            const currentBalance = profileData?.wallet_balance || 0;
                            
                            // 3. Refund the wallet
                            await supabase.from('profiles').update({ wallet_balance: currentBalance + order.total_amount }).eq('id', user.id);
                            
                            alert(`Order Cancelled! ₹${order.total_amount} has been refunded to your Canteen Wallet.`);
                            
                            // Trigger refresh
                            setOrders(orders.filter(o => o.id !== order.id));
                          }
                        }}
                        className="flex-1 bg-rose-100/50 hover:bg-rose-100 border border-rose-200/50 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-sm transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Orders */}
        <section>
          <h2 className="font-black text-[#5E4D3F] uppercase tracking-widest text-sm mb-4 drop-shadow-sm">Past Orders</h2>
          {pastOrders.length === 0 ? (
            <p className="text-[#8C7A6B] font-medium text-sm italic drop-shadow-sm">No past orders found.</p>
          ) : (
            <div className="space-y-4">
              {pastOrders.map(order => (
                <button 
                  key={order.id} 
                  onClick={() => setSelectedReceipt(order)}
                  className="w-full text-left bg-[#F2EAE0]/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 flex justify-between items-center opacity-80 hover:opacity-100 hover:bg-[#F2EAE0]/40 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]"
                >
                  <div>
                    <p className="text-xs font-bold text-[#8C7A6B] uppercase tracking-wider mb-0.5">Order #{order.id}</p>
                    <p className="text-sm font-bold text-[#5E4D3F] drop-shadow-sm">{order.items.length} items • ₹{order.total_amount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-bold text-[#A6978A] bg-transparent px-2 py-1 rounded">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                    <span className="text-[#8C7A6B]">🧾</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Digital Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:bg-white print:p-0">
          
          {/* Modal Backdrop (Close on click outside) */}
          <div className="absolute inset-0 print:hidden" onClick={() => setSelectedReceipt(null)}></div>
          
          <div className="relative w-full max-w-sm flex flex-col items-center">
            
            {/* The Paper Receipt */}
            <div className="bg-white text-black font-mono w-full px-6 py-8 shadow-2xl relative">
              {/* Jagged Top Edge (CSS Trick) */}
              <div className="absolute top-0 left-0 w-full h-2 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 0, transparent 4px, white 5px)', backgroundSize: '10px 10px' }}></div>
              
              <div className="text-center mb-6 mt-2">
                <h2 className="text-2xl font-black mb-1">ST. XAVIER'S</h2>
                <h3 className="text-sm">XAVDASH</h3>
                <p className="text-xs mt-2 text-gray-500">Date: {new Date(selectedReceipt.created_at).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Order #{selectedReceipt.id}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

              <table className="w-full text-sm mb-4">
                <thead>
                  <tr className="text-left">
                    <th className="font-normal pb-2">ITEM</th>
                    <th className="font-normal pb-2 text-right">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items.map((item: string, i: number) => {
                    // Simple parser for demonstration assuming "Item Name" structure
                    return (
                      <tr key={i}>
                        <td className="py-1 break-words pr-2">{item}</td>
                        <td className="py-1 text-right align-top">1</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              <div className="border-t-2 border-dashed border-gray-300 my-4"></div>
              
              {selectedReceipt.pickup_pin && (
                <div className="text-center my-4 bg-gray-100 py-3 border border-gray-300 print:border-black">
                  <p className="text-xs text-gray-500 mb-1">PICKUP PIN</p>
                  <p className="text-3xl tracking-[0.2em] font-black">{selectedReceipt.pickup_pin}</p>
                </div>
              )}
              
              <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

              <div className="flex justify-between font-black text-lg">
                <span>TOTAL</span>
                <span>₹{selectedReceipt.total_amount}</span>
              </div>

              <div className="border-t-2 border-dashed border-gray-300 my-4"></div>

              <div className="text-center text-xs text-gray-500 space-y-1 mt-6">
                <p>PAID VIA WALLET/ONLINE</p>
                <p>THANK YOU FOR YOUR ORDER</p>
                <p>HAVE A GREAT DAY!</p>
              </div>
              
              {selectedReceipt.status === 'completed' && !selectedReceipt.rating && (
                <div className="mt-6 pt-6 border-t-2 border-dotted border-gray-300 print:hidden text-center">
                  <p className="font-bold text-[#4A3C31] text-sm mb-3">How was your meal?</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        onClick={async () => {
                          const newOrders = orders.map(o => o.id === selectedReceipt.id ? {...o, rating: star} : o);
                          setOrders(newOrders);
                          setSelectedReceipt({...selectedReceipt, rating: star});
                          await supabase.from('orders').update({ rating: star }).eq('id', selectedReceipt.id);
                        }}
                        className="text-3xl transition-transform hover:scale-110 active:scale-95 grayscale hover:grayscale-0"
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedReceipt.rating && (
                <div className="mt-6 pt-6 border-t-2 border-dotted border-gray-300 print:hidden text-center">
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Your Rating</p>
                   <div className="text-xl">{"⭐".repeat(selectedReceipt.rating)}</div>
                </div>
              )}
              
              {/* Jagged Bottom Edge */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-repeat-x print:hidden" style={{ backgroundImage: 'radial-gradient(circle at 50% 10px, transparent 4px, white 5px)', backgroundSize: '10px 10px', backgroundPosition: 'bottom' }}></div>
            </div>

            {/* Print & Close Buttons (Hidden on print) */}
            <div className="flex gap-4 mt-6 print:hidden relative z-10 w-full">
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-white/20 backdrop-blur-md text-white font-bold py-3 rounded-xl border border-white/30 hover:bg-white/30 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-[#4A3C31] text-[#F2EAE0] font-bold py-3 rounded-xl shadow-lg border border-[#5E4D3F] hover:bg-[#5E4D3F] transition-colors"
              >
                🖨️ Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
