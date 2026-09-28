import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  date: string;
  description: string;
}

interface ProfileState {
  userId: string | null;
  walletBalance: number;
  transactions: Transaction[];
  pointsSpent: number;
  dietaryPreference: string | null;
  toggles: string[];
  setUserId: (userId: string | null) => Promise<void>;
  addFunds: (amount: number, description?: string) => Promise<void>;
  deductFunds: (amount: number, description?: string) => Promise<void>;
  spendPoints: (amount: number) => Promise<void>;
  setDietaryPreference: (pref: string | null) => Promise<void>;
  setToggles: (toggles: string[]) => Promise<void>;
  toggleFilter: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      userId: null,
      walletBalance: 0,
      transactions: [],
      pointsSpent: 0,
      dietaryPreference: null,
      toggles: [],
      
      setUserId: async (userId) => {
        set({ userId });
        if (userId) {
          // Fetch from Supabase
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
          if (profile) {
            set({
              walletBalance: Number(profile.wallet_balance),
              pointsSpent: Number(profile.points_spent),
              dietaryPreference: profile.dietary_preference,
              toggles: profile.toggles || []
            });
          }
          
          const { data: txs } = await supabase
            .from('wallet_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);
            
          if (txs) {
            set({
              transactions: txs.map(tx => ({
                id: tx.id,
                type: tx.type as 'credit' | 'debit',
                amount: Number(tx.amount),
                date: tx.created_at,
                description: tx.description
              }))
            });
          }
        }
      },

      addFunds: async (amount, description = 'Top-up') => {
        const { userId, walletBalance, transactions } = get();
        const newBalance = walletBalance + amount;
        
        // Optimistic update
        set((state) => ({ 
          walletBalance: newBalance,
          transactions: [{
            id: Math.random().toString(36).substr(2, 9), // temp id
            type: 'credit',
            amount,
            date: new Date().toISOString(),
            description
          }, ...state.transactions].slice(0, 50)
        }));
        
        if (userId) {
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
          await supabase.from('wallet_transactions').insert({
            user_id: userId,
            type: 'credit',
            amount,
            description
          });
          // Note: Ideally re-fetch or rely on the real inserted ID, but optimistic is fine for now
        }
      },
      
      deductFunds: async (amount, description = 'Purchase') => {
        const { userId, walletBalance } = get();
        const newBalance = Math.max(0, walletBalance - amount);
        
        set((state) => ({ 
          walletBalance: newBalance,
          transactions: [{
            id: Math.random().toString(36).substr(2, 9),
            type: 'debit',
            amount,
            date: new Date().toISOString(),
            description
          }, ...state.transactions].slice(0, 50)
        }));
        
        if (userId) {
          await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
          await supabase.from('wallet_transactions').insert({
            user_id: userId,
            type: 'debit',
            amount,
            description
          });
        }
      },

      spendPoints: async (amount) => {
        const { userId, pointsSpent } = get();
        const newPoints = pointsSpent + amount;
        set({ pointsSpent: newPoints });
        
        if (userId) {
          await supabase.from('profiles').update({ points_spent: newPoints }).eq('id', userId);
        }
      },
      
      setDietaryPreference: async (pref) => {
        const { userId } = get();
        set({ dietaryPreference: pref });
        if (userId) {
          await supabase.from('profiles').update({ dietary_preference: pref }).eq('id', userId);
        }
      },
      
      setToggles: async (toggles) => {
        const { userId } = get();
        set({ toggles });
        if (userId) {
          await supabase.from('profiles').update({ toggles }).eq('id', userId);
        }
      },
      
      toggleFilter: async (id) => {
        const { userId, toggles } = get();
        const newToggles = toggles.includes(id) 
          ? toggles.filter(t => t !== id)
          : [...toggles, id];
          
        set({ toggles: newToggles });
        if (userId) {
          await supabase.from('profiles').update({ toggles: newToggles }).eq('id', userId);
        }
      }
    }),
    {
      name: 'canteen-profile-storage',
    }
  )
);
