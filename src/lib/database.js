import { seedProducts } from '../data/products';

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
};

export const database = {
  products: () => read('rk_products', seedProducts),
  cart: () => read('rk_cart', []),
  saveCart: (cart) => localStorage.setItem('rk_cart', JSON.stringify(cart)),
  saveOrder: async (order) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (response.ok) return { ...(await response.json()), source: 'mongodb' };
    } catch {
      // Keep the local fallback available while the API is not configured.
    }
    const orders = read('rk_orders', []);
    const savedOrder = { ...order, id: `RK-${Date.now()}` };
    localStorage.setItem('rk_orders', JSON.stringify([savedOrder, ...orders]));
    return { ...savedOrder, source: 'local' };
  }
};
