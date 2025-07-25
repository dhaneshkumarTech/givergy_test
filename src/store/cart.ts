import { create } from 'zustand';

export interface CartItem {
  id: number;
  title: string;
  price: string;
  image: string;
  category: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  startDate?: Date;
  endDate?: Date;
  recentlyAdded: number | null;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  setDates: (startDate: Date | undefined, endDate: Date | undefined) => void;
  setRecentlyAdded: (id: number | null) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  startDate: undefined,
  endDate: undefined,
  recentlyAdded: null,
  
  addItem: (item, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          ),
          recentlyAdded: item.id,
        };
      }
      return {
        items: [...state.items, { ...item, quantity }],
        recentlyAdded: item.id,
      };
    });
    // Clear the recently added state after animation
    setTimeout(() => {
      set({ recentlyAdded: null });
    }, 2000);
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
      ).filter((item) => item.quantity > 0),
    }));
  },
  
  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setRecentlyAdded: (id) => set({ recentlyAdded: id }),
  
  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  getTotalPrice: () => {
    return get().items.reduce((total, item) => {
      const price = parseFloat(item.price.replace('From: $', ''));
      return total + (price * item.quantity);
    }, 0);
  },
}));