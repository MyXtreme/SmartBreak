import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ id, name, price, image, quantity }]
      pickupTime: "",

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, quantity: 1 }],
          }));
        }
      },

      removeItem: (itemId) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
      },

      decreaseItem: (itemId) => {
        const existing = get().items.find((i) => i.id === itemId);
        if (existing && existing.quantity > 1) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
            ),
          }));
        } else {
          set((state) => ({
            items: state.items.filter((i) => i.id !== itemId),
          }));
        }
      },

      clearCart: () => set({ items: [], pickupTime: "" }),

      setPickupTime: (time) => set({ pickupTime: time }),

      getTotalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);

export default useCartStore;
