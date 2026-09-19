import { Router } from 'express';
import mongoose from 'mongoose';
import { Order } from '../models/Order.js';

export const orderRoutes = Router();

orderRoutes.post('/', async (request, response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return response.status(503).json({ message: 'Database is temporarily unavailable.' });
    }
    const { items, total, status, createdAt } = request.body;
    if (!Array.isArray(items) || !items.length || typeof total !== 'number') {
      return response.status(400).json({ message: 'Valid order items and total are required.' });
    }
    const order = await Order.create({ items, total, status, createdAt });
    return response.status(201).json({ id: order._id, message: 'Order saved successfully.' });
  } catch (error) {
    console.error('Order save failed:', error.message);
    return response.status(500).json({ message: 'Could not save order.' });
  }
});
