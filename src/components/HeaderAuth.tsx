"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useProfileStore } from "@/store/useProfileStore";

export default function HeaderAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { setUserId } = useProfileStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setUserId(currentUser?.id ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUserId]);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-6 w-16 rounded-full"></div>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/orders" className="text-xs font-black text-[#8C7A6B] hover:text-[#4A3C31] uppercase tracking-widest transition-colors hidden sm:inline-block border border-white/50 px-3 py-1.5 rounded-lg bg-[#F2EAE0]/45 backdrop-blur-md shadow-sm">
          My Orders
        </Link>
        <Link href="/profile" className="flex items-center gap-2 bg-[#F2EAE0]/45 backdrop-blur-md border border-white/50 px-3 py-1.5 rounded-full hover:bg-[#F2EAE0]/60 transition-colors shadow-sm">
          <span className="text-lg">👤</span>
          <span className="text-xs font-bold text-[#5E4D3F] hidden md:inline-block">
            Profile
          </span>
        </Link>
      </div>
    );
  }

  return (
    <Link href="/login" className="bg-[#C97A7E]/90 backdrop-blur-md text-[#F2EAE0] px-5 py-2 rounded-full text-sm font-bold hover:bg-[#B85C60] transition-colors shadow-md border border-white/30">
      Login / Sign Up
    </Link>
  );
}
