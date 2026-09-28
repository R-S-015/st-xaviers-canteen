
"use client";
import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { supabase } from "@/lib/supabase";

export default function StripeCheckoutModal({ amount, isOpen, onClose, onSuccess, isTopUp = true }: { amount: number, isOpen: boolean, onClose: () => void, onSuccess: () => void, isTopUp?: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  
  // User Data
  const [userEmail, setUserEmail] = useState("student@college.edu");
  const [userName, setUserName] = useState("John Doe");

  // UPI Verification State
  const [upiId, setUpiId] = useState("");
  const [verifyState, setVerifyState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [verifiedName, setVerifiedName] = useState("");
  
  const addFunds = useProfileStore((state) => state.addFunds);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          setUserEmail(session.user.email);
          // Extract name from email (e.g. reon@gmail.com -> Reon)
          const namePart = session.user.email.split("@")[0];
          setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsLoading(true);
    setTimeout(() => {
      if (isTopUp) {
        addFunds(amount, `Added via ${paymentMethod === "upi" ? "UPI" : "Card"}`);
      }
      setIsLoading(false);
      
      setUpiId("");
      setVerifyState("idle");
      setVerifiedName("");
      
      onSuccess();
    }, 2000);
  };

  const handleVerify = () => {
    if (!upiId.includes("@")) {
      setVerifyState("error");
      return;
    }
    
    setVerifyState("loading");
    setTimeout(() => {
      setVerifyState("success");
      setVerifiedName(userName); // Use the logged in user's dynamic name!
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
      <div className="relative bg-white w-full max-w-[400px] rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 shadow-2xl font-sans text-gray-800 h-[85vh] sm:h-auto max-h-[800px]">
        
        {/* Razorpay-style Header */}
        <div className="bg-[#02042b] text-white p-5 pb-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-xl">🍱</span>
              </div>
              <div>
                <h2 className="font-semibold text-[15px] leading-tight">Canteen Connect</h2>
                <p className="text-[#a4a7cf] text-xs">Test Environment</p>
              </div>
            </div>
            <button onClick={onClose} className="text-[#a4a7cf] hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          
          <div className="flex justify-between items-end">
            <span className="text-[#a4a7cf] text-sm">Amount to pay</span>
            <span className="text-2xl font-semibold flex items-center gap-1"><span className="text-lg">₹</span>{amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#f4f5f8] px-5 py-3 border-b border-gray-200 flex justify-between items-center text-sm">
          <span className="text-gray-500 font-medium">{userEmail}</span>
          <span className="text-blue-600 font-medium cursor-pointer">Edit</span>
        </div>

        {/* Payment Methods */}
        <div className="flex-1 overflow-y-auto bg-white hide-scrollbar">
          {/* UPI Section */}
          <div className="px-5 py-4 border-b border-gray-100 cursor-pointer" onClick={() => setPaymentMethod("upi")}>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "upi" ? "border-blue-600" : "border-gray-300"}`}>
                {paymentMethod === "upi" && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-[15px]">UPI</p>
                <p className="text-gray-500 text-xs">Pay via any UPI app</p>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-5 border border-gray-200 rounded flex items-center justify-center bg-white text-[8px] font-bold text-gray-600">GPay</div>
                <div className="w-8 h-5 border border-gray-200 rounded flex items-center justify-center bg-white text-[8px] font-bold text-blue-600">Paytm</div>
              </div>
            </div>
            
            {paymentMethod === "upi" && (
              <div className="mt-4 ml-8 animate-in fade-in slide-in-from-top-2">
                <div className="relative">
                  <input 
                    type="text" 
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      setVerifyState("idle");
                    }}
                    placeholder="Enter UPI ID (e.g. name@bank)" 
                    className={`w-full border rounded px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-all placeholder:text-gray-400 ${verifyState === "error" ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50" : verifyState === "success" ? "border-green-500 focus:border-green-500 focus:ring-green-500 bg-green-50" : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"}`} 
                  />
                  
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {verifyState === "idle" && (
                      <button onClick={handleVerify} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">Verify</button>
                    )}
                    {verifyState === "loading" && (
                      <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    )}
                    {verifyState === "success" && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                </div>

                {verifyState === "error" && <p className="text-xs text-red-500 mt-1 font-medium">Please enter a valid UPI ID.</p>}
                {verifyState === "success" && <p className="text-xs text-green-600 mt-1 font-medium">Verified: {verifiedName}</p>}

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-[1px] bg-gray-200"></div>
                </div>

                <div className="mt-4 p-4 border border-gray-200 rounded-lg flex flex-col items-center justify-center bg-[#fafafa]">
                   <div className="w-24 h-24 bg-white border border-gray-200 rounded-md p-1.5 shadow-sm mb-3">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=test@razorpay&pn=CanteenConnect&am=500" alt="UPI QR" className="w-full h-full opacity-60" />
                   </div>
                   <p className="text-xs text-gray-500 text-center">Scan QR code using<br/>any UPI app to pay</p>
                </div>
              </div>
            )}
          </div>

          {/* Card Section */}
          <div className="px-5 py-4 border-b border-gray-100 cursor-pointer" onClick={() => setPaymentMethod("card")}>
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === "card" ? "border-blue-600" : "border-gray-300"}`}>
                {paymentMethod === "card" && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-[15px]">Card</p>
                <p className="text-gray-500 text-xs">Visa, MasterCard, RuPay & more</p>
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-5 border border-gray-200 rounded flex items-center justify-center bg-white text-[8px] font-bold text-blue-800 italic">VISA</div>
              </div>
            </div>
            
            {paymentMethod === "card" && (
              <div className="mt-4 ml-8 animate-in fade-in slide-in-from-top-2 space-y-3">
                <div className="relative">
                  <input type="text" placeholder="Card Number" value="4111 1111 1111 1111" readOnly className="w-full min-w-0 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="flex gap-3">
                  <input type="text" placeholder="Expiry (MM/YY)" value="12/28" readOnly className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" />
                  <input type="text" placeholder="CVV" value="123" readOnly className="flex-1 min-w-0 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="relative">
                  <input type="text" placeholder="Cardholder Name" value={userName} readOnly className="w-full min-w-0 border border-gray-300 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600" />
                   <span className="text-xs text-gray-500">Securely save this card for future payments</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer & Action */}
        <div className="p-5 bg-white border-t border-gray-200">
          <button 
            onClick={handleSimulatePayment}
            disabled={isLoading || (paymentMethod === "upi" && verifyState === "error")}
            className="w-full py-3.5 rounded bg-[#3395FF] hover:bg-[#2084f0] text-white font-semibold text-[15px] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 relative overflow-hidden"
          >
            {isLoading && (
              <div className="absolute inset-0 bg-[#2084f0] flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            )}
            {!isLoading && `Pay ₹${amount.toLocaleString("en-IN")}`}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secured by Razorpay
          </div>
        </div>
      </div>
    </div>
  );
}

