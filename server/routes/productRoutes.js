import { Router } from 'express';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { requireAdmin } from '../middleware/adminAuth.js';

export const productRoutes = Router();

const productFields = (body) => ({
  name: String(body.name || '').trim(),
  english: String(body.english || '').trim(),
  category: String(body.category || '').trim(),
  price: Number(body.price),
  unit: String(body.unit || '').trim(),
  image: String(body.image || '').trim(),
  featured: Boolean(body.featured)
});

const validateProduct = (product) => product.name && product.english && product.category && product.unit && product.image && Number.isFinite(product.price) && product.price >= 0;

productRoutes.get('/', async (_request, response) => {
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  response.json(products);
});

productRoutes.post('/', requireAdmin, async (request, response) => {
  const product = productFields(request.body);
  if (!validateProduct(product)) return response.status(400).json({ message: 'All product fields are required and price must be valid.' });
  const created = await Product.create(product);
  response.status(201).json(created);
});

productRoutes.put('/:id', requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid product id.' });
  const product = productFields(request.body);
  if (!validateProduct(product)) return response.status(400).json({ message: 'All product fields are required and price must be valid.' });
  const updated = await Product.findByIdAndUpdate(request.params.id, product, { new: true, runValidators: true }).lean();
  if (!updated) return response.status(404).json({ message: 'Product not found.' });
  response.json(updated);
});

productRoutes.delete('/:id', requireAdmin, async (request, response) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: 'Invalid product id.' });
  const deleted = await Product.findByIdAndDelete(request.params.id);
  if (!deleted) return response.status(404).json({ message: 'Product not found.' });
  response.json({ message: 'Product deleted.' });
});
