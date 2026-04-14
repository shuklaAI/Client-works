import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ id, name, price, mrp, image, slug, quantity }]

      // Computed values as functions (Zustand doesn't support ES5 getters)
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find(i => i.id === product.id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === product.id
                  ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
                  : i
              )
            };
          }
          return {
            items: [...state.items, { ...product, quantity }]
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            i.id === id ? { ...i, quantity: Math.min(quantity, 99) } : i
          )
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(i => i.id !== id)
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'techbharat-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
