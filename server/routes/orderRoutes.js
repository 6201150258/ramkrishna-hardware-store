import { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { requireAdmin } from '../middleware/adminAuth.js';

export const orderRoutes = Router();

orderRoutes.post('/', async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return response.status(503).json({ message: 'Database is temporarily unavailable.' });
    }
    const { buyer, items, total, status, createdAt } = request.body;
    if (!buyer?.name || !buyer?.phone || !buyer?.address || !buyer?.city || !buyer?.pincode || !Array.isArray(items) || !items.length || typeof total !== 'number') {
      return response.status(400).json({ message: 'Buyer details and valid order items are required.' });
    }
    const order = await Order.create({ buyer, items, total, status, createdAt });
    return response.status(201).json({ id: order._id, message: 'Order saved successfully.' });
  } catch (error) {
    console.error('Order save failed:', error.message);
    return response.status(500).json({ message: 'Could not save order.' });
  }
});

orderRoutes.get('/', requireAdmin, async (_request, response) => {
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  response.json(orders);
});
