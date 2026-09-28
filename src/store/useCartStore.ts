import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: { id: number; name: string; price: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (newItem) => set((state) => {
    // Validate the item before adding
    if (!newItem || !newItem.name || isNaN(newItem.price)) {
      console.warn("Attempted to add invalid item to cart:", newItem);
      return state;
    }

    const existingItem = state.items.find(item => item.id === newItem.id);
    if (existingItem) {
      // If item already in cart, just increase quantity
      return {
        items: state.items.map(item => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      };
    }
    // Otherwise add new item with quantity 1
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),
  
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  
  updateQuantity: (id, quantity) => set((state) => {
    if (quantity <= 0) {
      return { items: state.items.filter(item => item.id !== id) };
    }
    return {
      items: state.items.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    };
  }),
  
  clearCart: () => set({ items: [] }),
  
  // Helper functions
  getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
  
  getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
