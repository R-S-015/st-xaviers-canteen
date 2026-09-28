"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Success! Go back to home
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // If email confirmation is OFF, Supabase automatically logs them in and returns a session
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          // If email confirmation is ON, session will be null
          setMessage("Check your email for the confirmation link!");
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-5xl mb-4 opacity-90 drop-shadow-sm">🍱</div>
        <h2 className="mt-6 text-center text-3xl font-black text-[#4A3C31] tracking-tight">
          Canteen Connect
        </h2>
        <p className="mt-2 text-center text-sm font-medium text-[#8C7A6B]">
          {isLogin ? "Sign in to order your food" : "Create an account to skip the queue"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#F2EAE0] py-8 px-4 shadow-md shadow-[#4A3C31]/5 sm:rounded-3xl sm:px-10 border border-[#CFBFA3]">
          <form className="space-y-6" onSubmit={handleAuth}>
            
            {errorMsg && (
              <div className="bg-[#C97A7E]/10 text-[#B85C60] p-4 rounded-xl text-sm font-bold border border-[#C97A7E]/30">
                {errorMsg}
              </div>
            )}
            
            {message && (
              <div className="bg-[#769C8A]/10 text-[#5C7F6F] p-4 rounded-xl text-sm font-bold border border-[#769C8A]/30">
                {message}
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-[#5E4D3F]">College Email address</label>
              <div className="mt-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-[#CFBFA3] rounded-2xl shadow-inner bg-transparent/50 placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#C97A7E] focus:border-[#C97A7E] focus:bg-[#F2EAE0] transition-all sm:text-sm font-medium text-[#4A3C31]"
                  placeholder="student@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#5E4D3F]">Password</label>
              <div className="mt-2">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3.5 border border-[#CFBFA3] rounded-2xl shadow-inner bg-transparent/50 placeholder-[#A6978A] focus:outline-none focus:ring-2 focus:ring-[#C97A7E] focus:border-[#C97A7E] focus:bg-[#F2EAE0] transition-all sm:text-sm font-medium text-[#4A3C31]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-black text-[#F2EAE0] bg-[#C97A7E] hover:bg-[#B85C60] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C97A7E] focus:ring-offset-[#F2EAE0] transition-all tracking-wide ${loading ? "opacity-70 cursor-wait" : "active:scale-[0.98]"}`}
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#CFBFA3]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-[#F2EAE0] text-[#8C7A6B] font-bold">Or</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="w-full flex justify-center py-4 px-4 border-2 border-[#CFBFA3] rounded-2xl shadow-sm text-sm font-bold text-[#5E4D3F] bg-[#F2EAE0] hover:bg-transparent transition-all active:scale-[0.98]"
              >
                {isLogin ? "Create a new account" : "Sign in to existing account"}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <Link href="/" className="text-sm font-bold text-[#8C7A6B] hover:text-[#4A3C31] underline decoration-[#8C7A6B]/30 hover:decoration-[#4A3C31] transition-all">
                Continue as Guest for now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
