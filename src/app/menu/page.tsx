import React from "react";
import { supabase } from "@/lib/supabase";
import MenuList from "@/components/MenuList";
import HeaderAuth from "@/components/HeaderAuth";
import Link from "next/link";

export const revalidate = 0; 

export default async function MenuPage() {
  const { data: menuItems, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('id', { ascending: true });

  if (error) console.error("Supabase Error:", error);

  // Fetch orders that have a rating to calculate averages on the fly
  const { data: ratedOrders } = await supabase
    .from('orders')
    .select('items, rating')
    .not('rating', 'is', null);

  const ratingsMap: Record<string, { sum: number, count: number }> = {};
  if (ratedOrders) {
    ratedOrders.forEach(order => {
      order.items.forEach((itemStr: string) => {
        const nameMatch = itemStr.match(/^\d+x\s+(.*)$/);
        if (nameMatch) {
          const name = nameMatch[1];
          if (!ratingsMap[name]) ratingsMap[name] = { sum: 0, count: 0 };
          ratingsMap[name].sum += order.rating;
          ratingsMap[name].count += 1;
        }
      });
    });
  }

  const menu = menuItems?.map(item => {
    const r = ratingsMap[item.name];
    if (r) {
      return { ...item, rating: parseFloat((r.sum / r.count).toFixed(1)), reviewsCount: r.count };
    }
    return item;
  }) || [];

  return (
    <div className="h-screen bg-transparent text-[#4A3C31] flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="bg-[#DCD0B6]/45 backdrop-blur-xl backdrop-saturate-[1.5] shadow-sm p-4 z-20 flex justify-between items-center border-b border-white/40 flex-shrink-0">
        <Link href="/" className="text-xl font-black text-[#B85C60] flex items-center gap-2 tracking-tight hover:opacity-80 transition-opacity drop-shadow-sm">
          <span className="text-2xl">🍱</span> Canteen Connect
        </Link>
        <HeaderAuth />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {menu.length === 0 && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8 text-[#8C7A6B] bg-[#F2EAE0] rounded-3xl shadow-sm border border-[#CFBFA3] max-w-sm">
              <p className="text-lg font-bold text-[#4A3C31]">No menu items found.</p>
            </div>
          </div>
        )}

        {menu.length > 0 && (
          <React.Suspense fallback={<div className="p-8 text-[#8C7A6B] font-bold m-auto">Loading menu...</div>}>
            <MenuList items={menu} />
          </React.Suspense>
        )}
      </main>
    </div>
  );
}
