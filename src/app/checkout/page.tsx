"use client";
import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/store/useCartStore";
import { useProfileStore } from "@/store/useProfileStore";
import StripeCheckoutModal from "@/components/StripeCheckoutModal";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pickupType = searchParams.get("type") || "ASAP";
  
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { walletBalance, deductFunds } = useProfileStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  // If someone goes to checkout with empty cart, redirect home
  useEffect(() => {
    if (items.length === 0 && !isSuccess) {
      router.push('/');
    }
  }, [items.length, router, isSuccess]);

  if (items.length === 0 && !isSuccess) {
    return null;
  }

  const subtotal = getTotalPrice();
  const total = subtotal + 2; // + Convenience fee

  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  const processOrder = async () => {
    setIsProcessing(true);
    
    // Simulate real payment gateway delay for wallet
    if (selectedMethod === "wallet") {
      await new Promise(res => setTimeout(res, 1500));
      await deductFunds(total, "Paid for Canteen Order");
    }
    
    // Create an array of strings like ["2x Samosa", "1x Coke"] for the kitchen
    const formattedItems = items.map(item => `${item.quantity}x ${item.name}`);
    
    // Get current logged-in user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Generate 4-digit pickup PIN
    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Create the actual order in Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          status: 'new',
          pickup_type: pickupType,
          total_amount: total,
          items: formattedItems,
          user_id: user?.id || null, // Store the user ID!
          pickup_pin: pickupPin
        }
      ])
      .select();

    if (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order!");
      setIsProcessing(false);
      return;
    }

    // Clear the cart since order is placed
    clearCart();

    // Trigger success popup
    setIsSuccess(true);

    // Wait 2 seconds for user to read popup, then go to success
    setTimeout(() => {
      router.push("/success?orderId=" + data[0].id);
    }, 2000);
  };

  const handlePayment = async () => {
    if (selectedMethod === "wallet" && walletBalance < total) {
      alert("Insufficient wallet balance!");
      return;
    }

    if (selectedMethod !== "wallet") {
      setIsGatewayOpen(true);
      return;
    }

    await processOrder();
  };

  const paymentMethods = [
    { id: "upi", name: "UPI (GPay, PhonePe, Paytm)", icon: "📱", description: "Fastest" },
    { id: "wallet", name: "Canteen Wallet", icon: "💳", description: `Balance: ₹${walletBalance}` },
    { id: "card", name: "Credit / Debit Card", icon: "🏦", description: "Visa, MasterCard" },
  ];

  return (
    <div className="min-h-[100dvh] bg-transparent text-[#4A3C31] pb-24 font-sans relative">
      
      {/* Success Pop-Up Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#F2EAE0]/80 backdrop-blur-xl backdrop-saturate-150 p-8 md:p-10 rounded-[2rem] shadow-[0_32px_64px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/50 max-w-sm w-full flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-[#769C8A]/20 rounded-full flex items-center justify-center mb-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]">
              <span className="text-5xl animate-bounce">🎉</span>
            </div>
            <h2 className="text-3xl font-black text-[#4A3C31] mb-2 tracking-tight drop-shadow-sm">Payment Successful!</h2>
            <p className="text-[#8C7A6B] font-bold drop-shadow-sm">Your order has been sent to the kitchen.</p>
            <div className="mt-8 w-8 h-8 border-4 border-[#769C8A]/30 border-t-[#769C8A] rounded-full animate-spin"></div>
            <p className="text-xs text-[#A6978A] font-bold mt-4 uppercase tracking-widest drop-shadow-sm">Generating Receipt...</p>
          </div>
        </div>
      )}

      <header className="bg-[#DCD0B6]/30 backdrop-blur-md backdrop-saturate-150 shadow-sm p-4 sticky top-0 z-10 flex items-center gap-4 border-b border-white/30">
        <Link href="/cart" className="text-[#5E4D3F] hover:text-[#4A3C31] transition-colors p-2 -ml-2 rounded-full hover:bg-white/20 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <h1 className="text-xl font-black tracking-tight drop-shadow-sm">Checkout</h1>
      </header>

      <main className="p-4 max-w-lg mx-auto space-y-6 mt-4">
        <div className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-150 p-8 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] text-center border border-white/40">
          <p className="text-[#5E4D3F] text-xs font-bold uppercase tracking-widest drop-shadow-sm">Amount to Pay</p>
          <h2 className="text-5xl font-black text-[#4A3C31] mt-2 drop-shadow-sm">₹{total}</h2>
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-[#8C7A6B] text-xs uppercase tracking-widest ml-1 drop-shadow-sm">Select Payment Method</h3>
          <div className="bg-[#F2EAE0]/30 backdrop-blur-xl backdrop-saturate-150 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.08),inset_0_1px_1px_rgba(255,255,255,0.8)] border border-white/40 overflow-hidden">
            {paymentMethods.map((method, index) => (
              <label 
                key={method.id} 
                className={`flex items-center p-5 cursor-pointer transition-all ${
                  index !== paymentMethods.length - 1 ? "border-b border-white/30" : ""
                } ${selectedMethod === method.id ? "bg-[#C97A7E]/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]" : "hover:bg-white/10"}`}
              >
                <div className="flex-shrink-0 w-8 flex justify-center text-2xl mr-4">{method.icon}</div>
                <div className="flex-1">
                  <h4 className={`font-black text-lg ${selectedMethod === method.id ? "text-[#B85C60]" : "text-[#5E4D3F]"}`}>
                    {method.name}
                  </h4>
                  <p className={`text-sm font-bold mt-0.5 ${selectedMethod === method.id ? "text-[#B85C60]" : "text-[#A6978A]"}`}>
                    {method.description}
                  </p>
                </div>
                <div className="ml-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center bg-white/40 shadow-inner ${
                    selectedMethod === method.id ? "border-[#C97A7E]" : "border-white/60"
                  }`}>
                    {selectedMethod === method.id && <div className="w-3 h-3 rounded-full bg-[#C97A7E] shadow-sm"></div>}
                  </div>
                </div>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => setSelectedMethod(method.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 w-full bg-[#F2EAE0]/60 backdrop-blur-xl backdrop-saturate-[1.5] border-t border-white/50 p-4 z-20 pb-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div className="max-w-lg mx-auto">
          <button 
            onClick={handlePayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-2xl font-black text-lg shadow-lg transition-all flex justify-center items-center gap-2 border tracking-wide ${
              isProcessing 
                ? "bg-white/50 text-[#8C7A6B] cursor-not-allowed border-white/30 shadow-none" 
                : "bg-[#769C8A]/90 backdrop-blur-md text-white hover:bg-[#769C8A] active:scale-[0.98] border-white/30 shadow-[0_8px_16px_rgba(118,156,138,0.3),inset_0_1px_1px_rgba(255,255,255,0.4)]"
            }`}
          >
            {isProcessing ? "Processing Payment..." : `Pay ₹${total} Securely`}
          </button>
        </div>
      </div>

      {isGatewayOpen && (
        <StripeCheckoutModal 
          amount={total} 
          isOpen={true}
          isTopUp={false}
          onClose={() => setIsGatewayOpen(false)} 
          onSuccess={() => {
            setIsGatewayOpen(false);
            processOrder();
          }} 
        />
      )}
    </div>
  );
}

export default function Checkout() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] bg-transparent flex items-center justify-center text-[#8C7A6B] font-bold">Loading Checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
