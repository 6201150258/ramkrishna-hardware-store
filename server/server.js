import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { orderRoutes } from './routes/orderRoutes.js';
import { productRoutes } from './routes/productRoutes.js';
import { adminRoutes } from './routes/adminRoutes.js';
import { Product } from './models/Product.js';
import { defaultProducts } from './data/defaultProducts.js';

const app = express();
const port = process.env.PORT || 5000;
let reconnectTimer;

app.use(cors());
app.use(express.json({ limit: '8mb' }));
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);

const connectToMongo = async () => {
  if (!process.env.MONGODB_URI || mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected.');
    if (await Product.countDocuments() === 0) await Product.insertMany(defaultProducts);
    clearInterval(reconnectTimer);
  } catch (error) {
    console.error('MongoDB connection failed. Retrying in 15 seconds.', error.message);
  }
};

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1;
  response.status(connected ? 200 : 503).json({ ok: connected, database: connected ? 'connected' : 'not connected' });
});

app.listen(port, async () => {
  console.log(`API server running at http://localhost:${port}`);
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is missing. Add it to .env to enable MongoDB orders.');
    return;
  }
  await connectToMongo();
  reconnectTimer = setInterval(connectToMongo, 15000);
});
